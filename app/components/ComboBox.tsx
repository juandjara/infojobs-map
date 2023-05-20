import type { MutableRefObject} from 'react'
import { Fragment } from 'react'
import { Combobox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import Spinner from './Spinner'
import { inputCN, focusWithinCN } from '@/lib/styles'

export type ComboBoxProps<T> = {
  inputRef?: MutableRefObject<HTMLInputElement | null>,
  name: string
  loading?: boolean
  options: T[]
  onSelect?: (opt: T[]) => void
  onSearch: (q: string) => void
  labelKey?: keyof T
  valueKey?: keyof T
  value?: T[]
  placeholder?: string
  icon?: JSX.Element
}

const optionsWrapperCN = [
  'absolute z-30',
  'mt-1 py-1 max-h-60 w-full',
  'bg-white dark:bg-slate-700',
  'text-slate-700 dark:text-slate-100',
  'overflow-auto rounded-md text-base shadow-lg',
  'ring-1 ring-black ring-opacity-5 focus:outline-none'
].join(' ')

export default function ComboBox<T>({
  inputRef,
  name,
  loading,
  options,
  onSearch,
  onSelect,
  labelKey = 'label' as any,
  valueKey = 'value' as any,
  value,
  placeholder,
  icon
}: ComboBoxProps<T>) {
  return (
    <Combobox
      name={name}
      value={value}
      onChange={onSelect}
      multiple
      nullable
    >
      <div className="relative">
        <div className={`${inputCN} ${focusWithinCN}`}>
          <div className='absolute left-2 top-1/2 transform -translate-y-1/2'>
            {icon}
          </div>
          <Combobox.Input
            ref={inputRef}
            placeholder={placeholder}
            className="rounded-md py-2 pl-8 pr-10 w-full bg-transparent border-none focus:ring-0"
            onChange={(event) => onSearch(event.target.value)}
            displayValue={(value: T[]) => value.map(v => String(v?.[labelKey] || '')).join(', ')}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            {loading ? (
              <Spinner />
            ) : (
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            )}
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => onSearch('')}
        >
          <Combobox.Options className={optionsWrapperCN}>
            {options.length === 0 && !loading ? (
              <div className="relative cursor-default select-none py-2 px-4">
                Nothing found.
              </div>
            ) : (
              options.map((opt) => (
                <Combobox.Option
                  key={String(opt[valueKey])}
                  className={({ active }) => [
                    'relative cursor-default select-none py-2 pr-10 pl-4',
                    active ? 'bg-slate-100 dark:bg-slate-600' : ''
                  ].join(' ')}
                  value={opt}
                >
                  {({ selected, active }) => (
                    <>
                      <span
                        title={String(opt[labelKey])}
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {String(opt[labelKey])}
                      </span>
                      {selected ? (
                        <span className='absolute inset-y-0 right-0 flex items-center pr-3'>
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}
