import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Courses from './pages/Courses';
import Feedback from './pages/Feedback';
import ComposeFeedback from './pages/Feedback/ComposeFeedback';
import Profile from './pages/Profile';
import PublicDashboard from './pages/PublicDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SchoolDashboard from './pages/SchoolDashboard';
import SchoolCourses from './pages/SchoolCourses';
import SchoolInstructors from './pages/SchoolInstructors';
import ViceDirectorCourses from './pages/ViceDirectorCourses';
import ViceDirectorDashboard from './pages/ViceDirectorDashboard';
import ScientificDirectorDashboard from './pages/ScientificDirectorDashboard';
import ScientificDirectorCourses from './pages/ScientificDirectorCourses';
import FinanceDashboard from './pages/FinanceDashboard';
import FinanceCourses from './pages/FinanceCourses';
import PaymentCalculator from './pages/PaymentCalculator';
import { useSelector } from 'react-redux';
import PrivateRoute from './components/PrivateRoute'; // Assuming PrivateRoute is defined in this file

const App = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Wrapper for public pages that includes footer
  const PublicPageWrapper = ({ children }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {children}
      <Footer />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SnackbarProvider maxSnack={3}>
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
          <Route
            path="/forgot-password"
            element={
              !isAuthenticated ? (
                <PublicPageWrapper>
                  <ForgotPassword />
                </PublicPageWrapper>
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              !isAuthenticated ? (
                <PublicPageWrapper>
                  <ResetPassword />
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
                user?.role === 'school-dean' ? (
                  <Navigate to="/school-dean/dashboard" replace />
                ) : user?.role === 'vice-scientific-director' ? (
                  <Navigate to="/vice-director/dashboard" replace />
                ) : user?.role === 'scientific-director' ? (
                  <Navigate to="/scientific-director/dashboard" replace />
                ) : user?.role === 'finance' ? (
                  <Navigate to="/finance/dashboard" replace />
                ) : (
                  <Layout>
                    <Dashboard />
                  </Layout>
                )
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          {user?.role === 'school-dean' && (
            <>
              <Route
                path="/school-dean/dashboard"
                element={
                  <PrivateRoute allowedRoles={['school-dean']}>
                    <Layout>
                      <SchoolDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/school-dean/courses"
                element={
                  <PrivateRoute allowedRoles={['school-dean']}>
                    <Layout>
                      <SchoolCourses />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/school-dean/instructors"
                element={
                  <PrivateRoute allowedRoles={['school-dean']}>
                    <Layout>
                      <SchoolInstructors />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </>
          )}
          {user?.role === 'vice-scientific-director' && (
            <>
              <Route
                path="/vice-director/dashboard"
                element={
                  <PrivateRoute allowedRoles={['vice-scientific-director']}>
                    <Layout>
                      <ViceDirectorDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/vice-director/courses"
                element={
                  <PrivateRoute allowedRoles={['vice-scientific-director']}>
                    <Layout>
                      <ViceDirectorCourses />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </>
          )}
          {user?.role === 'scientific-director' && (
            <>
              <Route
                path="/scientific-director/dashboard"
                element={
                  <PrivateRoute allowedRoles={['scientific-director']}>
                    <Layout>
                      <ScientificDirectorDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/scientific-director/courses"
                element={
                  <PrivateRoute allowedRoles={['scientific-director']}>
                    <Layout>
                      <ScientificDirectorCourses />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </>
          )}
          {user?.role === 'finance' && (
            <>
              <Route
                path="/finance/dashboard"
                element={
                  <PrivateRoute allowedRoles={['finance']}>
                    <Layout>
                      <FinanceDashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/finance/courses"
                element={
                  <PrivateRoute allowedRoles={['finance']}>
                    <Layout>
                      <FinanceCourses />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/finance/payment-calculator"
                element={
                  <PrivateRoute allowedRoles={['finance']}>
                    <Layout>
                      <PaymentCalculator />
                    </Layout>
                  </PrivateRoute>
                }
              />
            </>
          )}
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
              isAuthenticated && user?.role !== 'school-dean' ? (
                <Layout>
                  <Courses />
                </Layout>
              ) : (
                <Navigate to="/dashboard" replace />
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
          <Route
            path="/feedback/compose"
            element={
              isAuthenticated ? (
                <Layout>
                  <ComposeFeedback />
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
      </SnackbarProvider>
    </Box>
  );
};

export default App;
