import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';
import { ArrowLeft } from 'lucide-react';

const LoginPage = () => {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const redirect = searchParams.get('redirect') || '/';

    useEffect(() => {
        if (user) {
            navigate(redirect);
        }
    }, [user, navigate, redirect]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4">
            <div className="w-full max-w-[520px]">
                {/* Back Button */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition-colors group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to home</span>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-10">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 rounded-xl mb-6">
                            <img
                                src={logo}
                                alt="SGPF"
                                className="w-12 h-12 object-contain"
                            />
                        </div>
                        <h1 className="text-3xl font-bold text-stone-900 mb-2">Welcome back</h1>
                        <p className="text-stone-600">Sign in to your account</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-stone-900 mb-2">
                                Email address
                            </label>
                            <input
                                type="email"
                                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent focus:bg-white transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-stone-900 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent focus:bg-white transition-all"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stone-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-stone-500 text-sm font-medium">
                                Don't have an account?
                            </span>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <Link
                        to={`/register?redirect=${redirect}`}
                        className="block w-full text-center py-3.5 border-2 border-stone-200 hover:border-stone-900 text-stone-700 hover:text-stone-900 font-semibold rounded-xl transition-all hover:bg-stone-50"
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
