import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import TrackOrderPage from './pages/TrackOrderPage';
import ReturnsPage from './pages/ReturnsPage';
import ContactPage from './pages/ContactPage';

// ScrollToTop Helper
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

// Layout for Public Pages
const PublicLayout = ({ children }) => (
    <>
        <Navbar />
        {children}
        <Footer />
    </>
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
                <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
                <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />
                <Route path="/profile" element={<PublicLayout><ProfilePage /></PublicLayout>} />

                {/* Customer Service Routes */}
                <Route path="/track-order" element={<PublicLayout><TrackOrderPage /></PublicLayout>} />
                <Route path="/returns" element={<PublicLayout><ReturnsPage /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

                {/* Admin Route (No Footer/Navbar override if desired, or keep it. Dashboard has its own sidebar) */}
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Worker Route */}
                <Route path="/worker" element={<WorkerDashboard />} />

                {/* Staff Login - could be same as Login but with redirect */}
                <Route path="/staff-login" element={<PublicLayout><LoginPage /></PublicLayout>} />

                {/* 404 */}
                <Route path="*" element={<PublicLayout><div className="text-center py-40 font-bold text-2xl text-stone-400">Page Not Found</div></PublicLayout>} />
            </Routes>
        </>
    );
}

export default App;