import { footballLabel } from './football-labels'

type Search = { query: string; ligue: string; zone: string; position: string; author_type: string }
type Listing = {
  title: string
  body: string
  author_name: string
  ligue: string | null
  zone: string | null
  position?: string | null
  author_type: string
}

export function matchesAnnonce(search: Search, listing: Listing) {
  const query = search.query.trim().toLocaleLowerCase()
  return (!search.ligue || search.ligue === listing.ligue)
    && (!search.zone || search.zone === listing.zone)
    && (!search.position || search.position === listing.position)
    && (!search.author_type || search.author_type === listing.author_type)
    && (!query || [listing.title, listing.body, listing.author_name,...[listing.position,listing.ligue,listing.zone].filter((v):v is string=>!!v).flatMap(value=>[value,footballLabel(value,'de')])]
      .some(text => text?.toLocaleLowerCase().includes(query)))
}
