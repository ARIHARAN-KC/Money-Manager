import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";

export const MobileHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/accounts", label: "Accounts" },
    { path: "/transactions", label: "Transactions" },
    { path: "/budget", label: "Budget" },
    { path: "/reports", label: "Reports" },
  ];

  return (
    <div className="lg:hidden">
      {/* Mobile Header Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-[#6aba54]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.svg" alt="FinFlow Logo" className="w-14 h-14 text-white" />
              </div>
              <span className="font-bold text-gray-800">FinFlow</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name || "User"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-lg">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                      ? "bg-gradient-to-r from-[#6aba54]/10 to-[#5aa044]/10 text-[#6aba54] font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  auth?.logout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};