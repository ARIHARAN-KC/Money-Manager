import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export const Sidebar = () => {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      path: "/accounts",
      label: "Accounts",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      path: "/budget",
      label: "Budget",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      path: "/reports",
      label: "Reports",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6aba54] to-[#5aa044] rounded-lg flex items-center justify-center shadow-sm">
            <img src="/logo.svg" alt="FinFlow Logo" className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#6aba54] to-[#5aa044] bg-clip-text text-transparent">
              FinFlow
            </h1>
            <p className="text-xs text-gray-500">Smart Money</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6aba54]/20 to-[#5aa044]/20 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-[#6aba54]">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.name || "User"}</p>
            <p className="text-sm text-gray-500">{user?.email || "user@example.com"}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#6aba54]/10 to-[#5aa044]/10 text-[#6aba54] border border-[#6aba54]/20"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className={`${isActive ? "text-[#6aba54]" : "text-gray-400"}`}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-[#6aba54] rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => auth?.logout()}
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};