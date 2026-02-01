import { useState, useEffect } from "react";
import { getBudgets, createBudget, deleteBudget, type Budget } from "../../api/budget";
import { getTransactions } from "../../api/transaction";

export const BudgetPlanner = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newBudget, setNewBudget] = useState({
    category: "",
    division: "Personal" as "Personal" | "Office",
    allocated: 0,
    period: "monthly" as "weekly" | "monthly" | "yearly",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const budgetsData = await getBudgets();
      
      // Fetch transactions to calculate spent amounts
      const transactionsRes = await getTransactions(1, 1000);
      const transactions = transactionsRes.data || [];
      
      // Calculate spent amounts per category and division
      const budgetsWithSpent = budgetsData.map(budget => {
        const spent = transactions
          .filter((t: any) => 
            t.type === "Expense" &&
            t.category === budget.category &&
            t.division === budget.division
          )
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        return { ...budget, spent };
      });
      
      setBudgets(budgetsWithSpent);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.category || newBudget.allocated <= 0) {
      alert("Please fill all fields correctly");
      return;
    }

    setLoading(true);
    try {
      await createBudget(newBudget);
      setNewBudget({ category: "", division: "Personal", allocated: 0, period: "monthly" });
      fetchBudgets();
    } catch (err: any) {
      console.error("Failed to add budget:", err);
      alert(err.response?.data?.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      await deleteBudget(id);
      fetchBudgets();
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  };

  const getRemaining = (allocated: number, spent: number = 0) => allocated - spent;
  const getPercentage = (allocated: number, spent: number = 0) => 
    allocated > 0 ? (spent / allocated) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Budget Planner</h2>
            <p className="text-sm text-gray-500">Plan and track your spending</p>
          </div>
        </div>
      </div>

      {/* Add Budget Form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-xl">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Add New Budget</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              type="text"
              value={newBudget.category}
              onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Food, Transport"
              list="budget-categories"
            />
            <datalist id="budget-categories">
              <option value="Food & Dining" />
              <option value="Shopping" />
              <option value="Transport" />
              <option value="Entertainment" />
              <option value="Healthcare" />
              <option value="Education" />
              <option value="Bills & Utilities" />
              <option value="Fuel" />
              <option value="Movie" />
            </datalist>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
            <select
              value={newBudget.division}
              onChange={(e) => setNewBudget({ ...newBudget, division: e.target.value as "Personal" | "Office" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Personal">Personal</option>
              <option value="Office">Office</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input
              type="number"
              value={newBudget.allocated}
              onChange={(e) => setNewBudget({ ...newBudget, allocated: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={newBudget.period}
              onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as "weekly" | "monthly" | "yearly" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleAddBudget}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Budget"}
        </button>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading budgets...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No budgets set. Create your first budget to start tracking.
          </div>
        ) : (
          budgets.map((budget) => {
            const remaining = getRemaining(budget.allocated, budget.spent);
            const percentage = getPercentage(budget.allocated, budget.spent);
            const isOverBudget = remaining < 0;

            return (
              <div key={budget._id} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{budget.category}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${budget.division === "Personal" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-purple-100 text-purple-700"}`}>
                        {budget.division}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {budget.period}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteBudget(budget._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent: ₹{budget.spent?.toLocaleString() || 0}</span>
                    <span className="text-gray-600">Budget: ₹{budget.allocated.toLocaleString()}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        percentage > 100
                          ? 'bg-red-500'
                          : percentage > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className={isOverBudget ? 'text-red-600' : 'text-gray-700'}>
                      Remaining: ₹{remaining.toLocaleString()}
                    </span>
                    <span className={percentage > 100 ? 'text-red-600' : 'text-gray-700'}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};