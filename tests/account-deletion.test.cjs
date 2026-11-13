const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
const root=path.resolve(__dirname,'..');const uid='00000000-0000-4000-8000-000000000001';
function load(file,mocks={}){const source=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const module={exports:{}};vm.runInNewContext(source,{module,exports:module.exports,URL,Date,console,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-only'}},require(name){if(name in mocks)return mocks[name];if(name.endsWith('/account-deletion'))return load('lib/account-deletion.ts');return require(name)}});return module.exports}
function request(body={confirmation:'DELETE'},token='test-token',origin){return new Request('https://teamupfr.ch/api/account/delete',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`} : {}),...(origin?{Origin:origin}:{})},body:JSON.stringify(body)})}
function handler(options={}) {
 const calls=[];
 const files=new Map(['avatars','videos','message-files'].map(bucket=>[bucket,new Map([[uid,[{id:'file-1',name:'test.mp4'}]]])]));
 const admin={
  auth:{
   getUser:async()=>({data:{user:options.unauth?null:{id:uid,email:options.owner?'teamupfr.ch@gmail.com':'test@example.com',email_confirmed_at:new Date().toISOString(),last_sign_in_at:options.old?'2020-01-01':new Date().toISOString()}},error:null}),
   admin:{
    signOut:async(token,scope)=>{calls.push(['signOut',token,scope]);return{error:options.signOutError?{}:null}},
    updateUserById:async(id,fields)=>{calls.push(['lock',id,fields.ban_duration]);return{error:null}},
    deleteUser:async(id,soft)=>{calls.push(['deleteUser',id,soft]);return{error:options.authDeleteError?{}:null}}
   }
  },
  rpc:async name=>{calls.push(['ready',name]);return{data:!options.notReady,error:null}},
  storage:{
   from(bucket){
    assert.ok(files.has(bucket));
    return{
     list:async(folder,args)=>{calls.push(['list',bucket,folder]);if(options.listError)return{data:null,error:{}};return{data:(files.get(bucket).get(folder)||[]).slice(0,args.limit),error:null}},
     remove:async paths=>{
      for(const file of paths){assert.ok(file.startsWith(uid+'/'));const pos=file.lastIndexOf('/');const folder=file.slice(0,pos),name=file.slice(pos+1);files.get(bucket).set(folder,(files.get(bucket).get(folder)||[]).filter(f=>f.name!==name))}
      calls.push(['remove',bucket,Array.from(paths)]);return{error:null}
     }
    }
   }
  }
 };
 return{calls,files,admin,...load('app/api/account/delete/route.ts',{'@supabase/supabase-js':{createClient:()=>admin}})};
}
test('account deletion requires a bearer session and an explicit confirmation; a supplied account ID is rejected',async()=>{for(const [body,token,status] of [[{confirmation:'DELETE'},null,401],[{},'token',400],[{confirmation:'DELETE',id:'someone-else'},'token',400]]){const api=handler();assert.equal((await api.POST(request(body,token))).status,status);assert.equal(api.calls.length,0)}const api=handler();assert.equal((await api.POST(request(undefined,'token','https://evil.example'))).status,403);assert.equal(api.calls.length,0)});
test('expired sign-in, invalid identity and owner account cannot reach destructive calls',async()=>{for(const [opts,status]of [[{old:true},401],[{unauth:true},401],[{owner:true},409]]){const api=handler(opts);assert.equal((await api.POST(request())).status,status);assert.equal(api.calls.length,0)}});
test('missing deployed storage guard or failed session revocation prevents every media deletion',async()=>{for(const opts of [{notReady:true},{signOutError:true}]){const api=handler(opts);assert.equal((await api.POST(request())).status,503);assert.ok(!api.calls.some(c=>['remove','lock','deleteUser'].includes(c[0])))}});
test('successful deletion revokes sessions, blocks uploads, removes only own media and then deletes Auth with live FK cascades',async()=>{const api=handler();assert.equal((await api.POST(request())).status,200);assert.equal(api.calls[1][0],'signOut');assert.equal(api.calls[2][0],'lock');assert.equal(api.calls[2][2],'24h');assert.ok(api.calls.some(c=>c[0]==='remove'&&c[1]==='message-files'));assert.deepEqual(api.calls.at(-1),['deleteUser',uid,false]);for(const folders of api.files.values())assert.equal(folders.get(uid).length,0)});
test('listing failure never reports deletion success or deletes Auth and releases the temporary account lock',async()=>{const api=handler({listError:true});const result=await api.POST(request());assert.equal(result.status,502);assert.equal((await result.json()).error,'CLEANUP_INCOMPLETE');assert.ok(!api.calls.some(c=>c[0]==='deleteUser'));assert.deepEqual(api.calls.at(-1),['lock',uid,'none'])});
test('Auth deletion failure is reported as incomplete and never as success',async()=>{const api=handler({authDeleteError:true});const result=await api.POST(request());assert.equal(result.status,502);assert.deepEqual(api.calls.at(-1),['lock',uid,'none'])});
test('media cleanup drains page zero, so accounts with more than 100 files do not leave skipped pages',async()=>{const api=handler();api.files.get('message-files').set(uid,Array.from({length:205},(_,i)=>({id:String(i),name:`file-${i}.pdf`})));await load('lib/account-deletion.ts').removeAccountMedia(api.admin,uid);assert.equal(api.files.get('message-files').get(uid).length,0);assert.equal(api.calls.filter(c=>c[0]==='remove'&&c[1]==='message-files').length,3)});
test('nested folders are cleaned inside the owner root; malicious path segments fail closed',async()=>{const api=handler();api.files.get('videos').set(uid,[{id:null,name:'nested'}]);api.files.get('videos').set(uid+'/nested',[{id:'n',name:'video.mp4'}]);const original=api.admin.storage.from;api.admin.storage.from=bucket=>{const storage=original(bucket);const list=storage.list;storage.list=async(folder,args)=>{if(folder===uid&&!(api.files.get(bucket).get(uid+'/nested')||[]).length)api.files.get(bucket).set(uid,(api.files.get(bucket).get(uid)||[]).filter(f=>f.name!=='nested'));return list(folder,args)};return storage};await load('lib/account-deletion.ts').removeAccountMedia(api.admin,uid);assert.equal(api.files.get('videos').get(uid+'/nested').length,0);const bad=handler();bad.files.get('videos').set(uid,[{id:'bad',name:'../another-user/file.mp4'}]);await assert.rejects(()=>load('lib/account-deletion.ts').removeAccountMedia(bad.admin,uid),/Unsafe media name/);assert.ok(!bad.calls.some(c=>c[0]==='remove'&&c[1]==='videos'))});
