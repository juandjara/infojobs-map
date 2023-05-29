import type { DictionaryID } from "@/lib/DictionaryID"
import type { OfferDictionary, OfferFacet, OfferItem, OfferPageData } from "@/lib/infojobs.api.server"
import { SIDEBAR_WIDTH } from "@/lib/styles"
import type { RootData } from "@/routes"
import { useRouteLoaderData, useSearchParams } from "@remix-run/react"
import placeholderLogo from '@/assets/pic-company-logo.png'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

function formatNumber(n: number) {
  return n.toLocaleString('es-ES', { maximumFractionDigits: 0 })
}

const hiddenFacets: DictionaryID[] = ['province', 'city', 'teleworking']

function filterFacet(f: OfferFacet, offer: OfferItem) {
  return !hiddenFacets.includes(f.key as DictionaryID) && offer[f.key as keyof typeof offer]
}

function formatFacet(facet: OfferFacet, offer: OfferItem) {
  const value = offer[facet.key as keyof typeof offer]
  if (!value) return null
  let formatted = value
  if ((value as OfferDictionary)?.value) {
    formatted = (value as OfferDictionary)?.value
  }
  if (typeof value === 'number') {
    formatted = formatNumber(value)
  }
  return String(formatted)
}

export default function Sidebar() {
  const { offers } = useRouteLoaderData('routes/index') as RootData
  const [params, setParams] = useSearchParams()
  const defaultQ = params.get('q') || ''

  function selectItem(offer: OfferItem) {
    window.open(offer.link, '_blank', 'noopener')
  }

  return (
    <div className="dark:bg-slate-800 dark:text-white h-screen overflow-y-auto p-3 bg-white w-full" style={{ maxWidth: SIDEBAR_WIDTH }}>
      <header className="sticky -top-3 bg-white dark:bg-slate-800">
        <h1 className="pt-4 mb-2 text-4xl dark:text-gray-100 text-gray-800">InfoJobs Map Viewer</h1>
        <p className="pb-4 text-lg dark:text-gray-300 text-gray-500 font-medium">
          {formatNumber(1 + (offers.pageSize * (offers.currentPage - 1)))}
          {' - '}
          {formatNumber(Math.min(offers.pageSize * offers.currentPage, offers.totalResults))}
          {' de '}
          {formatNumber(offers.totalResults)} ofertas
        </p>
        <form onSubmit={(ev) => {
          const fd = new FormData(ev.currentTarget)
          const q = fd.get('q') as string
          ev.preventDefault()
          setParams(prev => {
            prev.set('q', q)
            prev.delete('page')
            return prev
          })
        }} className="flex items-center pb-2">
          <label htmlFor="simple-search" className="sr-only">Search</label>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
            <input
              type="search"
              id="simple-search"
              name="q"
              defaultValue={defaultQ}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 placeholder:font-medium dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Buscar por palabras clave"
            />
          </div>
        </form>
      </header>
      <ul className="-mx-3 divide-y divide-gray-200 dark:divide-gray-500">
        {offers.items.map(offer => (
          <li key={offer.id} className="hover:bg-gray-100 dark:hover:bg-slate-700">
            <a href={offer.link} target="_blank" rel="noopener noreferrer" className="p-3 block">
              <div className="flex gap-3 items-start justify-start">
                <img
                  className="border border-gray-200 dark:border-gray-500 rounded-md w-20 h-20 bg-gray-300"
                  src={offer.author.logoUrl || placeholderLogo}
                  alt="company logo"
                />
                <div>
                  <p className="">{offer.title}</p>
                  <p className="text-sm text-blue-500">{offer.author.name}</p>
                  <p className="mt-1 text-sm dark:text-gray-300 text-gray-600">
                    <span>{offer.city} ({offer.province.value})</span>
                    {offer?.teleworking ? (
                      <span>{' – '}{offer.teleworking?.value}</span>
                    ) : null}
                  </p>
                </div>
              </div>
              <div className="tags mt-3">
                {offers.facets
                  .filter(f => filterFacet(f, offer))
                  .map(facet => (
                    <span key={facet.key} className="inline-block dark:text-gray-100 dark:bg-slate-600 bg-gray-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2 mb-2">
                      {facet.name}: {formatFacet(facet, offer)}
                    </span>
                  ))}
              </div>
              <p className="m-2 mb-1 text-xs font-medium dark:text-gray-300 text-gray-500">
                {offer.updated ? 'Actualizado el ' : 'Publicado el '}
                {new Date(offer.updated || offer.published).toLocaleString('es', { dateStyle: 'medium' })}
                {' a las '}
                {new Date(offer.updated || offer.published).toLocaleTimeString('es', { timeStyle: 'short' })}
              </p>
            </a>
          </li>
        ))}
      </ul>
      <Paginator offers={offers} />
    </div>
  )
}

function Paginator({ offers }: { offers: OfferPageData }) {
  const setParams = useSearchParams()[1]

  function firstPage() {
    setParams(prev => {
      prev.delete('page')
      return prev
    })
  }
  function lastPage() {
    setParams(prev => {
      prev.set('page', String(offers.totalPages))
      return prev
    })
  }
  function prevPage() {
    setParams(prev => {
      prev.set('page', String(offers.currentPage - 1))
      return prev
    })
  }
  function nextPage() {
    setParams(prev => {
      prev.set('page', String(offers.currentPage + 1))
      return prev
    })
  }

  return (
    <footer className="mt-6 flex items-center gap-3">
      <p className="flex-grow">P&aacute;gina {offers.currentPage} de {offers.totalPages}</p>
      <button
        disabled={offers.currentPage === 1}
        onClick={firstPage}
        aria-label="Primera página"
        title="Primera página"
        className="p-2 rounded-md bg-transparent hover:bg-gray-200 hover:bg-opacity-50"
      >
        <ChevronDoubleLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        disabled={offers.currentPage === 1}
        onClick={prevPage}
        aria-label="Página anterior"
        title="Página anterior"
        className="p-2 rounded-md bg-transparent hover:bg-gray-200 hover:bg-opacity-50"
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        disabled={offers.currentPage === offers.totalPages}
        onClick={nextPage}
        aria-label="Página siguiente"
        title="Página siguiente"
        className="p-2 rounded-md bg-transparent hover:bg-gray-200 hover:bg-opacity-50"
      >
        <ChevronRightIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        disabled={offers.currentPage === offers.totalPages}
        onClick={lastPage}
        aria-label="Última página"
        title="Última página"
        className="p-2 rounded-md bg-transparent hover:bg-gray-200 hover:bg-opacity-50"
      >
        <ChevronDoubleRightIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
    </footer>
  )
}
