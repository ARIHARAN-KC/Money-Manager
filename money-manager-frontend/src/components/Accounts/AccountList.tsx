import type { Account } from "../../types/account";
import { deleteAccount } from "../../api/accounts";

export const AccountList = ({
  accounts,
  onRefresh,
}: {
  accounts: Account[];
  onRefresh: () => void;
}) => {
  const remove = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) return;
    
    try {
      await deleteAccount(id);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  const getAccountIcon = (accountName: string) => {
    const name = accountName.toLowerCase();
    if (name.includes('saving') || name.includes('savings')) return '💰';
    if (name.includes('credit') || name.includes('card')) return '💳';
    if (name.includes('cash') || name.includes('wallet')) return '💵';
    if (name.includes('investment') || name.includes('stock')) return '📈';
    if (name.includes('loan') || name.includes('debt')) return '🏦';
    return '🏛️';
  };

  const getAccountColor = (accountName: string) => {
    const name = accountName.toLowerCase();
    if (name.includes('saving') || name.includes('savings')) return 'bg-emerald-100 text-emerald-700';
    if (name.includes('credit') || name.includes('card')) return 'bg-blue-100 text-blue-700';
    if (name.includes('cash') || name.includes('wallet')) return 'bg-amber-100 text-amber-700';
    if (name.includes('investment') || name.includes('stock')) return 'bg-purple-100 text-purple-700';
    if (name.includes('loan') || name.includes('debt')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6aba54]/10 to-[#5aa044]/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-[#6aba54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Accounts</h2>
            <p className="text-sm text-gray-500">Total {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Total Balance</p>
          <p className="text-2xl font-bold text-gray-800">
            ₹{accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Empty State */}
      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-gray-500 mb-2">No accounts yet</p>
          <p className="text-sm text-gray-400">Add your first account to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account._id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getAccountColor(account.name)}`}>
                  <span className="text-xl">{getAccountIcon(account.name)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{account.name}</h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(account.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Current Balance</p>
                  <p className={`text-xl font-bold ${
                    account.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {account.balance >= 0 ? '₹' : '-₹'}{Math.abs(account.balance).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => remove(account._id)}
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {accounts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Accounts</p>
              <p className="text-lg font-semibold text-gray-800">{accounts.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Positive Balance</p>
              <p className="text-lg font-semibold text-emerald-600">
                {accounts.filter(acc => acc.balance > 0).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Zero Balance</p>
              <p className="text-lg font-semibold text-gray-600">
                {accounts.filter(acc => acc.balance === 0).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Negative Balance</p>
              <p className="text-lg font-semibold text-red-600">
                {accounts.filter(acc => acc.balance < 0).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};