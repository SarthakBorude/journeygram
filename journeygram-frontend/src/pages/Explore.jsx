import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";

const Explore = () => {
    const [canvases, setCanvases] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const fetchPublicCanvases = async () => {
        try {
            const response = await axiosInstance.get("/api/canvas/explore");
            setCanvases(response.data);
        } catch (err) {
            console.error("Failed to fetch public canvases", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicCanvases();
    }, []);

    const handleLike = async (e, canvasId) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const res = await axiosInstance.post(`/api/canvas/${canvasId}/like`);
            setCanvases(prev => prev.map(c => c.id === canvasId ? { 
                ...c, 
                likesCount: res.data.likesCount, 
                likedByMe: res.data.likedByMe 
            } : c));
        } catch (err) {
            console.error("Failed to like canvas", err);
        }
    };

    const handleClone = async (e, canvasId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Clone this travel blueprint to your personal dashboard?")) return;
        try {
            const res = await axiosInstance.post(`/api/canvas/${canvasId}/clone`);
            navigate(`/canvas/${res.data.id}`);
        } catch (err) {
            console.error("Failed to clone canvas", err);
        }
    };

    const filteredCanvases = canvases.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.startingLocation && c.startingLocation.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Dynamic deterministic placeholder images based on trip ID
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
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-400/10 dark:bg-violet-950/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-300/10 dark:bg-indigo-950/5 blur-[140px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-5 md:px-8 xl:px-12 relative z-10">
                
                {/* ── HEADER ── */}
                <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-10 border-b pb-8 md:pb-12 border-zinc-200/50 dark:border-zinc-800/40">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20">
                            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-indigo-600 dark:text-violet-300">
                                ✦ Blueprint Cabinet
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-zinc-950 dark:text-white">
                            Discover Blueprints
                        </h1>
                        <p className={`text-base font-medium max-w-lg ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            Explore and clone beautifully structured, community-crafted itineraries to kickstart your next co-piloted venture.
                        </p>
                    </div>

                    {/* Premium Search Filter */}
                    <div className="w-full md:w-80">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or destination..."
                                className={`w-full pl-12 pr-5 py-4 rounded-2xl text-xs font-semibold outline-none bg-white/70 dark:bg-zinc-900/40 text-zinc-900 dark:text-white border ${
                                    isDark ? "border-zinc-800 focus:border-violet-500" : "border-zinc-200 focus:border-indigo-500"
                                } shadow-sm transition-all placeholder:text-zinc-400`}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-zinc-400 pointer-events-none">🔍</span>
                        </div>
                    </div>
                </div>

                {/* ── GRID CONTENT ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="space-y-6">
                                <div className={`aspect-[4/3] rounded-3xl animate-pulse ${isDark ? "bg-zinc-900/60" : "bg-zinc-200/50"}`}></div>
                                <div className="space-y-3">
                                    <div className={`h-4 w-2/3 rounded-lg animate-pulse ${isDark ? "bg-zinc-900/60" : "bg-zinc-200/50"}`}></div>
                                    <div className={`h-3 w-1/2 rounded-lg animate-pulse ${isDark ? "bg-zinc-900/60" : "bg-zinc-200/50"}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCanvases.length === 0 ? (
                    <div className="text-center py-36">
                        <span className="text-5xl block mb-6 select-none">🗺️</span>
                        <p className={`text-base font-bold mb-3 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                            No travel blueprints found.
                        </p>
                        <p className={`text-xs ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                            Try searching for something else or register a private canvas.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 xl:gap-12">
                        {filteredCanvases.map((canvas, idx) => (
                            <Link 
                                key={canvas.id} 
                                to={`/canvas/view/${canvas.shareToken}`} 
                                className="group block"
                            >
                                <div className={`rounded-[2rem] p-5 luxury-card-hover ${
                                    isDark ? "glass-premium-dark" : "glass-premium-light"
                                } relative border transition-all duration-300`}>
                                    
                                    {/* Image Frame */}
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/20 shadow-sm">
                                        <img 
                                            src={canvas.coverImage || getCardImage(canvas.id)} 
                                            alt={canvas.name} 
                                            className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-700" 
                                        />
                                        
                                        {/* Floating Badge */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <div className="px-3 py-1.5 bg-black/60 backdrop-blur rounded-xl text-[9px] font-black uppercase tracking-wider text-white">
                                                👥 {canvas.members?.length || 1} Member{canvas.members?.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="px-1 pb-2">
                                        {canvas.startingLocation && (
                                            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-violet-400 mb-2">
                                                <span>✈</span>
                                                <span>{canvas.startingLocation}</span>
                                            </div>
                                        )}
                                        
                                        <h3 className="text-xl font-extrabold tracking-tight mb-2 text-zinc-950 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-violet-300 transition-colors">
                                            {canvas.name}
                                        </h3>
                                        
                                        <p className={`text-xs font-semibold mb-6 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                            Crafted by <span className="text-zinc-800 dark:text-zinc-300 font-bold">{canvas.owner?.name?.split(' ')[0] || canvas.owner?.email.split('@')[0]}</span>
                                        </p>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-200/50 dark:border-zinc-800/40">
                                            {/* Likes Upvote Button */}
                                            <button 
                                                onClick={(e) => handleLike(e, canvas.id)} 
                                                className={`flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-full cursor-pointer hover:scale-105 active:scale-95 ${
                                                    canvas.likedByMe 
                                                        ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                                        : isDark 
                                                            ? "bg-zinc-800/50 text-zinc-400 hover:text-white border border-zinc-800" 
                                                            : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200"
                                                }`}
                                            >
                                                <span>❤️</span>
                                                <span>{canvas.likesCount || 0}</span>
                                            </button>
                                            
                                            {/* Clone Button */}
                                            <button 
                                                onClick={(e) => handleClone(e, canvas.id)} 
                                                className={`text-[10px] font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                                                    isDark 
                                                        ? "bg-white text-zinc-950 hover:bg-zinc-200 hover:shadow-lg hover:shadow-white/5" 
                                                        : "bg-zinc-950 text-white hover:bg-zinc-800 hover:shadow-lg hover:shadow-black/5"
                                                }`}
                                            >
                                                Clone Blueprint
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;