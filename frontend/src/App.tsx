import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import DashboardPage from "./components/dashboard/DashboardPage";
import InventoryPage from "./components/inventory/InventoryPage";
import SignInPage from "./components/auth/SignInPage";
import { VerifyRequest } from "./components/auth/components/VerifyRequest";
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/components/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/verify-request" element={<VerifyRequest />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                  </ProtectedRoute>
        
              } 
            />
            <Route 
              path="/inventory" 
              element={
                
                  <InventoryPage />
                
              } 
            />
          </Routes>
        </div>
      </Router>
      </AuthProvider>
  );
}

export default App;