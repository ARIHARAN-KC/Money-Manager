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

    // console.log("OAuthSuccess - Params:", {
    //   token: !!token,
    //   refreshToken: !!refreshToken,
    //   userId,
    //   name,
    //   email,
    //   error,
    //   isPopup,
    //   hasOpener: !!window.opener,
    //   openerClosed: window.opener?.closed
    // });

    // Handle error case
    if (error) {
      console.error("OAuthSuccess - Error from backend:", error);
      if (isPopup && window.opener && !window.opener.closed) {
        window.opener.postMessage(
          {
            type: "oauth-error",
            message: decodeURIComponent(error)
          },
          window.location.origin
        );
        // Close popup immediately on error
        window.close();
      } else {
        navigate(`/login?error=${encodeURIComponent(error)}`);
      }
      return;
    }

    // Handle missing tokens
    if (!token || !refreshToken || !userId || !name || !email) {
      console.error("OAuthSuccess - Missing required data");
      const errorMsg = "Authentication failed: Missing user data";

      if (isPopup && window.opener && !window.opener.closed) {
        window.opener.postMessage(
          { type: "oauth-error", message: errorMsg },
          window.location.origin
        );
        window.close();
      } else {
        navigate("/login?error=" + encodeURIComponent(errorMsg));
      }
      return;
    }

    // Create user object from URL params
    const user = {
      id: userId,
      name: decodeURIComponent(name),
      email: decodeURIComponent(email)
    };

    // console.log("OAuthSuccess - User from URL:", user);

    // POPUP FLOW - Send data to parent window and CLOSE IMMEDIATELY
    if (isPopup) {
      // console.log("OAuthSuccess - In popup mode");

      if (window.opener && !window.opener.closed) {
        // console.log("OAuthSuccess - Sending success message to opener");

        // Set tokens first (in localStorage of popup - doesn't matter)
        setTokens(token, refreshToken);

        // Send message to parent window
        window.opener.postMessage(
          {
            type: "oauth-success",
            token,
            refreshToken,
            user
          },
          window.location.origin
        );

        // CLOSE POPUP IMMEDIATELY WITHOUT DELAY
        // console.log("OAuthSuccess - Closing popup NOW");
        window.close();
      } else {
        // console.log("OAuthSuccess - No opener or opener closed, falling back to direct nav");
        // Fallback: set tokens and navigate in popup
        setTokens(token, refreshToken);
        auth.setUser(user);
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }

      return; // CRITICAL - Stop execution here
    }

    // NON-POPUP FLOW
    // console.log("OAuthSuccess - Direct navigation flow");
    setTokens(token, refreshToken);
    auth.setUser(user);

    // Force navigation to dashboard
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 100);

  }, [navigate, auth]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
              Completing Sign In...
            </h2>
            <p className="text-gray-600 mb-6">
              Please wait while we securely log you into your account.
            </p>

            {/* Help Text */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                This window will close automatically...
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