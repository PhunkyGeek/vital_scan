import { Search } from 'lucide-react'

interface LibrarySearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function LibrarySearchBar({
  value,
  onChange,
  placeholder = 'Search conditions...',
}: LibrarySearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
    </div>
  )
}
