import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // console.log("Dashboard - Auth state:", {
    //   user: auth?.user,
    //   loading: auth?.loading
    // });
    
    // If no user and not loading, redirect to login
    if (!auth?.loading && !auth?.user) {
      // console.log("Dashboard - No user, redirecting to login");
      navigate("/login");
    }
  }, [auth, navigate]);

  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6aba54]"></div>
      </div>
    );
  }

  if (!auth?.user) {
    return null; // Will redirect in useEffect
  }

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/logo.svg" alt="FinFlow Logo" className="w-10 h-10" />
              <span className="ml-3 text-2xl font-bold text-[#6aba54]">FinFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {auth.user.name}!</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Your Dashboard!
            </h1>
            <p className="text-gray-600 mb-6">
              You have successfully logged in with OAuth.
            </p>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">User Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">ID:</span> {auth.user.id}</p>
                <p><span className="font-medium">Name:</span> {auth.user.name}</p>
                <p><span className="font-medium">Email:</span> {auth.user.email}</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700">
                Success! OAuth authentication is working correctly.
              </p>
              <p className="text-sm text-green-600 mt-2">
                Popup closed automatically and you were redirected to dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;