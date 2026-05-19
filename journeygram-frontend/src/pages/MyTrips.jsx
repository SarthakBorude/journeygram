import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";

const MyTrips = () => {
    const [canvases, setCanvases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const fetchCanvases = async () => {
        try {
            const res = await axiosInstance.get("/api/canvas/my");
            setCanvases(res.data);
        } catch (err) {
            console.error("Failed to fetch canvases", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCanvases();
    }, []);

    const handleToggleVisibility = async (canvasId) => {
        try {
            const res = await axiosInstance.patch(`/api/canvas/${canvasId}/visibility`);
            setCanvases(prev => prev.map(c => c.id === canvasId ? res.data : c));
        } catch (err) {
            console.error("Failed to toggle visibility", err);
        }
    };

    const handleDelete = async (canvasId) => {
        if (!window.confirm("Are you sure you want to archive and delete this travel canvas? All co-pilots will lose access.")) return;
        try {
            await axiosInstance.delete(`/api/canvas/${canvasId}`);
            setCanvases(prev => prev.filter(c => c.id !== canvasId));
        } catch (err) {
            console.error("Failed to delete canvas", err);
        }
    };

    const handleCopyShareLink = (canvasId, shareToken) => {
        const url = `${window.location.origin}/canvas/view/${shareToken}`;
        navigator.clipboard.writeText(url);
        setCopiedId(canvasId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getRandomTravelIcon = (index) => {
        const icons = ["🛫", "🧭", "🏔️", "☕", "📸", "🎒"];
        return icons[index % icons.length];
    };

    const getCardImage = (canvasId) => {
        const images = [
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800",
            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800",
            "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800"
        ];
        const idNum = Number(canvasId) || 0;
        return images[idNum % images.length];
    };

    return (
        <div className={`min-h-screen pt-28 md:pt-40 pb-16 md:pb-24 relative overflow-hidden transition-all duration-700 ${
            isDark 
                ? "bg-[#09090b]" 
                : "bg-[radial-gradient(circle_at_top,#faf8ff_0%,#f3eff9_45%,#ebe4f6_100%)]"
        }`}>
            {/* Ambient Lighting Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-400/10 dark:bg-violet-950/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-300/10 dark:bg-indigo-950/5 blur-[140px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-5 md:px-8 xl:px-12 relative z-10">
                
                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-10 mb-12 md:mb-20 border-b pb-8 md:pb-12 border-zinc-200/50 dark:border-zinc-800/40">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20">
                            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-indigo-600 dark:text-violet-300">
                                ✦ Active Passports
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-zinc-950 dark:text-white">
                            My Journeys
                        </h1>
                        <p className={`text-base font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            You have <span className="text-indigo-600 dark:text-violet-300 font-bold">{canvases.length} active</span> travel blueprint{canvases.length !== 1 ? 's' : ''} in your portfolio.
                        </p>
                    </div>
                    
                    <div>
                        <Link 
                            to="/canvas/new" 
                            className={`inline-flex items-center justify-center gap-3 px-7 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-98 select-none shadow-md ${
                                isDark 
                                    ? "bg-white text-zinc-950 hover:bg-zinc-200 hover:shadow-white/5" 
                                    : "bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-black/5"
                            }`}
                        >
                            <span>+ Start New Venture</span>
                            <span>🛫</span>
                        </Link>
                    </div>
                </div>

                {/* ── GRID OF JOURNEY CARDS ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-6">
                                <div className={`aspect-[4/3] rounded-3xl animate-pulse ${isDark ? "bg-zinc-900/60" : "bg-zinc-200/50"}`}></div>
                                <div className="space-y-3">
                                    <div className={`h-4 w-2/3 rounded-lg animate-pulse ${isDark ? "bg-zinc-900/60" : "bg-zinc-200/50"}`}></div>
                                    <div className={`h-3 w-1/2 rounded-lg animate-pulse ${isDark ? "bg-zinc-900/60" : "bg-zinc-200/50"}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : canvases.length === 0 ? (
                    <div className="text-center py-40 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-white/30 dark:bg-zinc-900/10 backdrop-blur-xl">
                        <span className="text-6xl block mb-6 select-none animate-bounce">🎒</span>
                        <p className={`text-xl font-extrabold mb-3 ${isDark ? "text-zinc-300" : "text-zinc-900"}`}>
                            Your Passport Cabinet is Empty
                        </p>
                        <p className={`text-sm mb-8 max-w-sm mx-auto ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            Craft a brand-new digital travel blueprint and invite friends to co-author.
                        </p>
                        <Link 
                            to="/canvas/new" 
                            className={`px-7 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest inline-flex items-center gap-3 transition-all ${
                                isDark ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-zinc-800"
                            }`}
                        >
                            <span>Create First Blueprint</span>
                            <span>✨</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-12">
                        {canvases.map((canvas, index) => (
                            <div 
                                key={canvas.id} 
                                className={`rounded-[2.5rem] p-6 luxury-card-hover ${
                                    isDark ? "glass-premium-dark" : "glass-premium-light"
                                } border transition-all duration-300 relative flex flex-col justify-between`}
                            >
                                <div>
                                    {/* Physical Leather Book Aesthetic Overlay */}
                                    <div 
                                        className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-zinc-900 p-6 flex flex-col justify-between text-white border border-white/5 shadow-md"
                                        style={{ 
                                            backgroundImage: `url(${canvas.coverImage || getCardImage(canvas.id)})`, 
                                            backgroundSize: 'cover', 
                                            backgroundPosition: 'center' 
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-black/35 z-0 pointer-events-none" />
                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="text-center">
                                                <span className="text-[7px] font-black tracking-[0.3em] uppercase block opacity-60">Passport</span>
                                                <span className="text-[6px] tracking-widest font-extrabold opacity-40">NO. {canvas.id}</span>
                                            </div>
                                            
                                            {/* Visibility Badging */}
                                            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider relative z-10 ${
                                                canvas.publicCanvas 
                                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                                                    : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"
                                            }`}>
                                                {canvas.publicCanvas ? "🌐 Public" : "🔒 Private"}
                                            </span>
                                        </div>
 
                                        {/* Big Travel Stamp Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-10 pointer-events-none select-none">
                                            {getRandomTravelIcon(index)}
                                        </div>

                                        <div className="space-y-1 relative z-10">
                                            <span className="text-[7.5px] font-black tracking-[0.25em] uppercase text-zinc-400 block">Active Destination</span>
                                            <h3 className="text-2xl font-black tracking-tight line-clamp-1">{canvas.name}</h3>
                                            <div className="flex gap-4 text-[8px] font-bold text-zinc-400 pt-1">
                                                {canvas.startingLocation && <span>FROM: {canvas.startingLocation.toUpperCase()}</span>}
                                                <span>• {canvas.members?.length || 1} CREW</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Metadata */}
                                    <div className="px-1 mb-6">
                                        <Link to={`/canvas/${canvas.id}`} className="hover:underline">
                                            <h4 className="font-extrabold text-xl tracking-tight text-zinc-950 dark:text-white line-clamp-1">
                                                {canvas.name}
                                            </h4>
                                        </Link>
                                        <p className={`text-xs font-semibold mt-1.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                            Start: {canvas.startDate ? new Date(canvas.startDate).toLocaleDateString() : 'Flexible'}
                                        </p>
                                    </div>
                                </div>

                                {/* Interactive Drawer Actions */}
                                <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40 flex items-center gap-3 justify-between flex-wrap md:flex-nowrap">
                                    <div className="flex items-center gap-3">
                                        {/* Visibility Toggle Button */}
                                        <button 
                                            onClick={() => handleToggleVisibility(canvas.id)} 
                                            className={`text-[9px] font-extrabold uppercase tracking-widest px-3.5 py-2 rounded-xl cursor-pointer transition-all border ${
                                                canvas.publicCanvas
                                                    ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800"
                                                    : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 border-indigo-500/20 dark:bg-violet-400/10 dark:hover:bg-violet-400/20 dark:text-violet-300 dark:border-violet-400/20"
                                            }`}
                                            title="Toggle Visibility"
                                        >
                                            {canvas.publicCanvas ? 'Go Private' : 'Go Public'}
                                        </button>
                                        
                                        {/* Share link button */}
                                        {canvas.publicCanvas && (
                                            <button 
                                                onClick={() => handleCopyShareLink(canvas.id, canvas.shareToken)} 
                                                className={`text-[9px] font-extrabold uppercase tracking-widest px-3.5 py-2 rounded-xl cursor-pointer transition-all border ${
                                                    copiedId === canvas.id
                                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20"
                                                        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border-zinc-200 dark:bg-zinc-800/40 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800"
                                                }`}
                                            >
                                                {copiedId === canvas.id ? 'Copied' : 'Share'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Delete Button */}
                                    <button 
                                        onClick={() => handleDelete(canvas.id)} 
                                        className={`text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer px-2 py-1 ${
                                            isDark ? "text-zinc-600 hover:text-red-400" : "text-zinc-400 hover:text-red-500"
                                        }`}
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
    );
};

export default MyTrips;
