import { useState, useEffect } from "react";
import { generateReport, exportReport } from "../api/reports";
import { getTransactions } from "../api/transaction";

interface FilterOptions {
  startDate: string;
  endDate: string;
  type: "all" | "Income" | "Expense";
  division: "all" | "Personal" | "Office";
  category: string;
  minAmount: number;
  maxAmount: number;
}

interface ExportOptions {
  format: "csv" | "pdf";
  include: ("transactions" | "summary" | "charts")[];
}

interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  byCategory: Record<string, { income: number; expense: number }>;
}

export const ReportsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: "all",
    division: "all",
    category: "",
    minAmount: 0,
    maxAmount: 1000000,
  });

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    include: ["transactions", "summary"],
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [reportSummary, setReportSummary] = useState<ReportSummary>({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: 0,
    byCategory: {}
  });

  useEffect(() => {
    fetchCategories();
    generateReportHandler();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getTransactions(1, 100);
      const transactionsData = res.data || [];
      const uniqueCategories: string[] = [...new Set(transactionsData.map((t: any) => t.category as string))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const calculateSummary = (transactions: any[]): ReportSummary => {
    const totalIncome = transactions
      .filter((t: any) => t.type === "Income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter((t: any) => t.type === "Expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const byCategory = transactions.reduce((acc: Record<string, { income: number; expense: number }>, t: any) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === "Income") {
        acc[t.category].income += t.amount;
      } else {
        acc[t.category].expense += t.amount;
      }
      return acc;
    }, {});

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      byCategory
    };
  };

  const generateReportHandler = async () => {
    setLoading(true);
    try {
      const res = await generateReport(filters);
      // The generateReport returns ReportResponse which has transactions and summary
      if (res.transactions && Array.isArray(res.transactions)) {
        setTransactions(res.transactions);
        const summary = calculateSummary(res.transactions);
        setReportSummary(summary);
      } else {
        // Fallback to empty arrays if structure is different
        setTransactions([]);
        setReportSummary({
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          transactionCount: 0,
          byCategory: {}
        });
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
      setTransactions([]);
      setReportSummary({
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        transactionCount: 0,
        byCategory: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportReport(filters, exportOptions);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-report-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export report");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Financial Reports
              </h1>
              <p className="text-sm text-gray-500">Generate and export financial insights</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter Options</h2>

              <div className="space-y-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as "all" | "Income" | "Expense" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>

                {/* Division */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <select
                    value={filters.division}
                    onChange={(e) => setFilters({ ...filters, division: e.target.value as "all" | "Personal" | "Office" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="Personal">Personal</option>
                    <option value="Office">Office</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Amount Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range (₹)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minAmount}
                      onChange={(e) => setFilters({ ...filters, minAmount: parseFloat(e.target.value) || 0 })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxAmount}
                      onChange={(e) => setFilters({ ...filters, maxAmount: parseFloat(e.target.value) || 1000000 })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={generateReportHandler}
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate Report"}
                </button>
              </div>

              {/* Export Options */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Options</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                    <div className="flex space-x-2">
                      {(["csv", "pdf"] as const).map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => setExportOptions({ ...exportOptions, format })}
                          className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${exportOptions.format === format
                            ? "bg-blue-100 border-blue-300 text-blue-700"
                            : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Include</label>
                    <div className="space-y-2">
                      {(["transactions", "summary", "charts"] as const).map((item) => (
                        <label key={item} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={exportOptions.include.includes(item)}
                            onChange={(e) => {
                              const newInclude = e.target.checked
                                ? [...exportOptions.include, item]
                                : exportOptions.include.filter(i => i !== item);
                              setExportOptions({ ...exportOptions, include: newInclude });
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 capitalize">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleExport}
                    disabled={transactions.length === 0}
                    className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Report Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Report Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-linear-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
                  <p className="text-sm text-emerald-700 mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-emerald-800">₹{reportSummary.totalIncome.toLocaleString()}</p>
                </div>

                <div className="bg-linear-to-br from-red-50 to-rose-50 p-4 rounded-xl border border-red-200">
                  <p className="text-sm text-red-700 mb-1">Total Expense</p>
                  <p className="text-2xl font-bold text-red-800">₹{reportSummary.totalExpense.toLocaleString()}</p>
                </div>

                <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Net Balance</p>
                  <p className={`text-2xl font-bold ${reportSummary.netBalance >= 0 ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                    ₹{Math.abs(reportSummary.netBalance).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Category Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(reportSummary.byCategory).map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-800">{category}</span>
                      <div className="text-right">
                        <div className="text-sm text-emerald-600">Income: ₹{data.income.toLocaleString()}</div>
                        <div className="text-sm text-red-600">Expense: ₹{data.expense.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Transactions ({transactions.length})</h2>
                <span className="text-sm text-gray-500">
                  {filters.startDate} to {filters.endDate}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No transactions found for the selected filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Date</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Category</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Type</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Division</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b border-gray-200">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction: any) => (
                        <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-700 border-b border-gray-100">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800 border-b border-gray-100">{transaction.category}</td>
                          <td className="py-3 px-4 border-b border-gray-100">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${transaction.type === "Income"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                              }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 border-b border-gray-100">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${transaction.division === "Personal"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                              }`}>
                              {transaction.division}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-sm font-medium border-b border-gray-100 ${transaction.type === "Income" ? "text-emerald-600" : "text-red-600"
                            }`}>
                            {transaction.type === "Income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};