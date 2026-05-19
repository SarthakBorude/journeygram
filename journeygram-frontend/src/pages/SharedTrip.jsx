import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ITEM_TYPES = [
    { value: 'PLACE', label: 'Location', icon: '📍' },
    { value: 'FOOD', label: 'Dining', icon: '🍽️' },
    { value: 'HOTEL', label: 'Lodging', icon: '🏨' },
    { value: 'TRANSPORT', label: 'Transit', icon: '✈️' },
    { value: 'NOTE', label: 'Note', icon: '📝' },
    { value: 'BOOKING', label: 'Link', icon: '🔗' },
];

const typeConfig = (type) => ITEM_TYPES.find(t => t.value === type) || ITEM_TYPES[4];

const SharedTrip = () => {
    const { token: shareToken } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [canvas, setCanvas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        const fetchCanvas = async () => {
            try {
                const response = await axiosInstance.get(`/api/canvas/share/${shareToken}`);
                setCanvas(response.data);
                fetchComments(response.data.id);
            } catch (err) {
                setError("Blueprint unavailable.");
            } finally {
                setLoading(false);
            }
        };
        fetchCanvas();
    }, [shareToken]);

    const fetchComments = async (canvasId) => {
        try {
            const response = await axiosInstance.get(`/api/canvas/${canvasId}/comments`);
            setComments(response.data);
        } catch (err) {
            console.error("Failed to fetch comments.");
        }
    };

    const handleLike = async () => {
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const response = await axiosInstance.post(`/api/canvas/${canvas.id}/like`);
            setCanvas(prev => ({
                ...prev,
                likedByMe: response.data.likedByMe,
                likesCount: response.data.likesCount
            }));
        } catch (err) {
            console.error("Failed to like.");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmittingComment(true);
        try {
            await axiosInstance.post(`/api/canvas/${canvas.id}/comments`, { content: commentText });
            setCommentText("");
            fetchComments(canvas.id);
        } catch (err) {
            console.error("Failed to add comment.");
        } finally {
            setSubmittingComment(false);
        }
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

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center font-sans ${isDark ? 'bg-[#09090b]' : 'bg-[#fbfbf9]'}`}>
            <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 dark:border-zinc-700 dark:border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className={`min-h-screen flex items-center justify-center p-6 font-sans ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fbfbf9] text-zinc-900'}`}>
            <div className="text-center max-w-md">
                <span className="text-5xl block mb-6">🔒</span>
                <p className="text-red-500 font-bold mb-6">{error}</p>
                <Link to="/" className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-950 text-white hover:bg-zinc-800'}`}>
                    Return Home
                </Link>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen pt-28 md:pt-40 pb-16 md:pb-24 relative transition-all duration-700 ${
            isDark 
                ? "bg-[#09090b]" 
                : "bg-[radial-gradient(circle_at_top,#faf8ff_0%,#f3eff9_45%,#ebe4f6_100%)]"
        }`}>
            {/* Ambient Lighting Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-400/10 dark:bg-violet-950/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-300/10 dark:bg-indigo-950/5 blur-[140px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-5 md:px-8 xl:px-12 relative z-10">
                
                {/* ── TWO COLUMN DESKTOP GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* ──── LEFT PANEL (STICKY SUMMARY) ──── */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
                        
                        {/* Summary Pass */}
                        {/* Summary Pass */}
                        <div 
                            className={`p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] ${
                                isDark ? "glass-premium-dark" : "glass-premium-light"
                            } border shadow-lg relative overflow-hidden`}
                            style={{
                                backgroundImage: `url(${canvas.coverImage || getCardImage(canvas.id)})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="absolute inset-0 bg-black/45 z-0 pointer-events-none" />
                            
                            <div className="absolute top-0 right-0 w-24 h-24 opacity-10 select-none pointer-events-none z-10">
                                <span className="text-8xl">🛫</span>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                                    canvas.coverImage 
                                        ? "bg-white/10 border-white/20 text-white" 
                                        : "bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20 text-indigo-600 dark:text-violet-300"
                                } border`}>
                                    <span className="text-[9px] tracking-wider uppercase font-bold">
                                        ✦ Shared Blueprint
                                    </span>
                                </div>

                                <div>
                                    <h1 className={`text-3xl font-black tracking-tight leading-tight ${
                                        canvas.coverImage ? "text-white" : "text-zinc-950 dark:text-white"
                                    }`}>
                                        {canvas.name}
                                    </h1>
                                    <p className={`text-xs font-semibold mt-2 flex items-center gap-1.5 ${
                                        canvas.coverImage ? "text-zinc-300" : isDark ? "text-zinc-500" : "text-zinc-400"
                                    }`}>
                                        <span>🌍</span>
                                        <span>Shared by {canvas.owner?.name?.split(' ')[0] || canvas.owner?.email.split('@')[0]}</span>
                                    </p>
                                </div>

                                <div className={`pt-4 border-t ${
                                    canvas.coverImage ? "border-white/10" : "border-zinc-200/50 dark:border-zinc-800/40"
                                } grid grid-cols-2 gap-4`}>
                                    <div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                            canvas.coverImage ? "text-zinc-400" : "text-zinc-400"
                                        }`}>Stops</span>
                                        <span className={`text-lg font-black ${
                                            canvas.coverImage ? "text-white" : "text-zinc-900 dark:text-white"
                                        }`}>
                                            {canvas.destinations?.length || 0} stops
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                            canvas.coverImage ? "text-zinc-400" : "text-zinc-400"
                                        }`}>Crew Size</span>
                                        <span className={`text-lg font-black ${
                                            canvas.coverImage ? "text-white" : "text-zinc-900 dark:text-white"
                                        }`}>
                                            {canvas.members?.length || 1} ops
                                        </span>
                                    </div>
                                </div>

                                {/* Upvote Counter */}
                                <div className={`pt-6 border-t ${
                                    canvas.coverImage ? "border-white/10" : "border-zinc-200/50 dark:border-zinc-800/40"
                                } flex items-center gap-3`}>
                                    <button 
                                        onClick={handleLike} 
                                        className={`flex-1 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 select-none ${
                                            canvas.likedByMe 
                                                ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                                                : canvas.coverImage 
                                                    ? "bg-white text-zinc-950 hover:bg-zinc-200"
                                                    : isDark ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-zinc-800"
                                        }`}
                                    >
                                        <span>❤️</span>
                                        <span>{canvas.likesCount || 0} Upvote{canvas.likesCount !== 1 ? 's' : ''}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stop Timeline */}
                        {canvas.destinations?.length > 0 && (
                            <div className={`p-6 rounded-3xl ${
                                isDark ? "bg-zinc-950/40 border border-zinc-800/80" : "bg-white/40 border border-zinc-200/60"
                            } backdrop-blur-xl hidden lg:block`}>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-4">Route Stop List</span>
                                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
                                    {canvas.destinations.map((dest, dIdx) => (
                                        <div key={dest.id} className="relative flex items-center justify-between gap-4">
                                            <div className="absolute left-[-21px] w-3 h-3 rounded-full border-2 bg-indigo-500 border-white dark:border-zinc-950 shadow-sm" />
                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{dest.name}</span>
                                            <span className="text-[10px] font-black text-zinc-400 shrink-0">STOP {dIdx + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ──── RIGHT PANEL (ACTIVE TIMELINE & COMMENTS) ──── */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        <div className="space-y-12">
                            {canvas.destinations?.map((dest, dIdx) => (
                                <div 
                                    key={dest.id} 
                                    className={`p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] ${
                                        isDark ? "glass-premium-dark" : "glass-premium-light"
                                    } border transition-all duration-300 relative`}
                                >
                                    {/* Stop Title */}
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/40">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-black tracking-widest uppercase text-indigo-600 dark:text-violet-400">Stop {dIdx + 1}</span>
                                            <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                                                {dest.name}
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    {dest.items?.length > 0 ? (
                                        <div className="space-y-5">
                                            {dest.items.map((item) => {
                                                const tc = typeConfig(item.type);
                                                return (
                                                    <div 
                                                        key={item.id} 
                                                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                                                            isDark 
                                                                ? "bg-zinc-900/30 border-zinc-800/60" 
                                                                : "bg-zinc-50/60 border-zinc-100"
                                                        }`}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                                <span className="text-lg select-none">{tc.icon}</span>
                                                                <span className="font-extrabold text-base text-zinc-950 dark:text-white">{item.title}</span>
                                                                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                                    isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200/50 text-zinc-500"
                                                                }`}>
                                                                    {tc.label}
                                                                </span>
                                                            </div>
                                                            
                                                            {item.description && (
                                                                <p className={`text-sm leading-relaxed mb-3 pl-8 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                            
                                                            {item.url && (
                                                                <div className="pl-8">
                                                                    <a href={item.url} target="_blank" rel="noreferrer" className={`text-xs font-bold hover:underline ${
                                                                        isDark ? "text-violet-300" : "text-indigo-600"
                                                                    }`}>
                                                                        Details Link ↗
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className={`text-xs font-semibold italic ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                                            No spots added to this stop.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ── COMMENTS BOARD ── */}
                        <div className={`p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] ${
                            isDark ? "glass-premium-dark" : "glass-premium-light"
                        } border shadow-sm`}>
                            <h2 className="text-2xl font-black tracking-tight mb-8 text-zinc-950 dark:text-white">
                                Crew Dispatch & Comments
                            </h2>

                            {token ? (
                                <form onSubmit={handleCommentSubmit} className="mb-10">
                                    <textarea 
                                        value={commentText} 
                                        onChange={(e) => setCommentText(e.target.value)} 
                                        placeholder="Add to the scroll..." 
                                        rows={2} 
                                        className="w-full px-5 py-4 rounded-2xl text-xs outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white resize-none premium-input"
                                    />
                                    <div className="flex justify-end mt-3">
                                        <button 
                                            type="submit" 
                                            disabled={submittingComment || !commentText.trim()} 
                                            className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all disabled:opacity-50 ${
                                                isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                                            }`}
                                        >
                                            {submittingComment ? "Sending..." : "Dispatch"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className={`p-6 rounded-2xl mb-10 text-center border ${
                                    isDark ? 'bg-zinc-900/10 border-zinc-800' : 'bg-zinc-50/50 border-zinc-200'
                                }`}>
                                    <p className={`text-xs font-bold mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Sign in to dispatch co-author comments.</p>
                                    <Link to="/login" className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all inline-block ${isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'}`}>
                                        Access Passport
                                    </Link>
                                </div>
                            )}

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                                {comments.length === 0 ? (
                                    <p className={`text-xs italic ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>No comments recorded in this ledger.</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 p-4 rounded-2xl border border-zinc-200/10 dark:border-zinc-800/10 bg-white/20 dark:bg-zinc-900/10">
                                            <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                                isDark ? 'bg-zinc-900 border-zinc-850 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                                            }`}>
                                                {comment.user?.name?.[0]?.toUpperCase() || comment.user?.email?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <p className="font-extrabold text-xs text-zinc-950 dark:text-white">
                                                        {comment.user?.name || comment.user?.email.split('@')[0]}
                                                    </p>
                                                    <span className={`text-[9px] font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedTrip;
