// Next.js _app.js ගොනුවට සමානයි
import { AuthProvider } from './auth/AuthContext';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import ProtectedRoute from './components/ProtectedRoute';
// ... අනෙකුත් imports (Ex: Router, Layout)

function App() {
  return (
    <AuthProvider>
      {/* Router Setup එක මෙහිදී සිදුවේ 
        උදාහරණයක් ලෙස, Inventory Page එක ආරක්ෂා කරමු: 
      */}
      
      <main>
        {/* Public Route */}
        <Login /> 
        
        {/* Protected Route (සියලු Authenticated Users සඳහා) */}
        <ProtectedRoute> 
           {/* 'All Authenticated' අවශ්‍ය බැවින් requiredRoles හිස්ව තබමු */}
           <Inventory /> 
        </ProtectedRoute>
        
        {/* Admin/Master සඳහා පමණක් Protected Route */}
        <ProtectedRoute requiredRoles={['MasterAdmin', 'InventoryAdmin']}>
           {/* <StockTransactionPage /> */}
        </ProtectedRoute>
        
      </main>
    </AuthProvider>
  );
}

export default App;
