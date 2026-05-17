import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

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
                setError("This canvas could not be found. It might be private or deleted.");
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
            console.error("Failed to fetch traveler thoughts.");
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
            console.error("Failed to like the journey.");
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
            console.error("Failed to add your note.");
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center p-8 text-center"><div className="max-w-md space-y-6"><h1 className="text-4xl font-black text-red-500">Oops!</h1><p className="text-zinc-500">{error}</p><Link to="/" className="inline-block px-10 py-4 bg-zinc-900 text-white rounded-full font-bold">Return Home</Link></div></div>;

    return (
        <div className={`min-h-screen transition-all duration-700 font-['Outfit'] pt-32 pb-20 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fafafa] text-zinc-900'}`}>
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.1] bg-map-grid"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-6">
                {/* Header Card */}
                <div className={`p-12 md:p-20 rounded-[3rem] border mb-16 relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-100 shadow-2xl'}`}>
                    <div className="absolute top-12 right-12">
                        <button onClick={handleLike} className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black uppercase tracking-widest ${canvas.likedByMe ? 'bg-red-500 text-white shadow-lg shadow-red-500/40' : 'bg-white/10 backdrop-blur-md border border-white/20 text-indigo-600 hover:bg-white/20'}`}>
                            ❤️ {canvas.likesCount || 0}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Shared Journey</p>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">{canvas.name}</h1>
                        <div className="flex flex-wrap items-center gap-6 text-sm font-bold opacity-60">
                            <span>📍 {canvas.startingLocation || 'Earth'}</span>
                            <span>👥 {canvas.members?.length || 1} Explorers</span>
                            {canvas.startDate && <span>🗓️ {new Date(canvas.startDate).toLocaleDateString()} - {new Date(canvas.endDate).toLocaleDateString()}</span>}
                        </div>
                    </div>
                </div>

                {/* Destinations Section */}
                <div className="space-y-24">
                    {canvas.destinations?.map((dest, idx) => (
                        <div key={dest.id} className="relative group">
                            <div className="flex items-center gap-8 mb-12">
                                <div className="text-7xl font-black opacity-10 tracking-tighter leading-none">{idx + 1}</div>
                                <h2 className="text-4xl font-black tracking-tight">{dest.name}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-8 md:pl-20 border-l-4 border-indigo-600/10">
                                {dest.items?.map(item => (
                                    <div key={item.id} className={`p-8 rounded-[2rem] border transition-all ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.08]' : 'bg-white border-zinc-100 shadow-xl'}`}>
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{item.type === 'FLIGHT' ? '✈️' : item.type === 'HOTEL' ? '🏨' : item.type === 'ACTIVITY' ? '🎡' : '📌'}</span>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.type}</p>
                                            </div>
                                            {item.costEstimate > 0 && <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-600 px-3 py-1 rounded-full">₹{item.costEstimate.toLocaleString('en-IN')}</span>}
                                        </div>
                                        <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                                        <p className="text-sm opacity-60 leading-relaxed line-clamp-3">{item.description}</p>
                                        {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:gap-3 transition-all">Visit Link →</a>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Traveler Thoughts (Comments) */}
                <div className="mt-40 pt-20 border-t border-zinc-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-16">
                        <h2 className="text-4xl font-black tracking-tighter">Traveler Thoughts</h2>
                        <span className="px-6 py-2 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">{comments.length} Entries</span>
                    </div>

                    {token ? (
                        <form onSubmit={handleCommentSubmit} className={`p-10 rounded-[2.5rem] border mb-24 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-100 shadow-xl'}`}>
                            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Leave a note in this journal..." rows={4} className="w-full bg-transparent p-6 rounded-2xl border-2 border-zinc-100 dark:border-white/5 text-lg font-medium focus:outline-none focus:border-indigo-500 resize-none transition-all" />
                            <div className="flex justify-end mt-6">
                                <button type="submit" disabled={submittingComment || !commentText.trim()} className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all">
                                    {submittingComment ? "Writing..." : "Add Entry"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={`p-16 rounded-[2.5rem] border mb-24 text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-100 border-dashed'}`}>
                            <p className="text-xl font-bold mb-8">Join JourneyGram to leave your mark</p>
                            <Link to="/register" className="inline-block px-10 py-4 bg-zinc-900 text-white rounded-full font-bold">Sign the Register</Link>
                        </div>
                    )}

                    <div className="space-y-8">
                        {comments.map(comment => (
                            <div key={comment.id} className={`p-10 rounded-[2.5rem] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-100 shadow-lg'}`}>
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xl">{comment.user.name?.[0] || 'U'}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="font-black tracking-tight">{comment.user.name || comment.user.email}</p>
                                            <span className="text-[10px] font-bold opacity-40">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-lg font-medium opacity-70 italic leading-relaxed">"{comment.content}"</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedTrip;
