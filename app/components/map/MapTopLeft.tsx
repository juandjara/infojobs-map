import type { DictionaryID } from '@/lib/DictionaryID'
import type { RootData } from '@/routes'
import { Form, useRouteLoaderData, useSearchParams } from '@remix-run/react'
import { GlobeAltIcon, GlobeEuropeAfricaIcon, HashtagIcon, HomeIcon, TagIcon } from '@heroicons/react/24/outline'
import { LocalComboBox } from '../LocalComboBox'
import Select from '../Select'
import facetConfig from '@/lib/facetConfig'
import { capitalize, camelCaseToKebabCase, kebabCaseToCamelCase } from '@/lib/casing'

type SelectItem = { label: string; value: string }

function useDictionaryOptions(id: DictionaryID) {
  const { offers } = useRouteLoaderData('routes/index') as RootData
  const facet = offers.facets.find(f => f.key === kebabCaseToCamelCase(id))
  const options = facet?.values.map((v) => ({ label: v.value, value: v.key })) || []
  return { options, name: facet?.name || capitalize(id) }
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
    category: <HashtagIcon className='w-5 h-5' />
  } as Record<DictionaryID, JSX.Element>

  const icon = iconMap[id] || <TagIcon className='w-5 h-5' />

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
    category: <HashtagIcon className='w-5 h-5' />
  } as Record<DictionaryID, JSX.Element>

  const icon = iconMap[id] || <TagIcon className='w-5 h-5' />

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

export default function MapTopLeft() {
  const { offers } = useRouteLoaderData('routes/index') as RootData
  const facetKeys = offers.facets.map(f => camelCaseToKebabCase(f.key))
  const availableFacets = facetConfig.filter(f => facetKeys.includes(f.id))

  return (
    <header className='absolute z-10 top-0 left-0 p-2'>
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
