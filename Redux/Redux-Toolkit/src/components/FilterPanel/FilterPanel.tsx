import React from 'react';
import { CATEGORIES, SORT_OPTIONS } from '../../utils/constants';
import './FilterPanel.css';

interface FilterPanelProps {
  category: string;
  sortBy: 'date' | 'title' | 'author';
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: 'date' | 'title' | 'author') => void;
  onDateFilterChange?: (dateFrom: string, dateTo: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  category,
  sortBy,
  onCategoryChange,
  onSortChange,
  onDateFilterChange
}) => {
  return (
    <div className="filter-panel">
      <div className="filter-panel__section">
        <label className="filter-panel__label">Danh mục:</label>
        <select
          className="filter-panel__select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-panel__section">
        <label className="filter-panel__label">Sắp xếp:</label>
        <select
          className="filter-panel__select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as 'date' | 'title' | 'author')}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {onDateFilterChange && (
        <div className="filter-panel__section">
          <label className="filter-panel__label">Lọc theo ngày:</label>
          <div className="filter-panel__date-range">
            <input
              type="date"
              className="filter-panel__date-input"
              onChange={(e) => onDateFilterChange?.(e.target.value, '')}
            />
            <span className="filter-panel__date-separator">đến</span>
            <input
              type="date"
              className="filter-panel__date-input"
              onChange={(e) => onDateFilterChange?.('', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

