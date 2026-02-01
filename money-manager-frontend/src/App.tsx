import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

//Auth
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OAuthSuccess } from "./pages/OAuthSuccess";

//Protected
import { ProtectedRoute } from "./routes/ProtectedRoute";

//Pages
import { DashboardPage } from "./pages/DashboardPage";
import { AccountsPage } from "./pages/AccountsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { ReportsPage } from "./pages/ReportsPage";

//Components
import { TransferForm } from "./components/Transactions/TransferForm";  
//Layout
import { Layout } from "./components/Layout/Layout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />

          {/* Protected Routes with Layout */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/accounts" element={
            <ProtectedRoute>
              <Layout>
                <AccountsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <Layout>
                <TransactionsPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/transactions/transfer" element={
            <ProtectedRoute>
              <Layout>
                <TransferForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/budget" element={
            <ProtectedRoute>
              <Layout>
                <BudgetPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;