// Monitoring must not export authentication material or submitted form bodies.
const privateKey = /^(?:authorization|cookie|cookies|set-cookie|password|password_confirmation|confirmPassword|access_token|refresh_token|token|profileToken|profile_creation_token|secret|apikey|api_key|email|phone|birthdate|first_name|last_name|bio|user)$/i
export function telemetryText(value:string):string {
 return value.replace(/https?:\/\/[^\s<>"']+/g,raw=>{try{const url=new URL(raw);url.search='';url.hash='';url.username='';url.password='';return url.href}catch{return '[url]'}})
  .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,'[token]')
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email]')
  .replace(/([?&#](?:access_token|refresh_token|token|code|password)=)[^&#\s]+/gi,'$1[redacted]')
}
export function sanitizeTelemetry<T>(value:T):T {
 const seen=new WeakSet<object>()
 function visit(item:unknown,key='',depth=0):unknown{
  if(depth>12)return '[omitted]'
  if(typeof item==='string')return telemetryText(item)
  if(item===null||typeof item!=='object')return item
  if(seen.has(item))return '[omitted]';seen.add(item)
  if(Array.isArray(item))return item.map(entry=>visit(entry,key,depth+1))
  const result:Record<string,unknown>={}
  for(const [name,entry] of Object.entries(item)){
   if(privateKey.test(name)||name.toLowerCase()==='headers'||(key==='request'&&['data','body','query_string','env'].includes(name)))continue
   result[name]=visit(entry,name,depth+1)
  }
  return result
 }
 return visit(value) as T
}
