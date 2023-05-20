import { Form, useRouteLoaderData, useSearchParams } from '@remix-run/react'
import type { DictionaryID } from '@/lib/DictionaryID'
import { GlobeAltIcon, GlobeEuropeAfricaIcon, HashtagIcon, HomeIcon, TagIcon } from '@heroicons/react/20/solid'
import captialize from '@/lib/captialize'
import type { OfferPageData } from '@/lib/infojobs.api.server'
import { LocalComboBox } from './LocalComboBox'
import Select from './Select'

type SelectItem = { label: string; value: string }

// function getParentDictID(id: DictionaryID): DictionaryID | null {
//   switch (id) {
//     case 'province':
//       return 'country'
//     case 'city':
//       return 'province'
//     case 'country':
//       return 'city'
//     case 'subcategory':
//       return 'category'
//     case 'study-detail':
//       return 'study'
//     default:
//       return null
//   }
// }

// function getParentFromURL(id: DictionaryID, params: URLSearchParams) {
//   const parentId = getParentDictID(id)
//   if (!parentId) return null
//   return params.get(parentId)
// }

function kebabCaseToCamelCase(text: string) {
  return text.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

function camelCaseToKebabCase(text: string) {
  return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function useDictionaryOptions(id: DictionaryID) {
  const { facets } = useRouteLoaderData('routes/index') as OfferPageData
  const facet = facets.find(f => f.key === kebabCaseToCamelCase(id))
  const options = facet?.values.map((v) => ({ label: v.value, value: v.key })) || []
  return { options, name: facet?.name || captialize(id) }
}

function DictionarySelectSingle({ id }: { id: DictionaryID }) {
  const { options, name } = useDictionaryOptions(id)
  const [params, setParams] = useSearchParams()
  const selectedId = params.get(id)
  const selected = options.find((item) => item.value === selectedId)

  const iconMap = {
    country: <GlobeAltIcon className='w-5 h-5' />,
    province: <GlobeEuropeAfricaIcon className='w-5 h-5' />,
    city: <HomeIcon className='w-5 h-5' />,
    category: <HashtagIcon className='w-5 h-5' />,
    subcategory: <TagIcon className='w-5 h-5' />,
  } as Record<DictionaryID, JSX.Element>

  const icon = iconMap[id]

  function onSelect(item: SelectItem) {
    setParams(prev => {
      prev.delete(id)
      if (item?.value) {
        prev.append(id, item.value)
      }
      return prev
    })
  }

  return (
    <div className='w-60'>
      <Select<SelectItem>
        name={id}
        placeholder={name}
        icon={icon}
        options={options}
        value={selected}
        onSelect={onSelect}
      />
    </div>
  )
}

function DictionarySelect({ id }: { id: DictionaryID }) {
  const { options, name } = useDictionaryOptions(id)
  const [params, setParams] = useSearchParams()
  const selectedIds = params.getAll(id)
  const selected = options.filter((item) => selectedIds.includes(item.value))

  const iconMap = {
    country: <GlobeAltIcon className='w-5 h-5' />,
    province: <GlobeEuropeAfricaIcon className='w-5 h-5' />,
    city: <HomeIcon className='w-5 h-5' />,
    category: <HashtagIcon className='w-5 h-5' />,
    subcategory: <TagIcon className='w-5 h-5' />,
  } as Record<DictionaryID, JSX.Element>

  const icon = iconMap[id]

  function onSelect(items: SelectItem[]) {
    setParams(prev => {
      prev.delete(id)
      const cleanItems = items.filter(item => item.value)
      if (cleanItems.length) {
        cleanItems.forEach(item => {
          prev.append(id, item?.value || '')
        })
      }
      return prev
    })
  }

  return (
    <div className='w-60'>
      <LocalComboBox<SelectItem>
        name={id}
        placeholder={name}
        icon={icon}
        options={options}
        value={selected}
        onSelect={onSelect}
      />
    </div>
  )
}

const facetConfig = [
  { id: 'country', multiple: false },
  { id: 'province', multiple: true },
  { id: 'city', multiple: true },
  { id: 'category', multiple: true },
  { id: 'subcategory', multiple: true },
  { id: 'salary-period', multiple: false },
  { id: 'study', multiple: false },
  { id: 'contract-type', multiple: false },
  { id: 'workday', multiple: false },
  { id: 'teleworking', multiple: true }
] as { id: DictionaryID, multiple: boolean }[]

export default function MapTopLeft() {
  const { facets } = useRouteLoaderData('routes/index') as OfferPageData
  const facetKeys = facets.map(f => camelCaseToKebabCase(f.key))
  const availableFacets = facetConfig.filter(f => facetKeys.includes(f.id))

  return (
    <header className='absolute z-10 top-0 inset-x-0 p-2'>
      <Form className='flex flex-col flex-wrap items-start justify-start gap-2'>
        {availableFacets.map(({ id, multiple }) => {
          return multiple
            ? <DictionarySelect id={id} key={id} />
            : <DictionarySelectSingle id={id} key={id} />
        })}
      </Form>
    </header>
  )
}
