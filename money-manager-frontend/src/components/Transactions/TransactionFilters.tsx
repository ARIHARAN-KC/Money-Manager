import { useState } from "react";

interface FilterOptions {
  startDate: string;
  endDate: string;
  type: "all" | "Income" | "Expense";
  division: "all" | "Personal" | "Office";
  category: string;
  minAmount: number;
  maxAmount: number;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
}

export const TransactionFilters = ({ onFilterChange, categories }: TransactionFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: "all",
    division: "all",
    category: "",
    minAmount: 0,
    maxAmount: 1000000,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof FilterOptions, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      type: "all",
      division: "all",
      category: "",
      minAmount: 0,
      maxAmount: 1000000,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const handleDatePresetChange = (preset: string) => {
    const today = new Date();
    let startDate = new Date();

    if (preset === "week") startDate.setDate(today.getDate() - 7);
    else if (preset === "month") startDate.setMonth(today.getMonth() - 1);
    else if (preset === "quarter") startDate.setMonth(today.getMonth() - 3);
    else if (preset === "year") startDate.setFullYear(today.getFullYear() - 1);

    const newFilters: FilterOptions = {
      ...filters,
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-medium text-gray-700">Filter Transactions</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-[#6aba54] hover:text-[#5aa044]"
          >
            {isExpanded ? "Show Less" : "Show More"}
          </button>
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => handleChange("type", e.target.value as "all" | "Income" | "Expense")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54]"
          >
            <option value="all">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Division</label>
          <select
            value={filters.division}
            onChange={(e) => handleChange("division", e.target.value as "all" | "Personal" | "Office")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54]"
          >
            <option value="all">All Divisions</option>
            <option value="Personal">Personal</option>
            <option value="Office">Office</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
          <select
            onChange={(e) => handleDatePresetChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54]"
          >
            <option value="">Custom</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last 90 days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Custom Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54]"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Amount Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAmount}
                  onChange={(e) => handleChange("minAmount", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={(e) => handleChange("maxAmount", parseFloat(e.target.value) || 1000000)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};