'use client'
import Link from 'next/link'
import {useEffect,useState} from 'react'
import {useAuth} from '../../lib/auth-context'
import {useLang} from '../../lib/lang-context'
import {supabase} from '../../lib/supabase'
import {usePathname} from 'next/navigation'
export default function NotificationBell(){const {session}=useAuth(),{lang}=useLang(),pathname=usePathname();const uid=session?.user.id;const [count,setCount]=useState(0)
 useEffect(()=>{let active=true;setCount(0);if(!uid)return;async function check(){if(document.visibilityState!=='visible')return;const {count,error}=await supabase.from('member_notifications').select('id',{count:'exact',head:true}).eq('recipient_id',uid!).is('read_at',null);if(active&&!error)setCount(count||0)}void check();const timer=setInterval(()=>void check(),60000);window.addEventListener('focus',check);window.addEventListener('community-notifications-read',check);return()=>{active=false;clearInterval(timer);window.removeEventListener('focus',check);window.removeEventListener('community-notifications-read',check)}},[uid,pathname])
 if(!session)return null
 return <Link href="/notifications" className="community-bell" aria-label={`${lang==='de'?'Benachrichtigungen':'Notifications'}${count?` (${count})`:''}`}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>{count>0&&<span>{count>99?'99+':count}</span>}</Link>
}
