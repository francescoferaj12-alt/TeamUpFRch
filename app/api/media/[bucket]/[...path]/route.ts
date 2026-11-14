import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mediaPath, parseProfileMedia } from '../../../../../lib/profile-media'
import { mediaHeaders, mediaReader, mediaToken, sameOrigin } from '../../../../../lib/media-server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'
const reply=(error:string,status:number)=>NextResponse.json({error},{status,headers:mediaHeaders})
type Context={params:Promise<{bucket:string;path:string[]}>}
async function serve(req:NextRequest,ctx:Context) {
  if (!sameOrigin(req)) return reply('FORBIDDEN',403)
  const token=mediaToken(req)
  if (!token) return reply('UNAUTHORIZED',401)
  const {bucket,path}=await ctx.params
  const media=mediaPath(bucket,path)
  if (!media) return reply('NOT_FOUND',404)
  const range=req.headers.get('range')
  if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) return reply('INVALID_RANGE',416)
  const project=process.env.NEXT_PUBLIC_SUPABASE_URL, secret=process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!project || !secret) return reply('UNAVAILABLE',503)
  try {
    const reader=await mediaReader(token)
    if (!reader) return reply('UNAUTHORIZED',401)
    const admin=createClient(project,secret,{auth:{persistSession:false,autoRefreshToken:false}})
    if (reader.id!==media.owner && !reader.admin) {
      const {data:profile,error}=await admin.from('profiles').select('hidden,role,club_verification_status,avatar_url,video1_url,video2_url,video3_url').eq('id',media.owner).maybeSingle()
      if (error) return reply('UNAVAILABLE',503)
      const fields:('avatar_url'|'video1_url'|'video2_url'|'video3_url')[]=bucket==='avatars'?['avatar_url']:['video1_url','video2_url','video3_url']
      const referenced=profile && fields.some(key=>{
        const stored=parseProfileMedia(profile[key] || '',project)
        return stored?.bucket===media.bucket && stored.path===media.path
      })
      if (!profile || profile.hidden || (profile.role==='club' && profile.club_verification_status!=='approved') || !referenced) return reply('NOT_FOUND',404)
    }
    // Fixed origin and validated path only; never redirect to a signed/bearer URL.
    const url=new URL(`/storage/v1/object/authenticated/${media.bucket}/${media.path.split('/').map(encodeURIComponent).join('/')}`,project)
    const upstream=await fetch(url,{method:req.method==='HEAD'?'HEAD':'GET',headers:{apikey:secret,Authorization:`Bearer ${secret}`,...(range?{Range:range}:{})},cache:'no-store',redirect:'error',signal:req.signal})
    if (![200,206,416].includes(upstream.status)) { await upstream.body?.cancel(); return reply('NOT_FOUND',404) }
    const headers=new Headers(mediaHeaders)
    for (const key of ['content-type','content-length','content-range','accept-ranges']) {
      const value=upstream.headers.get(key);if(value)headers.set(key,value)
    }
    const mime=headers.get('content-type') || ''
    if (upstream.status!==416 && !(bucket==='avatars'?/^image\/(?:jpeg|png|webp|gif|avif)(?:;|$)/i:/^video\//i).test(mime)) {
      await upstream.body?.cancel(); return reply('UNSUPPORTED_MEDIA',415)
    }
    return new Response(req.method==='HEAD'?null:upstream.body,{status:upstream.status,headers})
  } catch { return reply('UNAVAILABLE',503) }
}
export const GET=serve
export const HEAD=serve
