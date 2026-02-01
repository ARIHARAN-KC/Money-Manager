export const Loader = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo.svg" alt="FinFlow Logo" className="w-14 h-14 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-linear-to-r from-[#6aba54] to-[#5aa044] bg-clip-text text-transparent">
                FinFlow
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Smart Money Management</p>
            </div>
          </div>
        </div>

        {/* Loading Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">
            {/* Animated Spinner */}
            <div className="mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-[#6aba54] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#6aba54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Loading Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Preparing your financial overview...
            </p>

            {/* Loading Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-linear-to-r from-[#6aba54] to-[#5aa044] h-2 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Fetching your financial data
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} FinFlow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};