import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth and Components
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages/Views
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import StockTransaction from './pages/StockTransaction';
import LogSearch from './pages/LogSearch';

// ⚠️ Navbar එකක් සහ Layout Component එකක් සෑදීම හොඳ පුරුද්දකි
const Layout = ({ children }) => (
    <div style={{ padding: '0 20px' }}>
        <nav style={{ borderBottom: '1px solid #ddd', padding: '10px 0', marginBottom: '20px' }}>
            <a href="/" style={{ marginRight: '15px', textDecoration: 'none' }}>Home (Inventory)</a>
            <a href="/stock" style={{ marginRight: '15px', textDecoration: 'none' }}>Stock IN/OUT</a>
            <a href="/logs" style={{ marginRight: '15px', textDecoration: 'none' }}>Logs</a>
        </nav>
        {children}
    </div>
);


function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout> {/* සියලු පිටු Layout එකෙන් ඔතනු ලැබේ */}
          <Routes>
            
            {/* 1. Public Route: Login Page */}
            <Route path="/login" element={<Login />} />

            {/* 2. Protected Route: Inventory View (සියලුම Authenticated Users සඳහා) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Inventory /> 
                </ProtectedRoute>
              } 
            />
            
            {/* 3. Protected Route: Stock Transaction (Admin/Master පමණක්) */}
            <Route 
              path="/stock" 
              element={
                <ProtectedRoute requiredRoles={['MasterAdmin', 'InventoryAdmin']}>
                  <StockTransaction /> 
                </ProtectedRoute>
              } 
            />

            {/* 4. Protected Route: Log Search (Admin/Master පමණක්) */}
            <Route 
              path="/logs" 
              element={
                <ProtectedRoute requiredRoles={['MasterAdmin', 'InventoryAdmin']}>
                  <LogSearch /> 
                </ProtectedRoute>
              } 
            />

            {/* 5. Catch-all: නොදන්නා මාර්ගය Home වෙත යොමු කිරීම */}
            <Route path="*" element={<Navigate to="/" />} />
            
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
