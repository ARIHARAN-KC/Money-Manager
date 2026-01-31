import type { Transaction } from "../../types/transaction";
import { deleteTransaction } from "../../api/transaction";
import { useNavigate } from "react-router-dom";

interface Props {
  transaction: Transaction;
  onDeleted?: () => void;
}

export const TransactionCard = ({ transaction, onDeleted }: Props) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await deleteTransaction(transaction._id);
      onDeleted?.();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return "Today";
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('restaurant') || cat.includes('grocery')) return '🍕';
    if (cat.includes('shopping') || cat.includes('retail')) return '🛍️';
    if (cat.includes('transport') || cat.includes('travel') || cat.includes('fuel')) return '🚗';
    if (cat.includes('bill') || cat.includes('utility') || cat.includes('electricity') || cat.includes('water')) return '📊';
    if (cat.includes('salary') || cat.includes('income') || cat.includes('payment')) return '💰';
    if (cat.includes('entertainment') || cat.includes('movie') || cat.includes('game')) return '🎬';
    if (cat.includes('medical') || cat.includes('health') || cat.includes('doctor')) return '🏥';
    if (cat.includes('education') || cat.includes('book') || cat.includes('course')) return '📚';
    if (cat.includes('investment') || cat.includes('stock') || cat.includes('mutual')) return '📈';
    return '💸';
  };

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('restaurant') || cat.includes('grocery')) return 'bg-amber-100 text-amber-700';
    if (cat.includes('shopping') || cat.includes('retail')) return 'bg-pink-100 text-pink-700';
    if (cat.includes('transport') || cat.includes('travel') || cat.includes('fuel')) return 'bg-blue-100 text-blue-700';
    if (cat.includes('bill') || cat.includes('utility')) return 'bg-indigo-100 text-indigo-700';
    if (cat.includes('salary') || cat.includes('income')) return 'bg-emerald-100 text-emerald-700';
    if (cat.includes('entertainment')) return 'bg-purple-100 text-purple-700';
    if (cat.includes('medical') || cat.includes('health')) return 'bg-red-100 text-red-700';
    if (cat.includes('education')) return 'bg-cyan-100 text-cyan-700';
    if (cat.includes('investment')) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 p-4 transition-all duration-200 hover:shadow-sm animate-fadeIn">
      <div className="flex items-start justify-between">
        {/* Left Section */}
        <div className="flex items-start space-x-4 flex-1">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
            <span className="text-xl">{getCategoryIcon(transaction.category)}</span>
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-800">{transaction.category}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                transaction.type === "Income" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-red-100 text-red-700"
              }`}>
                {transaction.type}
              </span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                transaction.division === "Personal"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}>
                {transaction.division}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-2">
              {transaction.description || "No description provided"}
            </p>

            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{transaction.account?.name || "No Account"}</span>
              </div>
              
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{transaction.tags.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Amount & Actions */}
        <div className="flex flex-col items-end space-y-3">
          {/* Amount */}
          <div className={`text-xl font-bold ${
            transaction.type === "Income" 
              ? "text-emerald-600" 
              : "text-red-600"
          }`}>
            <span className="text-sm font-normal text-gray-500 mr-1">
              {transaction.type === "Income" ? "+" : "-"}
            </span>
            ₹{transaction.amount.toLocaleString()}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => navigate(`/transactions/${transaction._id}/edit`)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors duration-200"
              title="Edit Transaction"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors duration-200 group/delete"
              title="Delete Transaction"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover/delete:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Delete Transaction
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Time indicator */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Transaction ID: {transaction._id.substring(0, 8)}...</span>
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {new Date(transaction.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};