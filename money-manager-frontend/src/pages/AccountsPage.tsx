import { useEffect, useState } from "react";
import { getAccounts } from "../api/accounts";
import type { Account } from "../types/account";
import { AccountForm } from "../components/Accounts/AccountForm";
import { AccountList } from "../components/Accounts/AccountList";
import { Loader } from "../components/UI/Loader";

export const AccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await getAccounts();
      // The API function now returns { data: { items: [...] } }
      setAccounts(res.data.items || []);
    } catch (error) {
      console.error("Failed to load accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#6aba54] to-[#5aa044] rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6aba54] to-[#5aa044] bg-clip-text text-transparent">
                  Accounts
                </h1>
                <p className="text-sm text-gray-500">Manage your financial accounts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500">Total Accounts</p>
                <p className="text-lg font-semibold text-gray-800">{accounts.length}</p>
              </div>
              <div className="bg-white rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500">Total Balance</p>
                <p className="text-lg font-semibold text-emerald-600">
                  ₹{accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Form */}
          <div className="lg:col-span-1">
            <AccountForm onSuccess={loadAccounts} />
            
            {/* Stats Card */}
            <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Statistics</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Positive Balance</span>
                    <span className="text-sm font-semibold text-emerald-600">
                      {accounts.filter(acc => acc.balance > 0).length} accounts
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${accounts.length > 0 ? (accounts.filter(acc => acc.balance > 0).length / accounts.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Zero Balance</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {accounts.filter(acc => acc.balance === 0).length} accounts
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${accounts.length > 0 ? (accounts.filter(acc => acc.balance === 0).length / accounts.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Negative Balance</span>
                    <span className="text-sm font-semibold text-red-600">
                      {accounts.filter(acc => acc.balance < 0).length} accounts
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${accounts.length > 0 ? (accounts.filter(acc => acc.balance < 0).length / accounts.length) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-[#6aba54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Keep your accounts updated to maintain accurate financial tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account List */}
          <div className="lg:col-span-2">
            <AccountList accounts={accounts} onRefresh={loadAccounts} />
            
            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Reconcile</h4>
                    <p className="text-xs text-gray-600">Verify account balances</p>
                  </div>
                </div>
                <button className="w-full bg-white text-blue-600 hover:bg-blue-50 text-sm font-medium py-2 px-4 rounded-lg border border-blue-200 transition-colors duration-200">
                  Start Reconciliation
                </button>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Export</h4>
                    <p className="text-xs text-gray-600">Download account data</p>
                  </div>
                </div>
                <button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 text-sm font-medium py-2 px-4 rounded-lg border border-emerald-200 transition-colors duration-200">
                  Export Report
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Settings</h4>
                    <p className="text-xs text-gray-600">Manage preferences</p>
                  </div>
                </div>
                <button className="w-full bg-white text-purple-600 hover:bg-purple-50 text-sm font-medium py-2 px-4 rounded-lg border border-purple-200 transition-colors duration-200">
                  Account Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};