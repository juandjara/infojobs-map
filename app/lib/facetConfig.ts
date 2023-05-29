import type { DictionaryID } from "./DictionaryID"

 const facetConfig = [
  { id: 'country', multiple: false },
  { id: 'province', multiple: true },
  { id: 'city', multiple: true },
  { id: 'category', multiple: true },
  { id: 'subcategory', multiple: true },
  { id: 'salary-period', multiple: false },
  { id: 'study', multiple: false },
  { id: 'contract-type', multiple: true },
  { id: 'workday', multiple: false },
  { id: 'teleworking', multiple: true }
] as { id: DictionaryID, multiple: boolean }[]

export default facetConfig
