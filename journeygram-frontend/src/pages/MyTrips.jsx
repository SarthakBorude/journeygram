import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useTheme } from "../context/ThemeContext";

const MyTrips = () => {
    const [canvases, setCanvases] = useState([]);
    const [loading, setLoading] = useState(true);
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
        if (!window.confirm("Delete this canvas? This will remove all items and access for all members.")) return;
        try {
            await axiosInstance.delete(`/api/canvas/${canvasId}`);
            setCanvases(prev => prev.filter(c => c.id !== canvasId));
        } catch (err) {
            console.error("Failed to delete canvas", err);
        }
    };

    const handleCopyShareLink = (shareToken) => {
        const url = `${window.location.origin}/canvas/view/${shareToken}`;
        navigator.clipboard.writeText(url);
        alert("Share link copied!");
    };

    return (
        <div className={`min-h-screen transition-all duration-700 font-['Outfit'] pt-32 pb-20 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fafafa] text-zinc-900'}`}>
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.15] bg-map-grid"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-32 space-y-12">
                            <div className="space-y-4">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md ${isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-900/5 border-zinc-200'}`}>
                                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-violet-400' : 'text-zinc-600'}`}>Personal Archive</span>
                                </div>
                                <h1 className="text-6xl md:text-[6rem] font-black tracking-tighter leading-[0.85]">
                                    My <br />
                                    <span className={`italic font-light script-font ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>Journeys.</span>
                                </h1>
                            </div>

                            <div className="space-y-6">
                                <Link to="/canvas/new" className={`group relative flex items-center justify-center gap-3 px-10 py-5 rounded-[2rem] font-bold text-sm tracking-widest overflow-hidden shadow-xl transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white text-black' : 'bg-zinc-900 text-white'}`}>
                                    <div className="absolute inset-0 bg-violet-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative z-10 group-hover:text-white transition-colors">✨ NEW CANVAS</span>
                                </Link>

                                <div className={`p-8 rounded-[2rem] border border-dashed ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/50 border-zinc-200'}`}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Archive Stats</p>
                                    <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-zinc-800'}`}>{canvases.length}</p>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Active Canvases</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[1, 2, 3, 4].map(i => <div key={i} className={`h-64 rounded-[2.5rem] animate-pulse ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}></div>)}
                            </div>
                        ) : canvases.length === 0 ? (
                            <div className={`p-20 text-center rounded-[3rem] border-2 border-dashed ${isDark ? 'border-white/10' : 'border-zinc-100'}`}>
                                <div className="text-6xl mb-8 opacity-20">🎨</div>
                                <h2 className="text-3xl font-bold tracking-tight mb-4">No canvases yet</h2>
                                <Link to="/canvas/new" className={`px-10 py-4 rounded-full font-bold text-sm tracking-widest transition-all ${isDark ? 'bg-white text-black' : 'bg-zinc-900 text-white'}`}>Create Canvas →</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {canvases.map(canvas => (
                                    <div key={canvas.id} className={`group relative rounded-[2.5rem] p-8 border transition-all duration-500 hover:scale-[1.02] ${isDark ? 'bg-white/5 border-white/10 shadow-2xl hover:bg-white/[0.08]' : 'bg-white border-zinc-100 shadow-xl hover:shadow-2xl'}`}>
                                        <div className="absolute top-8 right-8">
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${canvas.publicCanvas ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500'}`}>
                                                {canvas.publicCanvas ? 'Public' : 'Private'}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Trip Canvas</p>
                                                <h3 className="text-3xl font-bold tracking-tight line-clamp-1">{canvas.name}</h3>
                                            </div>

                                            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-60">
                                                <span>📍 {canvas.startingLocation || 'Anywhere'}</span>
                                                <span>👥 {canvas.members?.length || 1} Members</span>
                                            </div>

                                            <div className="pt-8 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                                                <Link to={`/canvas/${canvas.id}`} className={`px-8 py-3.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${isDark ? 'bg-white text-black hover:bg-indigo-400 hover:text-white' : 'bg-zinc-900 text-white hover:bg-indigo-600'}`}>
                                                    Open Canvas
                                                </Link>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleToggleVisibility(canvas.id)} className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:border-white' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-900'}`}>
                                                        {canvas.publicCanvas ? '🔒' : '🌍'}
                                                    </button>
                                                    {canvas.publicCanvas && (
                                                        <button onClick={() => handleCopyShareLink(canvas.shareToken)} className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:border-white' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-900'}`}>
                                                            🔗
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(canvas.id)} className={`p-3 rounded-xl border transition-all ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-600 hover:text-white'}`}>
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyTrips;
