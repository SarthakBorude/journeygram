import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
    const { user, logout, token } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Explore', path: '/explore' },
        { name: 'Trips', path: '/my-trips' },
        { name: 'Canvas', path: '/canvas/new' },
    ];

    return (
        <header className="fixed top-6 left-0 right-0 z-50 px-6 pointer-events-none">
            <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/50 rounded-[2.5rem] py-2 px-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                
                {/* Brand Section */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-3 transition-transform">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight leading-none text-zinc-900">Journey</span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">GRAM</span>
                    </div>
                </Link>

                {/* Navigation - Centered Pill Group */}
                <nav className="flex items-center gap-1 bg-zinc-50/50 p-1 rounded-full border border-zinc-100">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-5 py-2 rounded-full text-[11px] font-bold tracking-wide transition-all ${
                                    isActive 
                                        ? 'bg-white text-zinc-900 shadow-sm border border-zinc-100' 
                                        : 'text-zinc-400 hover:text-zinc-900 hover:bg-white/50'
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                    >
                        {theme === 'dark' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.636 7.636l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>

                    {token ? (
                        <div className="flex items-center gap-2 pl-4 border-l border-zinc-100">
                            <Link to="/profile" className="group flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center text-violet-600 font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
                                    {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-zinc-900">Profile</span>
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className="px-6 py-2.5 bg-zinc-900 text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-zinc-900/20">
                            Join
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
