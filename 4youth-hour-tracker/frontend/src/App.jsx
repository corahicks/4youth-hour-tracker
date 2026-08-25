import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import {Routes, Route, Navigate } from 'react-router-dom';


function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/" />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <EmployeeDashboard />
        </ProtectedRoute> 
      } />
      <Route path="/admin-dashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute> 
      } />
    </Routes>

  )
}

export default App