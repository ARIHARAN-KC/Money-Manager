import { useState, useEffect } from "react";
import { createTransaction, updateTransaction, getTransactionById } from "../../api/transaction";
import type { CreateTransactionData } from "../../api/transaction";
import { getAccounts } from "../../api/accounts";
import type { PaginatedResponse } from "../../api/accounts";
import { useNavigate, useParams } from "react-router-dom";

interface FormData {
  type: "Income" | "Expense";
  amount: number;
  description: string;
  category: string;
  division: "Personal" | "Office";
  account: string;
  tags: string[];
}

export const TransactionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    type: "Income",
    amount: 0,
    description: "",
    category: "",
    division: "Personal",
    account: "",
    tags: [],
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await getAccounts();
        const response = res.data as PaginatedResponse;
        const accountsData = response.data || [];
        setAccounts(accountsData);

        if (accountsData.length > 0 && !form.account) {
          setForm(prev => ({ ...prev, account: accountsData[0]._id }));
        }
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
        setError("Failed to load accounts");
      }
    };

    fetchAccounts();

    if (id) {
      loadTransaction(id);
    }
  }, [id]);

  const loadTransaction = async (transactionId: string) => {
    try {
      setLoading(true);
      const transaction = await getTransactionById(transactionId);
      setForm({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || "",
        category: transaction.category,
        division: transaction.division,
        account: transaction.account._id,
        tags: transaction.tags || [],
      });
    } catch (err: any) {
      console.error("Failed to load transaction:", err);
      setError(err.response?.data?.message || "Failed to load transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      setForm({ ...form, [name]: parseFloat(value) || 0 });
    } else if (name === "type" && (value === "Income" || value === "Expense")) {
      setForm({ ...form, [name]: value });
    } else if (name === "division" && (value === "Personal" || value === "Office")) {
      setForm({ ...form, [name]: value });
    } else {
      setForm({ ...form, [name]: value });
    }
    setError(null);
  };

  const handleTagAdd = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !form.tags.includes(trimmedTag)) {
      setForm({ ...form, tags: [...form.tags, trimmedTag] });
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required");
      return;
    }

    if (!form.account) {
      setError("Please select an account");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionData: CreateTransactionData = {
        type: form.type,
        amount: form.amount,
        description: form.description || undefined,
        category: form.category,
        division: form.division,
        account: form.account,
        tags: form.tags.length > 0 ? form.tags : undefined,
      };

      if (id) {
        await updateTransaction(id, transactionData);
      } else {
        await createTransaction(transactionData);
      }
      navigate("/transactions");
    } catch (err: any) {
      console.error("Transaction save failed:", err);
      setError(err.response?.data?.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const getCategorySuggestions = () => {
    const suggestions = [
      "Food & Dining", "Shopping", "Transport", "Bills & Utilities",
      "Entertainment", "Healthcare", "Education", "Salary", "Investment",
      "Gifts", "Travel", "Insurance", "Tax", "Other"
    ];

    if (form.type === "Income") {
      return ["Salary", "Freelance", "Investment", "Business", "Gift", "Other Income"];
    }

    return suggestions;
  };

  if (loading && id) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6aba54]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${id ? "bg-linear-to-br from-amber-500 to-orange-500" : "bg-linear-to-br from-indigo-500 to-purple-600"
              }`}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {id ? "Edit Transaction" : "New Transaction"}
              </h1>
              <p className="text-sm text-gray-500">
                {id ? "Update your transaction details" : "Add a new income or expense"}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Transaction Type
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "Income" })}
                  className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ${form.type === "Income"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.type === "Income" ? "bg-emerald-100" : "bg-gray-200"
                      }`}>
                      <svg className={`w-4 h-4 ${form.type === "Income" ? "text-emerald-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Income</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "Expense" })}
                  className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ${form.type === "Expense"
                    ? "bg-red-50 border-red-200 text-red-700 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.type === "Expense" ? "bg-red-100" : "bg-gray-200"
                      }`}>
                      <svg className={`w-4 h-4 ${form.type === "Expense" ? "text-red-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Expense</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg font-medium">₹</span>
                </div>
                <input
                  id="amount"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
                  placeholder="e.g., Food, Salary, Transport"
                  required
                  list="category-suggestions"
                  disabled={loading}
                />
                <datalist id="category-suggestions">
                  {getCategorySuggestions().map((cat, index) => (
                    <option key={index} value={cat} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 placeholder-gray-400 resize-none"
                  placeholder="Add a note about this transaction"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Division */}
            <div>
              <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">
                Division
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, division: "Personal" })}
                  className={`py-3 px-4 rounded-xl border transition-all duration-200 ${form.division === "Personal"
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  disabled={loading}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.division === "Personal" ? "bg-blue-100" : "bg-gray-200"
                      }`}>
                      <svg className={`w-4 h-4 ${form.division === "Personal" ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-medium">Personal</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, division: "Office" })}
                  className={`py-3 px-4 rounded-xl border transition-all duration-200 ${form.division === "Office"
                    ? "bg-purple-50 border-purple-200 text-purple-700 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  disabled={loading}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.division === "Office" ? "bg-purple-100" : "bg-gray-200"
                      }`}>
                      <svg className={`w-4 h-4 ${form.division === "Office" ? "text-purple-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="font-medium">Office</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Selection */}
            <div>
              <label htmlFor="account" className="block text-sm font-medium text-gray-700 mb-2">
                Account
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <select
                  id="account"
                  name="account"
                  value={form.account}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 appearance-none"
                  required
                  disabled={loading || accounts.length === 0}
                >
                  <option value="">Select Account</option>
                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name} (₹{account.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {form.account && accounts.find((a: any) => a._id === form.account) && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected account balance: ₹{accounts.find((a: any) => a._id === form.account)?.balance.toLocaleString()}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tag-input" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <div className="relative flex-1">
                  <input
                    id="tag-input"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="block w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
                    placeholder="Add a tag and press Enter"
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  disabled={loading}
                >
                  Add
                </button>
              </div>

              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700"
                        disabled={loading}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl ${loading ? "opacity-80 cursor-not-allowed" : ""
                    }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {id ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={id ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                      </svg>
                      {id ? "Update Transaction" : "Create Transaction"}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/transactions")}
                  className="px-6 py-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};