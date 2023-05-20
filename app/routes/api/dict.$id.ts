import type { DictionaryID } from '@/lib/DictionaryID'
import { getDictionary } from '@/lib/infojobs.api.server'
import type { LoaderArgs} from '@remix-run/node'
import { json } from '@remix-run/node'

export async function loader({ params, request }: LoaderArgs) {
  const url = new URL(request.url)
  const query = url.searchParams.get("q") || undefined
  const parent = Number(url.searchParams.get("parent"))
  const id = params.id as DictionaryID

  const items = await getDictionary(id, query, parent)
  return json(items, {
    headers: {
      'Cache-control': 'max-age=30'
    }
  })  
}