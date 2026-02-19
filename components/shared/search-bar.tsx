'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  defaultValue?: string
  className?: string
}

export function SearchBar({ 
  placeholder = 'Search...', 
  onSearch,
  defaultValue = '',
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query)
    }
  }

  const handleClear = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button onClick={handleSearch} className="bg-black hover:bg-black/90">
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </div>
  )
}
