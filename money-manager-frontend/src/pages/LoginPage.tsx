import { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { setTokens } from "../utils/token";

export const LoginPage = () => {
  const auth = useContext(AuthContext)!;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const GOOGLE_AUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/google?popup=true`;

  // Message handler
  const handleOAuthMessage = (event: MessageEvent) => {
    // console.log("LoginPage - Received message from:", event.origin);
    // console.log("LoginPage - Message data type:", event.data?.type);

    // Only accept messages from same origin
    if (event.origin !== window.location.origin) {
      // console.log("LoginPage - Origin mismatch, ignoring");
      return;
    }

    const { type, token, refreshToken, user, message } = event.data;

    // console.log("LoginPage - Processing message type:", type);

    if (type === "oauth-success") {
      // console.log("LoginPage - OAuth success! User:", user);

      if (token && refreshToken && user) {
        // Set tokens immediately
        setTokens(token, refreshToken);

        // Update auth context
        auth.setUser(user);
        setIsOAuthLoading(false);

        // console.log("LoginPage - FORCING navigation to dashboard in main window");
        setTimeout(() => {
          // Use window.location for 100% guaranteed navigation
          window.location.href = "/dashboard";
        }, 300); // Slightly longer delay to ensure everything is set
      } else {
        console.error("LoginPage - OAuth success but missing data");
        setError("Authentication failed: Missing user data");
        setIsOAuthLoading(false);
      }
    } else if (type === "oauth-error") {
      // console.log("LoginPage - OAuth error:", message);
      setError(message || "Google authentication failed.");
      setIsOAuthLoading(false);
    }
  };
  // Setup message listener
  useEffect(() => {
    // console.log("LoginPage - Setting up message listener");
    window.addEventListener("message", handleOAuthMessage);

    return () => {
      // console.log("LoginPage - Cleaning up message listener");
      window.removeEventListener("message", handleOAuthMessage);
    };
  }, [auth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      //Use await and ensure login completes
      await auth.login(email, password);

      //small delay to ensure state is updated
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        "Invalid credentials. Please try again.";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginPopup = () => {
    setIsOAuthLoading(true);
    setError("");

    // console.log("LoginPage - Opening Google OAuth popup");

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      GOOGLE_AUTH_URL,
      "google-auth",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,popup=yes`
    );

    if (!popup) {
      setError("Popup blocked! Please allow popups for this site.");
      setIsOAuthLoading(false);
      return;
    }

    // Focus on the popup
    popup.focus();

    // Check if popup closes
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        setIsOAuthLoading(false);
        // console.log("LoginPage - Popup closed");

        // After popup closes, check if we have tokens and redirect
        const token = localStorage.getItem("accessToken");
        if (token) {
          // console.log("LoginPage - Token found after popup close, redirecting to dashboard");
          // Small delay to ensure everything is processed
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        }
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-linaer-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
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
          <h2 className="text-2xl font-semibold text-gray-800">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">
            Manage your finances, track expenses, and achieve your financial goals
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-linear-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#6aba54]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54] focus:bg-white transition-all duration-200 placeholder-gray-400"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-[#6aba54] hover:text-[#5aa044] transition-colors inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-transform duration-200 group-focus-within:scale-110">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-[#6aba54]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6aba54] focus:border-[#6aba54] focus:bg-white transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-medium text-white bg-[#6aba54] hover:bg-[#5aa044] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6aba54] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg hover:shadow-xl ${isLoading ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign in
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLoginPopup}
                disabled={isOAuthLoading}
                className={`w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-100 transition-all duration-200 hover:border-gray-300 hover:shadow-sm ${isOAuthLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                {isOAuthLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              New to FinFlow?{" "}
              <Link
                to="/register"
                className="font-medium text-[#6aba54] hover:text-[#5aa044] transition-colors inline-flex items-center group"
              >
                Create an account
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} FinFlow. All rights reserved.{" "}
            <a href="#" className="text-[#6aba54] hover:text-[#5aa044] transition-colors">Terms</a> •{" "}
            <a href="#" className="text-[#6aba54] hover:text-[#5aa044] transition-colors">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
};