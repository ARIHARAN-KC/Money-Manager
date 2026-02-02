import { useState } from "react";
import { createAccount } from "../../api/accounts";
import type { CreateAccountData } from "../../api/accounts";

interface AccountFormProps {
  onSuccess: () => void;
  hasPrimaryAccount?: boolean;
}

export const AccountForm = ({ onSuccess, hasPrimaryAccount = false }: AccountFormProps) => {
  const [formData, setFormData] = useState<CreateAccountData>({
    name: "",
    balance: 0,
    isPrimary: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
               name === "balance" ? parseFloat(value) || 0 : value
    }));
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Account name is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createAccount(formData);
      setFormData({ name: "", balance: 0, isPrimary: false });
      onSuccess();
    } catch (err: any) {
      console.error("Create account failed", err);
      const errorMessage = err.response?.data?.message || "Failed to create account";
      
      // Handle specific error cases
      if (errorMessage.includes("already exists")) {
        setError("An account with this name already exists. Please use a different name.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-linear-to-br from-[#6aba54]/10 to-[#5aa044]/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-[#6aba54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Add New Account</h2>
            <p className="text-sm text-gray-500">Create a new financial account</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Account Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <input
              id="name"
              name="name"
              className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54] focus:bg-white transition-all duration-200 placeholder-gray-400"
              placeholder="e.g., Savings Account, Credit Card"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
            Opening Balance
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              min="0"
              className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54] focus:bg-white transition-all duration-200 placeholder-gray-400"
              placeholder="0.00"
              value={formData.balance}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500">₹</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Enter the current balance in this account (optional)
          </p>
        </div>

        <div className="flex items-center">
          <input
            id="isPrimary"
            name="isPrimary"
            type="checkbox"
            checked={formData.isPrimary}
            onChange={handleChange}
            disabled={loading || hasPrimaryAccount}
            className="h-5 w-5 text-[#6aba54] focus:ring-[#6aba54] border-gray-300 rounded"
          />
          <label htmlFor="isPrimary" className="ml-3">
            <span className="text-sm font-medium text-gray-700">
              Set as primary account
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {hasPrimaryAccount 
                ? "You already have a primary account. Setting this as primary will update your current primary account."
                : "This will be your main account for transactions."}
            </p>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-[#6aba54] hover:bg-[#5aa044] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6aba54] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl ${loading || !formData.name.trim() ? "opacity-80 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white mr-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Account
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};