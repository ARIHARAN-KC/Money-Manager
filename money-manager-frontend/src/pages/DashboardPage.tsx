import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSummary,
  getCategorySummary,
  getRangeTransactions,
  type SummaryResponse,
  type CategorySummaryResponse,
  type RangeSummaryApiResponse,
} from "../api/dashboard";
import { getAccounts } from "../api/accounts"; // Import accounts API
import type { Account } from "../types/account"; // Import Account type
import { Loader } from "../components/UI/Loader";

type Transaction = {
  _id: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
  description?: string;
  division: "Personal" | "Office";
  account: {
    _id: string;
    name: string;
  };
  createdAt: string;
};

interface FilterOptions {
  startDate: string;
  endDate: string;
  type: "all" | "Income" | "Expense";
  division: "all" | "Personal" | "Office";
  category: string;
  minAmount: number;
  maxAmount: number;
}

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [summaryData, setSummaryData] = useState<SummaryResponse[]>([]);
  const [categoryData, setCategoryData] = useState<CategorySummaryResponse[]>([]);
  const [rangeData, setRangeData] = useState<RangeSummaryApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]); // Add accounts state

  // Calculate derived summary values
  const incomeTotal = summaryData.find(item => item._id === "Income")?.total || 0;
  const expenseTotal = summaryData.find(item => item._id === "Expense")?.total || 0;
  
  // Find primary account balance (this is our savings/net balance)
  const primaryAccount = accounts.find(acc => acc.isPrimary);
  const netBalance = primaryAccount?.balance || 0; // Net balance = Primary account balance
  
  // Calculate expenses as: Total Income - Net Balance (Savings)
  // This ensures expenses don't include savings
  const calculatedExpenses = Math.max(0, incomeTotal - netBalance);

  // Set default date range to last 30 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const defaultStartDate = startDate.toISOString().split('T')[0];

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [summaryRes, categoryRes, rangeRes, accountsRes] = await Promise.all([
        getSummary(type, 1, 10),
        getCategorySummary(1, 10),
        getRangeTransactions(defaultStartDate, endDate, 1, 10),
        getAccounts(1, 100), // Fetch accounts with higher limit
      ]);

      setSummaryData(summaryRes.summary || []);
      setCategoryData(categoryRes.summary || []);
      setRangeData(rangeRes);
      setAccounts(accountsRes.data?.data || []); // Set accounts data

      // Extract categories from both sources
      const uniqueCategories = Array.from(
        new Set([
          ...(categoryRes.summary?.map(item => item._id) || []),
          ...(rangeRes.transactions?.map((t: any) => t.category) || [])
        ])
      ).filter(Boolean) as string[];

      setAllCategories(uniqueCategories);
    } catch (err) {
      console.error("Dashboard load failed", err);
      // Set default values on error
      setSummaryData([
        { _id: "Income", total: 0 },
        { _id: "Expense", total: 0 }
      ]);
      setCategoryData([]);
      setAccounts([]);
      setRangeData({
        transactions: [],
        totalTransactions: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [type]);

  const handleFilterChange = async (newFilters: FilterOptions) => {
    try {
      setLoading(true);
      const res = await getRangeTransactions(
        newFilters.startDate,
        newFilters.endDate,
        1,
        10
      );

      if (res && res.transactions) {
        let filtered = [...res.transactions];

        // Apply additional filters
        if (newFilters.type !== "all") {
          filtered = filtered.filter((t: any) => t.type === newFilters.type);
        }

        if (newFilters.division !== "all") {
          filtered = filtered.filter((t: any) => t.division === newFilters.division);
        }

        if (newFilters.category) {
          filtered = filtered.filter((t: any) => t.category === newFilters.category);
        }

        filtered = filtered.filter((t: any) =>
          t.amount >= newFilters.minAmount && t.amount <= newFilters.maxAmount
        );

        setRangeData({
          ...res,
          transactions: filtered,
          totalTransactions: filtered.length,
        });
      }
    } catch (err) {
      console.error("Filter failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllTransactions = () => {
    navigate("/transactions");
  };

  if (loading && !rangeData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Loader />
        </div>
      </div>
    );
  }

  const transactions = rangeData?.transactions || [];

  // Calculate statistics from actual transactions
  const personalTransactions = transactions.filter((t: any) => t.division === "Personal").length;
  const officeTransactions = transactions.filter((t: any) => t.division === "Office").length;
  const incomeTransactions = transactions.filter((t: any) => t.type === "Income").length;
  const expenseTransactions = transactions.filter((t: any) => t.type === "Expense").length;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-[#6aba54] flex items-center justify-center rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-[#6aba54] to-[#5aa044] bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500">Your financial overview</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Summary Type Selector */}
            <div className="inline-flex rounded-xl bg-white p-1 shadow-sm border border-gray-200">
              {(["weekly", "monthly", "yearly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${type === t
                    ? "bg-[#6aba54] text-white shadow-sm"
                    : "text-gray-600 hover:text-[#6aba54]"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards - Updated with correct logic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Income Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-emerald-50 to-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                Income
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Income</h3>
            <p className="text-3xl font-bold text-gray-800">₹{incomeTotal.toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Total earnings this {type}</p>
            </div>
          </div>

          {/* Total Expense Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-red-50 to-rose-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-700 rounded-full">
                Expense
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-gray-800">₹{calculatedExpenses.toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Total spending this {type}</p>
              <p className="text-xs text-gray-400 mt-1">(Income - Savings)</p>
            </div>
          </div>

          {/* Net Balance Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${netBalance >= 0 
                ? 'bg-emerald-50' 
                : 'bg-red-50'}`}>
                <svg className={`w-6 h-6 ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {netBalance >= 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  )}
                </svg>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${netBalance >= 0 
                ? 'bg-emerald-50 text-emerald-700' 
                : 'bg-red-50 text-red-700'}`}>
                {netBalance >= 0 ? 'Savings' : 'Deficit'}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Net Balance (Savings)</h3>
            <p className={`text-3xl font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ₹{netBalance.toLocaleString()}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Current savings balance</p>
              <p className="text-xs text-gray-400 mt-1">
                {primaryAccount ? primaryAccount.name : "Set a primary account"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Info Banner */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">How it's calculated:</p>
              <p className="text-xs text-blue-600">
                Expenses = Total Income - Savings | Savings = Primary Account Balance
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Category Breakdown</h2>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {categoryData.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No category data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryData.map((category) => {
                  const totalIncome = category.income || 0;
                  const totalExpense = category.expense || 0;
                  const netTotal = totalIncome - totalExpense;
                  const isPositive = netTotal >= 0;

                  return (
                    <div key={category._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-[#6aba54]"></div>
                          <span className="font-medium text-gray-700">{category._id}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : '-'}₹{Math.abs(netTotal).toLocaleString()}
                          </span>
                          <div className="text-xs text-gray-500">
                            Inc: ₹{totalIncome.toLocaleString()} | Exp: ₹{totalExpense.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {totalIncome > 0 && (
                          <div
                            className="bg-emerald-500 h-2 rounded-l-full transition-all duration-500"
                            style={{ width: `${(totalIncome / (totalIncome + totalExpense || 1)) * 100}%` }}
                          ></div>
                        )}
                        {totalExpense > 0 && (
                          <div
                            className="bg-red-500 h-2 rounded-r-full transition-all duration-500"
                            style={{ width: `${(totalExpense / (totalIncome + totalExpense || 1)) * 100}%` }}
                          ></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
              <button
                onClick={handleViewAllTransactions}
                className="text-sm font-medium text-[#6aba54] hover:text-[#5aa044] transition-colors"
              >
                View All
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <p className="text-gray-500">No transactions found</p>
                <button
                  onClick={() => navigate("/transactions")}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-[#6aba54] text-white rounded-lg hover:bg-[#5aa044] transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction: any) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === "Income"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                        }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {transaction.type === "Income" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{transaction.category}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${transaction.division === "Personal"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                            }`}>
                            {transaction.division}
                          </span>
                          <span className="text-xs text-gray-500">
                            {transaction.description || "No description"} • {new Date(transaction.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === "Income" ? "text-emerald-600" : "text-red-600"
                        }`}>
                        {transaction.type === "Income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.account?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Income Transactions</p>
                <p className="text-lg font-bold text-emerald-800">
                  {incomeTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-700">Expense Transactions</p>
                <p className="text-lg font-bold text-red-800">
                  {expenseTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Personal</p>
                <p className="text-lg font-bold text-blue-800">
                  {personalTransactions}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Office</p>
                <p className="text-lg font-bold text-purple-800">
                  {officeTransactions}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};