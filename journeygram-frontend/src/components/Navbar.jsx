import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
    const { user, logout, token } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const isDark = theme === 'dark';
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Explore', path: '/explore' },
        { name: 'Trips', path: '/my-trips' },
        { name: 'Canvas', path: '/canvas/new' },
    ];

    return (
        <header className="fixed top-6 left-0 right-0 z-50 px-6 pointer-events-none">
            <div className={`max-w-5xl mx-auto flex items-center justify-between pointer-events-auto rounded-[2rem] py-2.5 px-6 transition-all duration-500 shadow-[0_15px_40px_rgba(99,102,241,0.04)] ${
                isDark ? "glass-premium-dark" : "glass-premium-light"
            }`}>
                
                {/* Brand Logo Section */}
                <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md group-hover:rotate-3 group-hover:scale-105 transition-transform duration-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 11V9a2 2 0 00-2-2m2 4v4a2 2 0 104 0v-1m-4-3H9m2 0h4m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-tight leading-none text-zinc-950 dark:text-white">Journey</span>
                        <span className="text-[8px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mt-0.5">GRAM</span>
                    </div>
                </Link>

                {/* Navigation Pill Group (Desktop) */}
                {token && (
                    <nav className={`hidden md:flex items-center gap-1 p-1 rounded-full border transition-colors ${
                        isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-100/50 border-zinc-200/40"
                    }`}>
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                        isActive 
                                            ? isDark 
                                                ? 'bg-white text-zinc-950 shadow-sm border border-zinc-100' 
                                                : 'bg-zinc-950 text-white shadow-md border border-zinc-950'
                                            : isDark
                                                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                                                : 'text-zinc-500 hover:text-zinc-950 hover:bg-white/60'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                )}

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                            isDark 
                                ? "text-zinc-400 hover:text-white hover:bg-zinc-900" 
                                : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                        }`}
                        aria-label="Toggle Theme"
                    >
                        {isDark ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.636 7.636l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {/* Auth Status & Profile Link (Desktop) */}
                    {token ? (
                        <>
                            <div className={`hidden md:flex items-center gap-3 pl-3 border-l ${
                                isDark ? "border-zinc-800" : "border-zinc-200"
                            }`}>
                                <Link to="/profile" className="group flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className={`hidden sm:block text-[9px] font-extrabold uppercase tracking-widest ${
                                        isDark ? "text-zinc-300 group-hover:text-white" : "text-zinc-600 group-hover:text-zinc-950"
                                    }`}>
                                        Profile
                                    </span>
                                </Link>
                                <button 
                                    onClick={logout}
                                    className={`text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer pl-1 ${
                                        isDark ? "text-zinc-500 hover:text-red-400" : "text-zinc-400 hover:text-red-500"
                                    }`}
                                >
                                    Leave
                                </button>
                            </div>

                            {/* Mobile Hamburger Toggle button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`w-9 h-9 flex md:hidden items-center justify-center rounded-full transition-colors cursor-pointer ${
                                    isDark 
                                        ? "text-zinc-400 hover:text-white hover:bg-zinc-900" 
                                        : "text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100"
                                }`}
                                aria-label="Toggle Navigation Menu"
                            >
                                {isOpen ? (
                                    <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </>
                    ) : (
                        <Link 
                            to="/login" 
                            className={`px-5 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all select-none ${
                                isDark 
                                    ? "bg-white text-zinc-950 hover:bg-zinc-200 hover:shadow-[0_8px_20px_rgba(255,255,255,0.08)]" 
                                    : "bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
                            }`}
                        >
                            Join
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Dropdown Glass Menu Drawer */}
            {token && isOpen && (
                <div className={`mt-3 max-w-md mx-auto pointer-events-auto rounded-[2rem] p-5 border transition-all duration-300 shadow-xl ${
                    isDark ? "glass-premium-dark border-zinc-800/80" : "glass-premium-light border-zinc-200/60"
                } md:hidden`}>
                    <nav className="flex flex-col gap-2">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                                        isActive 
                                            ? isDark 
                                                ? 'bg-white text-zinc-950 shadow border border-zinc-100' 
                                                : 'bg-zinc-950 text-white shadow border border-zinc-950'
                                            : isDark
                                                ? 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                                                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/60'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                        
                        <div className={`h-[1px] my-1 ${isDark ? "bg-zinc-800/80" : "bg-zinc-200/80"}`} />
                        
                        {/* Profile & Logout inside mobile drawer */}
                        <div className="flex items-center justify-between px-2 pt-1">
                            <Link 
                                to="/profile" 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm">
                                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
                                    isDark ? "text-zinc-300" : "text-zinc-600"
                                }`}>
                                    Profile
                                </span>
                            </Link>
                            
                            <button 
                                onClick={() => { setIsOpen(false); logout(); }}
                                className={`px-4 py-2 rounded-xl text-[9px] font-extrabold uppercase tracking-widest border transition-colors cursor-pointer ${
                                    isDark ? "text-zinc-400 border-zinc-800 hover:text-red-400 hover:border-red-500/20" : "text-zinc-500 border-zinc-200 hover:text-red-500 hover:border-red-500/20"
                                }`}
                            >
                                Logout
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
