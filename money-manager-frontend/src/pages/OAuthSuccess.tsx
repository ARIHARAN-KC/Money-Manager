import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { setTokens } from "../utils/token";
import { AuthContext } from "../context/AuthContext";

export const OAuthSuccess = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext)!;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const userId = params.get("userId");
    const name = params.get("name");
    const email = params.get("email");
    const error = params.get("error");
    const isPopup = params.get("popup") === "true";

    const postError = (message: string) => {
      if (isPopup && window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "oauth-error", message },
          window.location.origin
        );
        window.close();
      } else {
        navigate(`/login?error=${encodeURIComponent(message)}`, {
          replace: true,
        });
      }
    };

    /* ================= ERROR FROM BACKEND ================= */
    if (error) {
      postError(decodeURIComponent(error));
      return;
    }

    /* ================= VALIDATION ================= */
    if (!token || !refreshToken || !userId || !name || !email) {
      postError("Authentication failed: Missing user data");
      return;
    }

    const user = {
      id: userId,
      name: decodeURIComponent(name),
      email: decodeURIComponent(email),
    };

    /* ================= POPUP SUCCESS FLOW ================= */
    if (isPopup && window.opener && !window.opener.closed) {
      setTokens(token, refreshToken);

      window.opener.postMessage(
        {
          type: "oauth-success",
          token,
          refreshToken,
          user,
        },
        window.location.origin
      );

      window.close();
      return;
    }

    /* ================= NON-POPUP FALLBACK ================= */
    setTokens(token, refreshToken);
    auth.setUser(user);
    // ❌ No redirect here (handled elsewhere)
  }, [navigate, auth]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">

        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/logo.svg"
                alt="FinFlow Logo"
                className="w-14 h-14"
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-linear-to-r from-[#6aba54] to-[#5aa044] bg-clip-text text-transparent">
                FinFlow
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Smart Money Management
              </p>
            </div>
          </div>
        </div>

        {/* Loading Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center">

            {/* Spinner */}
            <div className="mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-[#6aba54] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#6aba54]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Completing Sign In...
            </h2>

            <p className="text-gray-600 mb-6">
              Please wait while we securely log you into your account.
            </p>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                This window will close automatically.
                If not closed, please click the button X.
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
