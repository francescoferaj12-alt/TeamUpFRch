import {NextRequest,NextResponse} from 'next/server'
import {communityMember,communityUuid,communityHeaders} from '../../../../../lib/community-server'
export const dynamic='force-dynamic'
export const maxDuration=60
async function serve(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const error=(error:string,status:number)=>NextResponse.json({error},{status,headers:communityHeaders})
 const {id}=await params;if(!communityUuid.test(id))return error('NOT_FOUND',404)
 const range=req.headers.get('range');if(range&&!/^bytes=(?:\d+-\d*|-\d+)$/.test(range))return error('INVALID_RANGE',416)
 try{
  const member=await communityMember(req);if(!member)return error('UNAUTHORIZED',401)
  const {data:post,error:readError}=await member.db.from('community_posts').select('author_id,media_path,media_kind').eq('id',id).maybeSingle()
  if(readError)return error('UNAVAILABLE',503)
  if(!post)return error('NOT_FOUND',404)
  const expected=`${post.author_id}/${id}/${post.media_kind==='image'?'photo.jpg':'video.mp4'}`
  if(post.media_path!==expected)return error('NOT_FOUND',404)
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,project=process.env.NEXT_PUBLIC_SUPABASE_URL
  if(!key||!project)return error('UNAVAILABLE',503)
  const upstream=await fetch(new URL(`/storage/v1/object/authenticated/community-media/${expected}`,project),{method:req.method==='HEAD'?'HEAD':'GET',headers:{apikey:key,Authorization:`Bearer ${member.token}`,...(range?{Range:range}:{})},cache:'no-store',redirect:'error',signal:req.signal})
  if(![200,206,416].includes(upstream.status)){await upstream.body?.cancel();return error('NOT_FOUND',404)}
  const headers=new Headers(communityHeaders)
  for(const key of ['content-type','content-length','content-range','accept-ranges']){const value=upstream.headers.get(key);if(value)headers.set(key,value)}
  if(upstream.status!==416&&!(post.media_kind==='image'?/^image\/jpeg(?:;|$)/i:/^video\/mp4(?:;|$)/i).test(headers.get('content-type')||'')){await upstream.body?.cancel();return error('UNSUPPORTED_MEDIA',415)}
  return new Response(req.method==='HEAD'?null:upstream.body,{status:upstream.status,headers})
 }catch{return error('UNAVAILABLE',503)}
}
export const GET=serve
export const HEAD=serve
