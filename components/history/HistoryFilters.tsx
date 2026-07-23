interface HistoryFiltersProps {
  riskLevels: string[]
  selectedRiskLevel: string
  onRiskLevelChange: (level: string) => void
}

export function HistoryFilters({
  riskLevels,
  selectedRiskLevel,
  onRiskLevelChange,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onRiskLevelChange('all')}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          selectedRiskLevel === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        All Screenings
      </button>
      {riskLevels.map((level) => (
        <button
          key={level}
          onClick={() => onRiskLevelChange(level)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all capitalize ${
            selectedRiskLevel === level
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  )
}
