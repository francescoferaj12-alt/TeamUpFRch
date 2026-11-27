'use client'
import {useEffect,useState} from 'react'
import {useAuth} from '../../lib/auth-context'
import {useLang} from '../../lib/lang-context'
import {supabase} from '../../lib/supabase'
import {availabilityLabels,Availability} from '../../lib/community'
export default function AvailabilityStatus({memberId,editable=false}:{memberId:string;editable?:boolean}){
 const {session,profile,refreshProfile}=useAuth(),{lang}=useLang();const de=lang==='de',own=editable&&session?.user.id===memberId
 const [status,setStatus]=useState<Availability|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(false)
 useEffect(()=>{let active=true;supabase.from(own?'profiles':'public_profiles').select('availability_status,available').eq('id',memberId).maybeSingle().then(({data,error})=>{if(active){setError(!!error);if(data)setStatus(data.availability_status|| (data.available?'seeking':'settled'))}});return()=>{active=false}},[memberId,own,profile?.available,profile?.availability_status])
 async function save(value:Availability){setBusy(true);setError(false);try{const {data,error}=await supabase.from('profiles').update({availability_status:value}).eq('id',memberId).select('availability_status').maybeSingle();if(error||!data)setError(true);else{setStatus(value);await refreshProfile()}}catch{setError(true)}finally{setBusy(false)}}
 if(!status&&!error)return null
 return <div className="community-availability">{own?<label>{de?'Meine Situation':'Ma situation'} <select value={status||''} disabled={busy} onChange={e=>void save(e.target.value as Availability)}>{Object.entries(availabilityLabels).map(([key,label])=><option key={key} value={key}>{label[lang]}</option>)}</select></label>:status&&<span>{availabilityLabels[status][lang]}</span>}{error&&<p role="alert">{de?'Status konnte nicht geladen oder gespeichert werden.':'Impossible de charger ou d’enregistrer la situation.'}</p>}</div>
}
