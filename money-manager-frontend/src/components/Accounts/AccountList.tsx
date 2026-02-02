import { useState } from "react";
import type { Account } from "../../types/account";
import { deleteAccount, setPrimaryAccount, updateAccount } from "../../api/accounts";

interface AccountListProps {
  accounts: Account[];
  onRefresh: () => void;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
}

interface EditFormData {
  name: string;
  balance: number;
}

export const AccountList = ({
  accounts,
  onRefresh,
  pagination,
}: AccountListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({ name: "", balance: 0 });
  const [loading, setLoading] = useState(false);

  const startEdit = (account: Account) => {
    setEditingId(account._id);
    setEditFormData({
      name: account.name,
      balance: account.balance || 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({ name: "", balance: 0 });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === "balance" ? parseFloat(value) || 0 : value
    }));
  };

  const saveEdit = async (accountId: string) => {
    if (!editFormData.name.trim()) {
      alert("Account name is required");
      return;
    }

    try {
      setLoading(true);
      await updateAccount(accountId, editFormData);
      setEditingId(null);
      onRefresh();
    } catch (error: any) {
      console.error("Failed to update account:", error);
      alert(error.response?.data?.message || "Failed to update account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string, accountName: string, isPrimary: boolean) => {
    if (isPrimary) {
      alert("Cannot delete primary account. Please set another account as primary first.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${accountName}" account? This action cannot be undone.`)) return;

    try {
      await deleteAccount(id);
      onRefresh();
    } catch (error: any) {
      console.error("Failed to delete account:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete account. Please try again.";
      
      if (errorMessage.includes("primary")) {
        alert(errorMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  const setPrimary = async (id: string, accountName: string) => {
    if (!window.confirm(`Set "${accountName}" as your primary account?`)) return;

    try {
      await setPrimaryAccount(id);
      onRefresh();
    } catch (error: any) {
      console.error("Failed to set primary account:", error);
      alert(error.response?.data?.message || "Failed to set primary account. Please try again.");
    }
  };

  const getAccountIcon = (accountName: string) => {
    const name = accountName.toLowerCase();
    if (name.includes('saving') || name.includes('savings')) return '💰';
    if (name.includes('credit') || name.includes('card')) return '💳';
    if (name.includes('cash') || name.includes('wallet')) return '💵';
    if (name.includes('investment') || name.includes('stock')) return '📈';
    if (name.includes('loan') || name.includes('debt')) return '🏦';
    if (name.includes('main') || name.includes('primary')) return '⭐';
    return '🏛️';
  };

  const getAccountColor = (accountName: string, isPrimary: boolean) => {
    if (isPrimary) return 'bg-gradient-to-br from-yellow-100 to-amber-100 text-amber-700 border border-amber-200';
    
    const name = accountName.toLowerCase();
    if (name.includes('saving') || name.includes('savings')) return 'bg-emerald-100 text-emerald-700';
    if (name.includes('credit') || name.includes('card')) return 'bg-blue-100 text-blue-700';
    if (name.includes('cash') || name.includes('wallet')) return 'bg-amber-100 text-amber-700';
    if (name.includes('investment') || name.includes('stock')) return 'bg-purple-100 text-purple-700';
    if (name.includes('loan') || name.includes('debt')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const primaryAccount = accounts.find(acc => acc.isPrimary);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#6aba54]/10 to-[#5aa044]/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-[#6aba54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Accounts</h2>
            <p className="text-sm text-gray-500">
              {pagination ? `Showing ${accounts.length} of ${pagination.totalItems} accounts` : `Total ${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Total Balance</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {primaryAccount && (
            <p className="text-xs text-gray-500 mt-1">
              Primary: {primaryAccount.name}
            </p>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <span className="text-sm text-gray-500">
              {pagination.totalItems} total accounts
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => pagination.page > 1 && pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.page < pagination.totalPages && pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first account</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm gap-4"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getAccountColor(account.name, account.isPrimary || false)}`}>
                  <span className="text-xl">{getAccountIcon(account.name)}</span>
                </div>
                <div className="flex-1">
                  {editingId === account._id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Account Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54]"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Balance
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="balance"
                            step="0.01"
                            value={editFormData.balance}
                            onChange={handleEditChange}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54]"
                            disabled={loading}
                          />
                          <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{account.name}</h3>
                        {account.isPrimary && (
                          <span className="text-xs font-medium px-2 py-1 bg-linear-to-br from-yellow-500 to-amber-500 text-white rounded-full flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Created {formatDate(account.createdAt || new Date())}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-6">
                {editingId === account._id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => saveEdit(account._id)}
                      disabled={loading}
                      className="px-4 py-2 bg-[#6aba54] text-white rounded-lg hover:bg-[#5aa044] disabled:opacity-50 flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-500">Current Balance</p>
                      <p className={`text-xl font-bold ${(account.balance || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                        {(account.balance || 0) >= 0 ? '₹' : '-₹'}{Math.abs(account.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Edit Button (available for all accounts) */}
                      <button
                        onClick={() => startEdit(account)}
                        className="group relative p-2 text-gray-400 hover:text-[#6aba54] transition-colors duration-200"
                        title="Edit Account"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Edit Account
                        </span>
                      </button>

                      {/* Set as Primary Button (only show for non-primary accounts) */}
                      {!account.isPrimary && (
                        <button
                          onClick={() => setPrimary(account._id, account.name)}
                          className="group relative p-2 text-gray-400 hover:text-amber-600 transition-colors duration-200"
                          title="Set as Primary"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Set as Primary
                          </span>
                        </button>
                      )}

                      {/* Delete button (only for non-primary accounts) */}
                      {!account.isPrimary && (
                        <button
                          onClick={() => remove(account._id, account.name, account.isPrimary || false)}
                          className="group relative p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          title="Delete Account"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Delete Account
                          </span>
                        </button>
                      )}

                      {/* For primary account, show info icon when not editing */}
                      {account.isPrimary && (
                        <div className="group relative p-2 text-amber-400" title="Primary Account - Can be edited but not deleted">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Primary Account
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} accounts
            </div>
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${pagination.page === pageNum
                      ? 'bg-[#6aba54] text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};