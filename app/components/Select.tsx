import { focusWithinCN, inputCN } from "@/lib/styles"
import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { Fragment } from "react"

type SelectProps<T> = {
  name: string
  options: T[]
  placeholder?: string
  icon?: JSX.Element
  value?: T
  onSelect: (opt: T) => void
  labelKey?: keyof T
  valueKey?: keyof T
}

const optionsWrapperCN = [
  'absolute z-30',
  'mt-1 py-1 max-h-60 w-full',
  'bg-white dark:bg-slate-700',
  'text-slate-700 dark:text-slate-100',
  'overflow-auto rounded-md text-base shadow-lg',
  'ring-1 ring-black ring-opacity-5 focus:outline-none'
].join(' ')

export default function Select<T>({
  name,
  options,
  placeholder,
  icon,
  value,
  onSelect,
  labelKey = 'label' as any,
  valueKey = 'value' as any
}: SelectProps<T>) {
  return (
    <Listbox name={name} value={value || null} onChange={onSelect}>
      <div className="relative">
        <Listbox.Button className={`relative text-left w-full py-2 ${inputCN} ${focusWithinCN}`}>
          <div className='absolute left-2 top-1/2 transform -translate-y-1/2'>
            {icon}
          </div>
          <span className={`pl-8 pr-10 block truncate ${value?.[labelKey] ? '' : 'opacity-70'}`}>
            {String(value?.[labelKey] || placeholder)}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className={optionsWrapperCN}>
            {options.map((opt, idx) => (
              <Listbox.Option
                key={idx}
                className={({ active }) => [
                  'relative cursor-default select-none py-2 pr-10 pl-4',
                  active ? 'bg-slate-100 dark:bg-slate-600' : ''
                ].join(' ')}
                value={opt}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {String(opt[labelKey])}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  ) 
}
