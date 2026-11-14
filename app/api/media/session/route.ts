import { NextRequest, NextResponse } from 'next/server'
import { mediaCookie, mediaHeaders, mediaReader, sameOrigin } from '../../../../lib/media-server'
const reply = (error:string,status:number) => NextResponse.json({error},{status,headers:mediaHeaders})
export async function POST(req:NextRequest) {
  if (!sameOrigin(req)) return reply('FORBIDDEN',403)
  const token = req.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token || token.length > 3800) return reply('UNAUTHORIZED',401)
  try {
    if (!await mediaReader(token)) return reply('UNAUTHORIZED',401)
    const res = NextResponse.json({ok:true},{headers:mediaHeaders})
    res.cookies.set(mediaCookie(req),token,{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:3600})
    return res
  } catch { return reply('UNAVAILABLE',503) }
}
export async function DELETE(req:NextRequest) {
  if (!sameOrigin(req)) return reply('FORBIDDEN',403)
  const res=NextResponse.json({ok:true},{headers:mediaHeaders})
  res.cookies.set(mediaCookie(req),'',{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:0})
  return res
}
