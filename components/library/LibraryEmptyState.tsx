interface LibraryEmptyStateProps {
  searchTerm?: string
  category?: string
}

export function LibraryEmptyState({
  searchTerm,
  category,
}: LibraryEmptyStateProps) {
  return (
    <div className="col-span-full py-12 text-center">
      <div className="mb-4">
        <svg
          className="mx-auto w-16 h-16 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="font-semibold text-lg text-foreground mb-1">
        No conditions found
      </h3>
      {searchTerm ? (
        <p className="text-muted-foreground">
          No results for <strong>&quot;{searchTerm}&quot;</strong>. Try different keywords or
          browse by category.
        </p>
      ) : category && category !== 'all' ? (
        <p className="text-muted-foreground">
          No conditions in the <strong>{category}</strong> category yet.
        </p>
      ) : (
        <p className="text-muted-foreground">
          Condition library is loading. Please try again.
        </p>
      )}
    </div>
  )
}
