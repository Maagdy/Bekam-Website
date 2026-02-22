import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RegionProvider } from './contexts/RegionContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const Product = lazy(() => import('./pages/Product'));
const Store = lazy(() => import('./pages/Store'));
const Submit = lazy(() => import('./pages/Submit'));
const Regions = lazy(() => import('./pages/Regions'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Basket = lazy(() => import('./pages/Basket'));
const Inflation = lazy(() => import('./pages/Inflation'));
const Challenge = lazy(() => import('./pages/Challenge'));

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminPrices = lazy(() => import('./pages/admin/Prices'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminStores = lazy(() => import('./pages/admin/Stores'));
const AdminRegions = lazy(() => import('./pages/admin/Regions'));

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <RegionProvider>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/search" element={<Layout><Search /></Layout>} />
                  <Route path="/product/:id" element={<Layout><Product /></Layout>} />
                  <Route path="/store/:id" element={<Layout><Store /></Layout>} />
                  <Route path="/regions" element={<Layout><Regions /></Layout>} />
                  <Route path="/inflation" element={<Layout><Inflation /></Layout>} />

                  {/* Protected routes */}
                  <Route path="/submit" element={
                    <Layout>
                      <ProtectedRoute>
                        <Submit />
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/profile" element={
                    <Layout>
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/basket" element={
                    <Layout>
                      <ProtectedRoute>
                        <Basket />
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/challenge" element={<Layout><Challenge /></Layout>} />

                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <Layout>
                      <ProtectedRoute requireAdmin>
                        <AdminLayout><AdminDashboard /></AdminLayout>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin/prices" element={
                    <Layout>
                      <ProtectedRoute requireAdmin>
                        <AdminLayout><AdminPrices /></AdminLayout>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin/products" element={
                    <Layout>
                      <ProtectedRoute requireAdmin>
                        <AdminLayout><AdminProducts /></AdminLayout>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin/stores" element={
                    <Layout>
                      <ProtectedRoute requireAdmin>
                        <AdminLayout><AdminStores /></AdminLayout>
                      </ProtectedRoute>
                    </Layout>
                  } />
                  <Route path="/admin/regions" element={
                    <Layout>
                      <ProtectedRoute requireAdmin>
                        <AdminLayout><AdminRegions /></AdminLayout>
                      </ProtectedRoute>
                    </Layout>
                  } />

                  {/* 404 catch-all */}
                  <Route path="*" element={<Layout><NotFound /></Layout>} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </RegionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
