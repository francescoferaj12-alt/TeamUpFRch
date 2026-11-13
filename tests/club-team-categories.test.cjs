const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const {renderToStaticMarkup} = require('react-dom/server')
function load(file) {
  if(file.endsWith('.json')) return JSON.parse(fs.readFileSync(file,'utf8'))
  const mod={exports:{}}
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText
  const localRequire=name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts')):require(name)
  new Function('module','exports','require',code)(mod,mod.exports,localRequire)
  return mod.exports
}
const model=load(path.resolve(__dirname,'../lib/club-team-categories.ts'))
const component=load(path.resolve(__dirname,'../components/ClubTeamCategories.tsx'))
test('legacy category values survive edits and duplicate stored values display once',()=>{
 const values=model.parseClubCategories('cat_seniors_h, cat_juniors_d, Section adaptée,cat_seniors_h')
 assert.deepEqual(values,['cat_seniors_h','cat_juniors_d','Section adaptée'])
 assert.deepEqual(model.toggleClubCategory(values,'cat_ff17'),[...values,'cat_ff17'])
 assert.deepEqual(model.toggleClubCategory([...values,'cat_ff17'],'cat_ff17'),values)
 assert.equal(model.clubCategoryLabel('Section adaptée','de'),'Section adaptée')
})
test('club teams display the same localized labels for existing and new women and youth categories',()=>{
 for(const lang of ['fr','de']){
  const html=renderToStaticMarkup(React.createElement(component.default,{lang,value:'cat_seniors_f,cat_ff17,cat_juniors_e,cat_30'}))
  assert.match(html,lang==='fr'?/Équipes du club/:/Teams des Vereins/)
  assert.match(html,lang==='fr'?/Actives femmes/:/Aktive Frauen/)
  assert.match(html,lang==='fr'?/Juniores FF-17/:/Juniorinnen FF-17/)
  assert.match(html,lang==='fr'?/Juniors E/:/Junioren E/)
  assert.doesNotMatch(html,/cat_seniors_f|cat_ff17|cat_juniors_e|cat_30/)
 }
})
test('the picker supports multiple simultaneous categories with accessible checked controls',()=>{
 const html=renderToStaticMarkup(React.createElement(component.ClubTeamCategoryPicker,{lang:'de',value:['cat_seniors_f','cat_ff17','cat_juniors_e'].map(category=>({category,level:''})),onChange(){}}))
 assert.equal((html.match(/checked=""/g)||[]).length,3)
 assert.match(html,/type="checkbox"/)
 assert.match(html,/Junioren G/)
 assert.match(html,/Juniorinnen FF-21/)
 assert.doesNotMatch(html,/Équipes adultes|Juniores féminines|Coche toutes/)
})

test('category levels round-trip together without losing old categories or changing other levels',()=>{
 let teams=model.parseClubTeams('cat_seniors_h,cat_juniors_b,cat_seniors_f')
 assert.deepEqual(teams.map(team=>team.level),['','',''])
 teams=model.setClubTeamLevel(teams,'cat_seniors_h','league3')
 teams=model.setClubTeamLevel(teams,'cat_juniors_b','degree1')
 teams=model.setClubTeamLevel(teams,'cat_seniors_f','league2')
 assert.deepEqual(model.parseClubTeams(model.serializeClubTeams(teams)),teams)
 assert.deepEqual(model.parseClubCategories(model.serializeClubTeams(teams)),['cat_seniors_h','cat_juniors_b','cat_seniors_f'])
 assert.equal(model.setClubTeamLevel(teams,'cat_juniors_b','degree2')[0].level,'league3')
 assert.equal(model.serializeClubTeams([{category:'cat_juniors_b',level:''}]),'cat_juniors_b')
 assert.deepEqual(model.parseClubTeams('{bad json'),[])
})
test('each selected category displays its own level in French and German',()=>{
 const value=model.serializeClubTeams([{category:'cat_seniors_h',level:'league3'},{category:'cat_juniors_b',level:'degree1'},{category:'cat_seniors_f',level:'league2'}])
 const de=renderToStaticMarkup(React.createElement(component.default,{lang:'de',value}))
 assert.match(de,/Aktive Männer/)
 assert.match(de,/3\. Liga/)
 assert.match(de,/1\. Stärkeklasse/)
 const fr=renderToStaticMarkup(React.createElement(component.default,{lang:'fr',value}))
 assert.match(fr,/3e ligue/)
 assert.match(fr,/1er degré/)
 const picker=renderToStaticMarkup(React.createElement(component.ClubTeamCategoryPicker,{lang:'de',value:model.parseClubTeams(value),onChange(){}}))
 assert.equal((picker.match(/<select /g)||[]).length,3)
 assert.match(picker,/Spielklasse — Junioren B/)
 assert.doesNotMatch(picker,/Niveau|Choisir|1er degré/)
})

test('juniors A B and C can select Youth League as their own level alongside the first degree',()=>{for(const category of ['cat_juniors_a','cat_juniors_b','cat_juniors_c']){const choices=model.clubTeamLevels(category);assert.ok(choices.some(level=>level.key==='youth'));assert.ok(choices.some(level=>level.key==='degree1'));}assert.ok(!model.clubTeamLevels('cat_juniors_e').some(level=>level.key==='youth'));const teams=[{category:'cat_juniors_a',level:'degree1'},{category:'cat_juniors_b',level:'youth'}];assert.deepEqual(model.parseClubTeams(model.serializeClubTeams(teams)),teams)});
