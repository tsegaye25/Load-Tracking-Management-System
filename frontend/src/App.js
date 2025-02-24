import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Box } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/Layout';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Courses from './pages/Courses';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import PublicDashboard from './pages/PublicDashboard';
import { useSelector } from 'react-redux';

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Wrapper for public pages that includes footer
  const PublicPageWrapper = ({ children }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {children}
      <Footer />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              !isAuthenticated ? (
                <PublicPageWrapper>
                  <PublicDashboard />
                </PublicPageWrapper>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <PublicPageWrapper>
                  <Login />
                </PublicPageWrapper>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Layout>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                <Layout>
                  <Profile />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/users"
            element={
              isAuthenticated ? (
                <Layout>
                  <Users />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/courses"
            element={
              isAuthenticated ? (
                <Layout>
                  <Courses />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/feedback"
            element={
              isAuthenticated ? (
                <Layout>
                  <Feedback />
                </Layout>
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch all route - redirect to appropriate dashboard */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

export default App;
