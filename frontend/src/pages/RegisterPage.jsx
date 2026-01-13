import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

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
        setError('');
        try {
            await register({ name, email, phone, password });
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-stone-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2">Create Account</h1>
                    <p className="text-stone-500">Join the SGPF family today</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 focus:bg-white transition-all"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 focus:bg-white transition-all"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 focus:bg-white transition-all"
                            placeholder="1234567890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            minLength="10"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 focus:bg-white transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-50 focus:bg-white transition-all"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button className="w-full py-3 text-lg" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="text-center mt-8 text-stone-600">
                    Already have an account? <Link to={`/login?redirect=${redirect}`} className="text-amber-700 font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
