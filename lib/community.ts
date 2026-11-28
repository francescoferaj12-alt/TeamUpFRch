export type CommunityAuthor={id:string;role:string;first_name?:string;last_name?:string;club_name?:string;avatar_url?:string;verified?:boolean}
export type CommunityPost={id:string;author_id:string;body:string;media_kind:'image'|'video';media_path:string;created_at:string;author?:CommunityAuthor}
export function communityName(p?:CommunityAuthor){return p?.role==='club'?p.club_name||'Club':`${p?.first_name||''} ${p?.last_name||''}`.trim()}
export const COMMUNITY_VIDEO_LIMIT=50*1024*1024
export const COMMUNITY_IMAGE_LIMIT=20*1024*1024
export function communityFileError(file:{size:number;type:string}){if(!file.size||file.size>(file.type==='video/mp4'?COMMUNITY_VIDEO_LIMIT:COMMUNITY_IMAGE_LIMIT))return 'size';if(!['image/jpeg','image/png','image/webp','video/mp4'].includes(file.type))return 'format';return null}
export type Availability='settled'|'open'|'seeking'
export const availabilityLabels:Record<Availability,{fr:string;de:string}>={settled:{fr:'Bien dans mon club',de:'Zufrieden in meinem Verein'},open:{fr:'À l’écoute d’opportunités',de:'Offen für Angebote'},seeking:{fr:'Recherche un club',de:'Auf Vereinssuche'}}
