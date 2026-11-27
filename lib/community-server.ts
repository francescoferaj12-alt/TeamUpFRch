import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { mediaReader,mediaToken,sameOrigin } from './media-server'
export const communityHeaders={'Cache-Control':'private, no-store','Vary':'Cookie, Authorization','X-Content-Type-Options':'nosniff'}
export const communityUuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export async function communityMember(req:NextRequest) {
 if(!sameOrigin(req))return null
 const token=mediaToken(req);if(!token)return null
 const member=await mediaReader(token);if(!member)return null
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}})
 return {...member,db,token}
}
