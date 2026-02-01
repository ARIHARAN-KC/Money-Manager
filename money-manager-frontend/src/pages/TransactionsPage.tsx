import { useEffect, useState } from "react";
import { getTransactions } from "../api/transaction";
import type { Transaction } from "../types/transaction";
import { TransactionCard } from "../components/Transactions/TransactionCard";
import { Pagination } from "../components/UI/Pagination";
import { Link } from "react-router-dom";
import { TransactionModal } from "../components/Transactions/TransactionModal";
import { TransactionFilters } from "../components/Transactions/TransactionFilters";

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | undefined>();
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "all" as "all" | "Income" | "Expense",
    division: "all" as "all" | "Personal" | "Office",
    category: "",
    minAmount: 0,
    maxAmount: 1000000,
  });

  const fetchTransactions = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await getTransactions(pageNumber, limit);
      setTransactions(res.data);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
      setPage(res.page);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(res.data.map((t: Transaction) => t.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, limit]);

  const handleFilterChange = async (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
    // In a real implementation, you would pass filters to API
    // For now, we'll filter client-side
    const res = await getTransactions(1, 1000); // Get more for filtering
    let filtered = res.data;

    if (newFilters.type !== "all") {
      filtered = filtered.filter((t: Transaction) => t.type === newFilters.type);
    }

    if (newFilters.division !== "all") {
      filtered = filtered.filter((t: Transaction) => t.division === newFilters.division);
    }

    if (newFilters.category) {
      filtered = filtered.filter((t: Transaction) => t.category === newFilters.category);
    }

    filtered = filtered.filter((t: Transaction) =>
      t.amount >= newFilters.minAmount && t.amount <= newFilters.maxAmount
    );

    // Apply date filtering if dates are set
    if (newFilters.startDate && newFilters.endDate) {
      const startDate = new Date(newFilters.startDate);
      const endDate = new Date(newFilters.endDate);
      filtered = filtered.filter((t: Transaction) => {
        const transDate = new Date(t.createdAt);
        return transDate >= startDate && transDate <= endDate;
      });
    }

    setTransactions(filtered.slice(0, limit));
    setTotalPages(Math.ceil(filtered.length / limit));
    setTotalItems(filtered.length);
  };

  const handleEditTransaction = (id: string) => {
    setEditingTransactionId(id);
    setIsModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    fetchTransactions(page);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Transactions
                </h1>
                <p className="text-sm text-gray-500">Manage your income and expenses</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/transactions/transfer"
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Transfer
              </Link>
              <button
                onClick={() => {
                  setEditingTransactionId(undefined);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2.5 bg-[#6aba54] text-white font-medium rounded-lg hover:bg-[#5aa044] transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Transaction
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <TransactionFilters
          onFilterChange={handleFilterChange}
          categories={categories}
        />

        {/* Transaction List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6aba54] mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <p className="text-gray-500">No transactions found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#6aba54] text-white rounded-lg hover:bg-[#5aa044]"
            >
              Add your first transaction
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction._id}
                  transaction={transaction}
                  onDeleted={handleDeleteSuccess}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          </>
        )}

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTransactionId(undefined);
          }}
          transactionId={editingTransactionId}
          onSuccess={() => {
            fetchTransactions(page);
            setIsModalOpen(false);
            setEditingTransactionId(undefined);
          }}
        />
      </div>
    </div>
  );
};