import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { ProtectedRoute } from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Vehicles = lazy(() => import('./pages/Vehicles'));
const Drivers = lazy(() => import('./pages/Drivers'));
const Trips = lazy(() => import('./pages/Trips'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const FuelLogs = lazy(() => import('./pages/FuelLogs'));
const Analytics = lazy(() => import('./pages/Analytics'));
const History = lazy(() => import('./pages/History'));
const About = lazy(() => import('./pages/About'));

const SignUp = lazy(() => import('./pages/SignUp'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Toaster position="top-right" />
            <Suspense fallback={
                <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-4 text-sm font-medium text-text-secondary animate-pulse">Initializing FleetFlow...</p>
                </div>
            }>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />

                    <Route path="/*" element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />

                                    <Route path="/vehicles" element={
                                        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER']}>
                                            <Vehicles />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="/drivers" element={
                                        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER']}>
                                            <Drivers />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="/trips" element={
                                        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER']}>
                                            <Trips />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="/maintenance" element={
                                        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'SAFETY_OFFICER']}>
                                            <Maintenance />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="/fuel" element={
                                        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
                                            <FuelLogs />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="/analytics" element={
                                        <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
                                            <Analytics />
                                        </ProtectedRoute>
                                    } />

                                    <Route path="/history" element={<History />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/profile" element={<Profile />} />

                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </DashboardLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
