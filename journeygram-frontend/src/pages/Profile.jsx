import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
    const { logout } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [profile, setProfile] = useState(null);
    const [canvases, setCanvases] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [profileRes, canvasRes] = await Promise.all([
                axiosInstance.get("/api/auth/me"),
                axiosInstance.get("/api/canvas/my")
            ]);
            setProfile(profileRes.data);
            setCanvases(canvasRes.data);
        } catch (err) {
            console.error("Failed to fetch profile ledger", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleVisibility = async (canvasId) => {
        try {
            const response = await axiosInstance.patch(`/api/canvas/${canvasId}/visibility`);
            setCanvases((prev) =>
                prev.map((c) => (c.id === canvasId ? response.data : c))
            );
        } catch (err) {
            console.error("Failed to toggle visibility", err);
        }
    };

    const handleDelete = async (canvasId) => {
        if (!window.confirm("Archive and delete this travel blueprint permanently? All co-pilots will lose access.")) return;
        try {
            await axiosInstance.delete(`/api/canvas/${canvasId}`);
            setCanvases((prev) => prev.filter((c) => c.id !== canvasId));
        } catch (err) {
            console.error("Failed to delete canvas", err);
        }
    };

    const getDurationDays = (start, end) => {
        if (!start || !end) return "Flexible Duration";
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
        return diff > 0 ? `${diff} Days` : "1 Day";
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex justify-center items-center font-sans ${isDark ? 'bg-[#09090b]' : 'bg-[#fbfbf9]'}`}>
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 dark:border-zinc-700 dark:border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    const userInitial = profile?.name 
        ? profile.name.charAt(0).toUpperCase() 
        : (profile?.email ? profile.email.charAt(0).toUpperCase() : "🛫");

    return (
        <div className={`min-h-screen pt-28 md:pt-40 pb-16 md:pb-24 relative overflow-hidden transition-all duration-700 ${
            isDark 
                ? "bg-[#09090b]" 
                : "bg-[radial-gradient(circle_at_top,#faf8ff_0%,#f3eff9_45%,#ebe4f6_100%)]"
        }`}>
            {/* Ambient Lighting Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-400/10 dark:bg-violet-950/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-300/10 dark:bg-indigo-950/5 blur-[140px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                
                {/* ── PROFILE HEADER ── */}
                <div className={`p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] mb-12 ${
                    isDark ? "glass-premium-dark" : "glass-premium-light"
                } border flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm`}>
                    
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-inner select-none ${
                            isDark 
                                ? "bg-zinc-850 text-white border border-zinc-800" 
                                : "bg-white text-zinc-950 border border-zinc-200/60"
                        }`}>
                            {userInitial}
                        </div>
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20">
                                <span className="text-[8px] tracking-wider uppercase font-black text-indigo-600 dark:text-violet-300">
                                    ✦ Authenticated Operator
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-950 dark:text-white leading-none">
                                {profile?.name || "Explorer Agent"}
                            </h1>
                            <p className={`text-xs font-semibold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                {profile?.email}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={logout} 
                        className={`px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all hover:scale-105 active:scale-98 shadow-sm select-none ${
                            isDark 
                                ? "bg-white text-zinc-950 hover:bg-zinc-200" 
                                : "bg-zinc-950 text-white hover:bg-zinc-800"
                        }`}
                    >
                        Sign Out
                    </button>
                </div>

                {/* ── METRIC PORTFOLIO STATS ── */}
                <div className="grid grid-cols-2 gap-8 mb-16">
                    <div className={`p-6 rounded-3xl border ${
                        isDark ? "bg-zinc-900/15 border-zinc-800" : "bg-white/40 border-zinc-200"
                    } backdrop-blur`}>
                        <p className={`text-[9px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            Total Blueprints
                        </p>
                        <p className="text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
                            {canvases.length}
                        </p>
                    </div>
                    <div className={`p-6 rounded-3xl border ${
                        isDark ? "bg-zinc-900/15 border-zinc-800" : "bg-white/40 border-zinc-200"
                    } backdrop-blur`}>
                        <p className={`text-[9px] font-black uppercase tracking-wider mb-2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            Public Blueprints
                        </p>
                        <p className="text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
                            {canvases.filter(c => c.publicCanvas).length}
                        </p>
                    </div>
                </div>

                {/* ── CABINET TIMELINE LISTING ── */}
                <div className={`p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] ${
                    isDark ? "glass-premium-dark" : "glass-premium-light"
                } border shadow-sm`}>
                    <h2 className="text-2xl font-black tracking-tight mb-8 text-zinc-950 dark:text-white">
                        Personal Blueprint Ledger
                    </h2>
                    
                    {canvases.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="text-4xl block mb-4 select-none">🗺️</span>
                            <p className={`text-xs font-bold mb-6 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                No travel blueprints registered under this credentials set.
                            </p>
                            <Link 
                                to="/canvas/new" 
                                className={`px-6 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest inline-block transition-all ${
                                    isDark ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-zinc-800"
                                }`}
                            >
                                Create First Blueprint
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {canvases.map((canvas) => (
                                <div key={canvas.id} className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-5 border-b last:border-0 ${
                                    isDark ? "border-zinc-800/60" : "border-zinc-200/50"
                                }`}>
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-200/20 bg-zinc-100 dark:bg-zinc-800 shadow-sm">
                                            <img 
                                                src={canvas.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=200"} 
                                                alt={canvas.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <Link to={`/canvas/${canvas.id}`} className="hover:underline">
                                                    <h3 className="font-extrabold text-lg tracking-tight text-zinc-950 dark:text-white">
                                                        {canvas.name}
                                                    </h3>
                                                </Link>
                                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                canvas.publicCanvas 
                                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                                    : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 dark:text-zinc-400"
                                            }`}>
                                                {canvas.publicCanvas ? '🌐 Public' : '🔒 Private'}
                                            </span>
                                        </div>
                                        <p className={`text-xs font-semibold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                            {getDurationDays(canvas.startDate, canvas.endDate)} • From {canvas.startingLocation || 'Anywhere'}
                                        </p>
                                    </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest">
                                        <button 
                                            onClick={() => handleToggleVisibility(canvas.id)}
                                            className={`transition-colors cursor-pointer ${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-950"}`}
                                        >
                                            {canvas.publicCanvas ? 'Make Private' : 'Make Public'}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(canvas.id)}
                                            className={`transition-colors cursor-pointer ${isDark ? "text-zinc-650 hover:text-red-400" : "text-zinc-400 hover:text-red-500"}`}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
