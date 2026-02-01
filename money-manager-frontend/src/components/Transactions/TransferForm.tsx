import { useState, useEffect } from "react";
import { transferTransaction } from "../../api/transaction";
import apiClient from "../../utils/apiClient";

interface Account {
  _id: string;
  name: string;
  balance: number;
}

export const TransferForm = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fromAccountId: "",
    toAccountId: "",
    amount: 0,
    description: "",
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await apiClient.get("/accounts");
        // Handle different response formats
        let accountsData: Account[] = [];

        if (res.data && Array.isArray(res.data.data)) {
          // Format: { data: { items: [...] } }
          accountsData = res.data.data;
        } else if (Array.isArray(res.data)) {
          // Format: { data: [...] }
          accountsData = res.data;
        } else if (res.data && Array.isArray(res.data.items)) {
          // Format: { data: { items: [...] } } from getAccounts function
          accountsData = res.data.items;
        }

        setAccounts(accountsData);
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      setForm({ ...form, [name]: parseFloat(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAccountSelect = (accountId: string, type: 'from' | 'to') => {
    if (type === 'from') {
      setForm({ ...form, fromAccountId: accountId });
    } else {
      setForm({ ...form, toAccountId: accountId });
    }
  };

  const handleSwapAccounts = () => {
    if (form.fromAccountId && form.toAccountId) {
      setForm({
        ...form,
        fromAccountId: form.toAccountId,
        toAccountId: form.fromAccountId,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fromAccountId || !form.toAccountId) {
      alert("Please select both accounts");
      return;
    }

    if (form.fromAccountId === form.toAccountId) {
      alert("Cannot transfer to the same account");
      return;
    }

    if (form.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }

    const fromAccount = accounts.find(a => a._id === form.fromAccountId);
    if (fromAccount && form.amount > fromAccount.balance) {
      if (!confirm(`Insufficient balance in ${fromAccount.name}. Proceed anyway?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      await transferTransaction(form);
      alert("Transfer successful");
      setForm({ fromAccountId: "", toAccountId: "", amount: 0, description: "" });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const fromAccount = accounts.find(a => a._id === form.fromAccountId);
  const toAccount = accounts.find(a => a._id === form.toAccountId);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Transfer Money
              </h1>
              <p className="text-sm text-gray-500">Move funds between your accounts</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transfer Flow Visualization */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                {/* From Account */}
                <div className="text-center flex-1">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${form.fromAccountId
                      ? "bg-linear-to-br from-red-50 to-orange-50 border-2 border-red-200"
                      : "bg-gray-100 border-2 border-gray-200"
                    }`}>
                    <svg className={`w-8 h-8 ${form.fromAccountId ? "text-red-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">From</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {fromAccount?.name || "Select account"}
                  </p>
                </div>

                {/* Arrow with Swap Button */}
                <div className="relative px-4">
                  <div className="w-12 h-1 bg-gray-300"></div>
                  <button
                    type="button"
                    onClick={handleSwapAccounts}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200 shadow-sm"
                    title="Swap accounts"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                </div>

                {/* To Account */}
                <div className="text-center flex-1">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${form.toAccountId
                      ? "bg-linear-to-br from-emerald-50 to-green-50 border-2 border-emerald-200"
                      : "bg-gray-100 border-2 border-gray-200"
                    }`}>
                    <svg className={`w-8 h-8 ${form.toAccountId ? "text-emerald-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">To</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {toAccount?.name || "Select account"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Selection Grid */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Select Accounts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* From Account Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Transfer From
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {accounts.map((account) => (
                      <div
                        key={`from-${account._id}`}
                        onClick={() => handleAccountSelect(account._id, 'from')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${form.fromAccountId === account._id
                            ? "bg-red-50 border-red-200 ring-2 ring-red-100"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.fromAccountId === account._id ? "bg-red-100" : "bg-gray-200"
                              }`}>
                              <svg className={`w-4 h-4 ${form.fromAccountId === account._id ? "text-red-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{account.name}</p>
                              <p className="text-xs text-gray-500">₹{account.balance.toLocaleString()}</p>
                            </div>
                          </div>
                          {form.fromAccountId === account._id && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* To Account Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Transfer To
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {accounts.map((account) => (
                      <div
                        key={`to-${account._id}`}
                        onClick={() => handleAccountSelect(account._id, 'to')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 ${form.toAccountId === account._id
                            ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-100"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.toAccountId === account._id ? "bg-emerald-100" : "bg-gray-200"
                              }`}>
                              <svg className={`w-4 h-4 ${form.toAccountId === account._id ? "text-emerald-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{account.name}</p>
                              <p className="text-xs text-gray-500">₹{account.balance.toLocaleString()}</p>
                            </div>
                          </div>
                          {form.toAccountId === account._id && (
                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Transfer Amount
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
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (fromAccount) {
                        setForm({ ...form, amount: fromAccount.balance });
                      }
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors duration-200"
                  >
                    Max
                  </button>
                </div>
              </div>
              {fromAccount && (
                <p className="mt-2 text-xs text-gray-500">
                  Available balance: <span className="font-medium">₹{fromAccount.balance.toLocaleString()}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
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
                  rows={2}
                  className="block w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 placeholder-gray-400 resize-none"
                  placeholder="Add a note about this transfer"
                />
              </div>
            </div>

            {/* Transfer Summary */}
            {fromAccount && toAccount && form.amount > 0 && (
              <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2">Transfer Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium text-gray-800">{fromAccount.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium text-gray-800">{toAccount.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">₹{form.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Balance (From):</span>
                    <span className={`font-medium ${fromAccount.balance - form.amount >= 0 ? "text-gray-800" : "text-red-600"
                      }`}>
                      ₹{(fromAccount.balance - form.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Balance (To):</span>
                    <span className="font-medium text-gray-800">
                      ₹{(toAccount.balance + form.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading || !form.fromAccountId || !form.toAccountId || form.amount <= 0}
                  className={`flex-1 flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl ${loading || !form.fromAccountId || !form.toAccountId || form.amount <= 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                    }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white mr-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17l5-5m0 0l-5-5m5 5H6" />
                      </svg>
                      Transfer Money
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm({ fromAccountId: "", toAccountId: "", amount: 0, description: "" });
                  }}
                  className="px-6 py-4 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-gray-400 mt-0.5 shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Transfers are instant and will update both account balances immediately.
                    Make sure you have sufficient balance in the source account.
                    You cannot transfer to the same account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};