import type { DictionaryID } from "./DictionaryID"

const BASE_URL = 'https://api.infojobs.net/api/9'

async function request<T = any>(path: string, headers: HeadersInit = {}) {
  const res = await fetch(`${BASE_URL}/${path}`, {
    headers: {
      ...headers,
      Authorization: `Basic ${process.env.INFOJOBS_API_KEY}`,  
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error ${res.status} fetching data \n${text}`)
  }

  return res.json() as T
}

type APIDictionary = {
  id: number
  key: string
  order: number
  parent: number
  value: string
}

export async function getDictionary(id: DictionaryID, query?: string, parent?: number) {
  const data = await request<APIDictionary[]>(`/dictionary/${id}?parent=${parent || ''}`)
  return data
    .filter((p) => {
      const queryCondition = query ? p.value.toLowerCase().includes(query.toLowerCase()) : true
      return queryCondition && p.id > 0
    })
    .sort((a, b) => a.order - b.order)
    .map((p) => ({ key: p.key, value: p.id, label: p.value }))
    .slice(0, 100)
}

type OfferOrder = 'updated' | 'updated-desc' | 'title' | 'title-desc' | 'city' | 'city-desc' | 'author' | 'author-desc' | 'relevancia-desc' | 'applicants-asc'
type OfferDateOption = '_24_HOURS' | '_7_DAYS' | '_15_DAYS' | 'ANY'

type OfferSearchParams = {
  q?: string
  country?: string[] // keys from getDictionary('country')
  province?: string[] // keys from getDictionary('province')
  category?: string[] // keys from getDictionary('category')
  subcategory?: string[] // keys from getDictionary('subcategory')
  city?: string[] // keys from getDictionary('city')
  salaryMin?: number
  salaryMax?: number
  employerId?: string
  order?: OfferOrder
  page?: number
  maxResults?: number // default 20, max 50
  facets?: boolean
  sinceDate?: OfferDateOption // when was the offer last published / updated. default ANY
  teleworking?: string[] // keys from getDictionary('teleworking')
}

export type OfferPageData = {
  availableSortingMethods: OfferOrder[]
  currentPage: number
  currentResults: number
  pageSize: number
  totalPages: number
  totalResults: number
  sortBy: OfferOrder
  sinceDate: OfferDateOption
  facets: OfferFacet[]
  items: OfferItem[]
  offers: OfferItem[]
}
export type OfferDictionary = {
  id: number
  value: string
}
export type OfferFacet = {
  key: string // camelCase version of DictionaryID
  name: string // spanish title
  values: OfferFacetValue[]
}
export type OfferFacetValue = {
  count: number
  key: string
  value: string
}
export type OfferItem = {
  applications: string
  author: OfferAuthor
  category: OfferDictionary
  city: string
  contractType: OfferDictionary
  executive: boolean
  experienceMin: OfferDictionary
  id: string
  link: string // URL https://www.infojobs.net/...
  multiProvince: boolean
  province: OfferDictionary
  published: string // ISO JSON date
  requirementMin: string // long text
  salaryDescription: string
  salaryMax: OfferDictionary
  salaryMin: OfferDictionary
  salaryPeriod: OfferDictionary
  study: OfferDictionary
  subcategory: OfferDictionary
  teleworking: OfferDictionary
  title: string
  updated: string // ISO JSON date
  workDay: OfferDictionary
}
type OfferAuthor = {
  corporateResponsive: boolean
  id: string
  name: string
  privateId: number
  showCorporativeHeader: boolean
  logoUrl: string // URL "https://multimedia.infojobs.net/api/..."
  uri: string // URL "https://$company_id.ofertas-trabajo.infojobs.net"
}

function createURLParams(params: Record<string, string | number | boolean | string[]>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.length && value.forEach((v) => v && query.append(key, v))
    } else {
      query.append(key, String(value || ''))
    }
  })
  return query
}

export async function getOffers(params: OfferSearchParams) {
  const query = createURLParams(params)
  console.log(query.toString())
  const data = await request(`/offer?${query.toString()}`)
  return data as OfferPageData
}
