import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Profile from './pages/Profile';
import Users from './pages/Users'; 
import NotFound from './pages/NotFound';
import { useSelector } from 'react-redux';

// Auth Guard
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Admin Guard
const AdminRoute = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <PrivateRoute>
                <Layout>
                  <Courses />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <AdminRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </AdminRoute>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
