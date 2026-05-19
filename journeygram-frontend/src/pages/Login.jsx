import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();

    const from = location.state?.from?.pathname || "/explore";
    const isDark = theme === 'dark';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden transition-all duration-700 ${
            isDark 
                ? "bg-[#09090b]" 
                : "bg-[radial-gradient(circle_at_top,#faf8ff_0%,#f3eff9_45%,#ebe4f6_100%)]"
        }`}>
            {/* Animated Ambient Glow Spheres */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-violet-400/20 dark:bg-violet-900/10 blur-[120px] animate-glow-drift-1 pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-indigo-300/20 dark:bg-indigo-950/10 blur-[130px] animate-glow-drift-2 pointer-events-none" />

            {/* Bullet Journal Dot Grid Backdrop */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] dark:bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.04] dark:opacity-[0.02]" />

            <div className="w-full max-w-lg z-10">
                
                {/* Floating Card */}
                <div className={`p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] ${
                    isDark ? "glass-premium-dark" : "glass-premium-light"
                } shadow-[0_30px_100px_rgba(99,102,241,0.06)] relative overflow-hidden transition-all duration-500`}>
                    
                    {/* Header Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 dark:opacity-[0.03] select-none pointer-events-none">
                        <svg className="w-full h-full text-indigo-600 dark:text-violet-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="50" cy="50" r="40" strokeDasharray="3 3" />
                            <path d="M50,10 L50,90 M10,50 L90,50" />
                        </svg>
                    </div>

                    {/* Logo & Tagline */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20 mb-6">
                            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-indigo-600 dark:text-violet-300">
                                ✦ Passport Check-In
                            </span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-zinc-950 dark:text-white leading-none">
                            Welcome Back
                        </h1>
                        <p className={`text-sm font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            Access your collaborative travel portfolio
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                        
                        <div className="space-y-1.5">
                            <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${
                                isDark ? "text-zinc-500" : "text-zinc-400"
                            }`}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full px-5 py-4 rounded-2xl text-sm outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white premium-input"
                            />
                        </div>
                        
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center pl-1">
                                <label className={`text-[10px] font-bold uppercase tracking-wider ${
                                    isDark ? "text-zinc-500" : "text-zinc-400"
                                }`}>
                                    Password
                                </label>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 rounded-2xl text-sm outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white premium-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-98 select-none ${
                                isDark 
                                    ? "bg-white text-zinc-950 hover:bg-zinc-200 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)]" 
                                    : "bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
                            } disabled:opacity-50 disabled:pointer-events-none`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-800 dark:border-zinc-500 dark:border-t-white rounded-full animate-spin"></div>
                                    <span>Entering Cabin...</span>
                                </>
                            ) : (
                                <>
                                    <span>Continue Journey</span>
                                    <span>✈</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-10 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/40 text-center">
                        <p className={`text-xs font-medium ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            New traveler?{" "}
                            <Link 
                                to="/register" 
                                className={`font-bold hover:underline ml-1 ${
                                    isDark ? "text-violet-300" : "text-indigo-600"
                                }`}
                            >
                                Register Passport
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;