import { useState, useEffect } from "react";
import { createTransaction, updateTransaction, getTransactionById, type Transaction } from "../../api/transaction";
import apiClient from "../../utils/apiClient";

interface Account {
    _id: string;
    name: string;
    balance: number;
}

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId?: string;
    onSuccess: () => void;
}

export const TransactionModal = ({ isOpen, onClose, transactionId, onSuccess }: TransactionModalProps) => {
    const [form, setForm] = useState({
        type: "Income" as "Income" | "Expense",
        amount: 0,
        description: "",
        category: "",
        division: "Personal" as "Personal" | "Office",
        account: "",
        tags: [] as string[],
    });

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState("");

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await apiClient.get("/accounts");
                let accountsData: Account[] = [];

                if (res.data && Array.isArray(res.data.data)) {
                    accountsData = res.data.data;
                } else if (Array.isArray(res.data)) {
                    accountsData = res.data;
                } else if (res.data && Array.isArray(res.data.items)) {
                    accountsData = res.data.items;
                }

                setAccounts(accountsData);

                if (accountsData.length > 0 && !form.account) {
                    setForm(prev => ({ ...prev, account: accountsData[0]._id }));
                }
            } catch (err) {
                console.error("Failed to fetch accounts:", err);
            }
        };

        fetchAccounts();

        if (transactionId) {
            getTransactionById(transactionId).then((t: Transaction) =>
                setForm({
                    type: t.type,
                    amount: t.amount,
                    description: t.description ?? "",
                    category: t.category,
                    division: t.division,
                    account: t.account._id,
                    tags: t.tags || [],
                })
            );
        }
    }, [transactionId]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.amount <= 0) {
            alert("Amount must be greater than 0");
            return;
        }

        if (!form.category.trim()) {
            alert("Category is required");
            return;
        }

        if (!form.account) {
            alert("Please select an account");
            return;
        }

        setLoading(true);

        try {
            const transactionData = {
                type: form.type,
                amount: form.amount,
                description: form.description || undefined,
                category: form.category,
                division: form.division,
                account: form.account,
                tags: form.tags.length > 0 ? form.tags : undefined,
            };

            if (transactionId) {
                await updateTransaction(transactionId, transactionData);
            } else {
                await createTransaction(transactionData);
            }

            onSuccess();
            onClose();
            setForm({
                type: "Income",
                amount: 0,
                description: "",
                category: "",
                division: "Personal",
                account: accounts[0]?._id || "",
                tags: [],
            });
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                {/* Modal */}
                <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${transactionId ? "bg-amber-500" : "bg-[#6aba54]"}`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {transactionId ? "Edit Transaction" : "Add New Transaction"}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {transactionId ? "Update transaction details" : "Record income or expense"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-4">
                        <div className="space-y-4">
                            {/* Type Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <div className="flex space-x-2">
                                    {(["Income", "Expense"] as const).map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setForm({ ...form, type })}
                                            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${form.type === type
                                                ? type === "Income"
                                                    ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                                                    : "bg-red-100 border-red-300 text-red-700"
                                                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54]"
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54]"
                                    placeholder="e.g., Food, Salary, Transport"
                                    list="categories"
                                    required
                                />
                                <datalist id="categories">
                                    <option value="Food & Dining" />
                                    <option value="Shopping" />
                                    <option value="Transport" />
                                    <option value="Bills & Utilities" />
                                    <option value="Entertainment" />
                                    <option value="Healthcare" />
                                    <option value="Education" />
                                    <option value="Salary" />
                                    <option value="Investment" />
                                    <option value="Fuel" />
                                    <option value="Movie" />
                                    <option value="Loan" />
                                    <option value="Medical" />
                                </datalist>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54]"
                                    placeholder="Add a note about this transaction"
                                />
                            </div>

                            {/* Division */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                                <div className="flex space-x-2">
                                    {(["Personal", "Office"] as const).map((division) => (
                                        <button
                                            key={division}
                                            type="button"
                                            onClick={() => setForm({ ...form, division })}
                                            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${form.division === division
                                                ? division === "Personal"
                                                    ? "bg-blue-100 border-blue-300 text-blue-700"
                                                    : "bg-purple-100 border-purple-300 text-purple-700"
                                                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            {division}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Account */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                                <select
                                    name="account"
                                    value={form.account}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54]"
                                    required
                                >
                                    <option value="">Select Account</option>
                                    {accounts.map((account) => (
                                        <option key={account._id} value={account._id}>
                                            {account.name} (₹{account.balance.toLocaleString()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                                <div className="flex space-x-2 mb-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54]"
                                        placeholder="Add tag and press Enter"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleTagAdd}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                    >
                                        Add
                                    </button>
                                </div>
                                {form.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {form.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleTagRemove(tag)}
                                                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#6aba54] hover:bg-[#5aa044] rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? "Saving..." : transactionId ? "Update" : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};