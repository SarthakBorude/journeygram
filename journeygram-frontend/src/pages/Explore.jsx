import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";

const Explore = () => {
    const [canvases, setCanvases] = useState([]);
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
            setCanvases(prev => prev.map(c => c.id === canvasId ? { ...c, likesCount: res.data.likesCount, likedByMe: res.data.likedByMe } : c));
        } catch (err) {
            console.error("Failed to like canvas", err);
        }
    };

    const handleClone = async (e, canvasId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Clone this canvas to your journeys?")) return;
        try {
            const res = await axiosInstance.post(`/api/canvas/${canvasId}/clone`);
            navigate(`/canvas/${res.data.id}`);
        } catch (err) {
            console.error("Failed to clone canvas", err);
        }
    };

    return (
        <div className={`min-h-screen transition-all duration-700 font-['Outfit'] overflow-x-hidden pt-32 pb-20 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fafafa] text-zinc-900'}`}>
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.15] bg-map-grid"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-32 space-y-8">
                            <div className="space-y-4">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-900/5 border-zinc-200'}`}>
                                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-violet-400' : 'text-zinc-600'}`}>Community Stories</span>
                                </div>
                                <h1 className="text-6xl md:text-[6rem] font-black tracking-tighter leading-[0.85] mb-6">
                                    Explore the <br />
                                    <span className={`italic font-light script-font ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>Globe.</span>
                                </h1>
                                <p className={`text-lg md:text-xl font-light opacity-60 leading-relaxed`}>
                                    Discover collaborative trip canvases architected by the community. Clone them to start your own adventure.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3, 4].map(i => <div key={i} className={`h-[450px] rounded-[3rem] animate-pulse ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}></div>)}
                            </div>
                        ) : canvases.length === 0 ? (
                            <div className={`p-20 text-center rounded-[3rem] border-2 border-dashed ${isDark ? 'border-white/10' : 'border-zinc-100'}`}>
                                <h2 className="text-3xl font-bold tracking-tight mb-4">The world is waiting</h2>
                                <p className="opacity-50 mb-10">Be the first to make your trip canvas public!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {canvases.map(canvas => (
                                    <Link key={canvas.id} to={`/canvas/view/${canvas.shareToken}`} className="group relative h-[450px] rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 hover:scale-[0.98]">
                                        <div className="absolute inset-0 z-0 bg-zinc-900">
                                            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800" alt="" className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                                        </div>

                                        <div className="absolute inset-0 z-10 p-10 flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white border border-white/20 uppercase tracking-widest">
                                                    {canvas.members?.length || 1} Members
                                                </div>
                                                <button onClick={(e) => handleLike(e, canvas.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 backdrop-blur-md border ${canvas.likedByMe ? 'bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
                                                    <svg className={`w-5 h-5 ${canvas.likedByMe ? 'fill-current' : 'fill-none'}`} stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.364-1.364a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-4xl font-bold text-white tracking-tight leading-tight group-hover:text-indigo-300 transition-colors">{canvas.name}</h3>
                                                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1">Starting from {canvas.startingLocation || 'Earth'}</p>
                                                </div>

                                                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white font-black text-sm">
                                                            {canvas.owner?.name?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Owner</p>
                                                            <p className="text-xs font-bold text-white">{canvas.owner?.name || canvas.owner?.email}</p>
                                                        </div>
                                                    </div>
                                                    <button onClick={(e) => handleClone(e, canvas.id)} className="px-5 py-2.5 bg-white text-black text-[9px] font-black rounded-xl hover:bg-indigo-400 hover:text-white transition-all uppercase tracking-widest">
                                                        Clone Canvas
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
            </div>
        </div>
    );
};

export default Explore;