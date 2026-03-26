import { useState, useRef, useEffect } from 'react'

interface ComboInputProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
}

export function ComboInput({ value, onChange, options, placeholder = '请输入或选择' }: ComboInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = value
    ? options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()))
    : options

  const showDropdown = isOpen && filteredOptions.length > 0

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
    setIsOpen(true)
  }

  function selectOption(option: string) {
    onChange(option)
    setIsOpen(false)
  }

  function handleClickOutside(e: MouseEvent) {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-10"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 && (
            <div className="px-4 py-3 text-gray-500 text-sm">
              按回车使用 &quot;{value}&quot;
            </div>
          )}
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectOption(option)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm ${
                option === value ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
