import {NextRequest,NextResponse} from 'next/server'
import {communityMember,communityUuid,communityHeaders} from '../../../../../lib/community-server'
import {sameOrigin} from '../../../../../lib/media-server'
export async function DELETE(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const reply=(error:string,status:number)=>NextResponse.json({error},{status,headers:communityHeaders})
 if(!sameOrigin(req))return reply('FORBIDDEN',403)
 const {id}=await params;if(!communityUuid.test(id))return reply('NOT_FOUND',404)
 try{
 const member=await communityMember(req);if(!member)return reply('UNAUTHORIZED',401)
 const {data:post,error}=await member.db.from('community_posts').select('media_path,author_id').eq('id',id).eq('author_id',member.id).maybeSingle()
 if(error)return reply('UNAVAILABLE',503)
 if(!post)return reply('NOT_FOUND',404)
 if(!post.media_path.startsWith(`${member.id}/${id}/`))return reply('NOT_FOUND',404)
 const removed=await member.db.storage.from('community-media').remove([post.media_path]);if(removed.error)return reply('MEDIA_DELETE_FAILED',502)
 const deleted=await member.db.from('community_posts').delete().eq('id',id).eq('author_id',member.id).select('id').maybeSingle()
 if(deleted.error||!deleted.data)return reply('POST_DELETE_FAILED',502)
 return NextResponse.json({deleted:true},{headers:communityHeaders})
 }catch{return reply('UNAVAILABLE',503)}
}
