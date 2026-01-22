import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpeg';
import { ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
    const { register, user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            await register(formData);
        } catch (err) {
            setError(err.message || 'Registration failed');
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
                        <h1 className="text-3xl font-bold text-stone-900 mb-2">Create account</h1>
                        <p className="text-stone-600">Join SGPF today</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-stone-900 mb-2">
                                Full name
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent focus:bg-white transition-all"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

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
                                Phone number
                            </label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 border border-r-0 border-stone-300 bg-stone-50 text-stone-600 rounded-l-xl font-medium">+91</span>
                                <input
                                    type="tel"
                                    className="flex-1 px-4 py-3.5 bg-stone-50 border border-stone-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent focus:bg-white transition-all"
                                    placeholder="1234567890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    minLength="10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-stone-900 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent focus:bg-white transition-all"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-stone-900 mb-2">
                                Confirm password
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent focus:bg-white transition-all"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stone-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-stone-500 text-sm font-medium">
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    {/* Sign In Link */}
                    <Link
                        to={`/login?redirect=${redirect}`}
                        className="block w-full text-center py-3.5 border-2 border-stone-200 hover:border-stone-900 text-stone-700 hover:text-stone-900 font-semibold rounded-xl transition-all hover:bg-stone-50"
                    >
                        Sign in instead
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
