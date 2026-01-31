// money-manager-frontend/src/pages/TransactionsPage.tsx
import { useEffect, useState } from "react";
import { getTransactions } from "../api/transaction";
import type { Transaction } from "../types/transaction";
import { TransactionCard } from "../components/Transactions/TransactionCard";
import { Pagination } from "../components/UI/Pagination";
import { Link } from "react-router-dom";

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await getTransactions(pageNumber);
      setTransactions(res.data);
      setTotalPages(res.totalPages);
      setPage(res.page);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="space-x-2">
          <Link to="/transactions/new" className="btn btn-primary">
            Add Transaction
          </Link>
          <Link to="/transactions/transfer" className="btn btn-secondary">
            Transfer
          </Link>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : transactions.length === 0 ? (
        <div>No transactions found.</div>
      ) : (
        <div className="space-y-2">
          {transactions.map((t) => (
            <TransactionCard
              key={t._id}
              transaction={t}
              onDeleted={() => fetchTransactions(page)}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchTransactions(p)}
      />
    </div>
  );
};