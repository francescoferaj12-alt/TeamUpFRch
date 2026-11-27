create policy "Community announcement visibility" on public.annonces as restrictive for select to authenticated using(private.community_visible(author_id));
create or replace function public.browse_community_feed(p_kind text default 'all',p_query text default '',p_page integer default 0,p_id uuid default null) returns jsonb language sql stable security invoker set search_path='' as $$
 with feed as (
 select 'annonce' as kind,a.id,a.created_at,to_jsonb(a) as content from public.annonces a where (p_id is null or a.id=p_id) and a.status='active' and coalesce(a.last_confirmed_at,a.created_at)>now()-interval '30 days' and p_kind in ('all','annonce') and (left(p_query,120)='' or a.title ilike '%'||left(p_query,120)||'%' or a.body ilike '%'||left(p_query,120)||'%')
 union all
 select 'publication',p.id,p.created_at,to_jsonb(p) from public.community_posts p where (p_id is null or p.id=p_id) and p_kind in ('all','publication') and (left(p_query,120)='' or p.body ilike '%'||left(p_query,120)||'%')
 ), page as (select * from feed order by created_at desc,id desc,kind limit 24 offset greatest(0,least(p_page,10000))*24)
 select jsonb_build_object('items',coalesce((select jsonb_agg(to_jsonb(page) order by created_at desc,id desc,kind) from page),'[]'::jsonb),'total',(select count(*) from feed));
$$;
revoke all on function public.browse_community_feed(text,text,integer,uuid) from public,anon;
grant execute on function public.browse_community_feed(text,text,integer,uuid) to authenticated;
