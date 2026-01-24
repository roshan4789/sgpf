import React, { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const ReturnsPage = lazy(() => import('./pages/ReturnsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));

// ScrollToTop Helper
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

// Loading fallback
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600 font-medium">Loading...</p>
        </div>
    </div>
);

// Layout for Public Pages
const PublicLayout = ({ children }) => (
    <Suspense fallback={<LoadingFallback />}>
        <>
            <Navbar />
            {children}
            <Footer />
        </>
    </Suspense>
);

function App() {
    return (
        <>
            <ScrollToTop />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                <Route path="/product/:id" element={<PublicLayout><ProductDetailsPage /></PublicLayout>} />
                <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
                <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>} />
                <Route path="/register" element={<Suspense fallback={<LoadingFallback />}><RegisterPage /></Suspense>} />
                <Route path="/profile" element={<PublicLayout><ProfilePage /></PublicLayout>} />

                {/* Customer Service Routes */}
                <Route path="/track-order" element={<PublicLayout><TrackOrderPage /></PublicLayout>} />
                <Route path="/returns" element={<PublicLayout><ReturnsPage /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
                <Route path="/terms-of-service" element={<PublicLayout><TermsOfServicePage /></PublicLayout>} />

                {/* Admin Route (No Footer/Navbar override if desired, or keep it. Dashboard has its own sidebar) */}
                <Route path="/admin" element={<Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>} />

                {/* Worker Route */}
                <Route path="/worker" element={<Suspense fallback={<LoadingFallback />}><WorkerDashboard /></Suspense>} />

                {/* Staff Login - could be same as Login but with redirect */}
                <Route path="/staff-login" element={<PublicLayout><LoginPage /></PublicLayout>} />

                {/* 404 */}
                <Route path="*" element={<PublicLayout><div className="text-center py-40 font-bold text-2xl text-stone-400">Page Not Found</div></PublicLayout>} />
            </Routes>
        </>
    );
}

export default App;