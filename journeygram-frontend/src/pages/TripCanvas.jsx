import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ITEM_TYPES = [
    { value: 'PLACE', label: 'Location', icon: '📍' },
    { value: 'FOOD', label: 'Dining', icon: '🍽️' },
    { value: 'HOTEL', label: 'Lodging', icon: '🏨' },
    { value: 'TRANSPORT', label: 'Transit', icon: '✈️' },
    { value: 'NOTE', label: 'Note', icon: '📝' },
    { value: 'BOOKING', label: 'Link', icon: '🔗' },
];

const typeConfig = (type) => ITEM_TYPES.find(t => t.value === type) || ITEM_TYPES[4];

const TripCanvas = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [canvas, setCanvas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingDest, setAddingDest] = useState(false);
    const [newDestName, setNewDestName] = useState('');
    const [destSuggestions, setDestSuggestions] = useState([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [addingItemTo, setAddingItemTo] = useState(null);
    const [newItem, setNewItem] = useState({ title: '', type: 'PLACE', description: '', url: '', costEstimate: '' });
    const [aiLoading, setAiLoading] = useState({});
    const [aiSuggestions, setAiSuggestions] = useState({});
    const [copied, setCopied] = useState(false);

    const fetchCanvas = useCallback(async () => {
        try {
            const res = await axiosInstance.get(`/api/canvas/${id}`);
            setCanvas(res.data);
        } catch (err) {
            setError('Failed to load blueprint');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchCanvas(); }, [fetchCanvas]);

    useEffect(() => {
        const isSearchingFirstStop = canvas && (!canvas.destinations || canvas.destinations.length === 0);
        if (!newDestName || newDestName.length < 2 || (!addingDest && !isSearchingFirstStop)) {
            setDestSuggestions([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSuggestLoading(true);
            try {
                const res = await axiosInstance.get(`/api/destinations/search?query=${newDestName}`);
                setDestSuggestions(res.data);
            } catch (err) {
                console.error("Suggestion fetch failed", err);
            } finally {
                setSuggestLoading(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [newDestName, addingDest, canvas]);

    const handleAddDestination = async (nameOverride) => {
        const name = nameOverride || newDestName;
        if (!name.trim()) return;
        try {
            await axiosInstance.post(`/api/canvas/${id}/destinations`, { name });
            setNewDestName('');
            setAddingDest(false);
            setDestSuggestions([]);
            fetchCanvas();
        } catch { setError('Failed to add destination'); }
    };

    const handleRemoveDestination = async (destId) => {
        if (!window.confirm('Archive and remove this destination stop?')) return;
        try {
            await axiosInstance.delete(`/api/canvas/destinations/${destId}`);
            fetchCanvas();
        } catch { setError('Failed to remove destination'); }
    };

    const handleAddItem = async (destId) => {
        if (!newItem.title.trim()) {
            setError('Title required');
            return;
        }
        try {
            const payload = { ...newItem, costEstimate: newItem.costEstimate ? parseFloat(newItem.costEstimate) : null };
            await axiosInstance.post(`/api/canvas/destinations/${destId}/items`, payload);
            setNewItem({ title: '', type: 'PLACE', description: '', url: '', costEstimate: '' });
            setAddingItemTo(null);
            fetchCanvas();
        } catch { setError('Failed to save item'); }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await axiosInstance.delete(`/api/canvas/items/${itemId}`);
            fetchCanvas();
        } catch { setError('Failed to remove item'); }
    };

    const handleAiSuggest = async (destId) => {
        setAiLoading(p => ({ ...p, [destId]: true }));
        setAiSuggestions(p => ({ ...p, [destId]: null }));
        try {
            const res = await axiosInstance.post(`/api/canvas/destinations/${destId}/ai-suggest`);
            setAiSuggestions(p => ({ ...p, [destId]: res.data }));
        } catch {
            setError('Failed to fetch AI suggestions.');
        } finally {
            setAiLoading(p => ({ ...p, [destId]: false }));
        }
    };

    const handleAcceptSuggestion = async (destId, suggestion) => {
        try {
            await axiosInstance.post(`/api/canvas/destinations/${destId}/items`, {
                title: suggestion.title,
                type: suggestion.type || 'PLACE',
                description: suggestion.description,
                costEstimate: suggestion.costEstimate,
            });
            setAiSuggestions(p => ({
                ...p,
                [destId]: p[destId].filter(s => s.title !== suggestion.title)
            }));
            fetchCanvas();
        } catch { setError('Failed to add suggestion'); }
    };

    const handleDismissSuggestion = (destId, title) => {
        setAiSuggestions(p => ({
            ...p,
            [destId]: p[destId].filter(s => s.title !== title)
        }));
    };

    const handleVote = async (itemId) => {
        try {
            const res = await axiosInstance.post(`/api/canvas/items/${itemId}/vote`);
            setCanvas(prev => ({
                ...prev,
                destinations: prev.destinations.map(dest => ({
                    ...dest,
                    items: dest.items.map(item =>
                        item.id === itemId
                            ? { ...item, voteCount: res.data.voteCount, votedByMe: res.data.votedByMe }
                            : item
                    )
                }))
            }));
        } catch {
            setError('Failed to upvote');
        }
    };

    const copyInviteLink = () => {
        const url = `${window.location.origin}/canvas/join/${canvas.inviteToken}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const calculateTotalCost = () => {
        if (!canvas || !canvas.destinations) return 0;
        let sum = 0;
        canvas.destinations.forEach(dest => {
            if (dest.items) {
                dest.items.forEach(item => {
                    if (item.costEstimate) sum += item.costEstimate;
                });
            }
        });
        return sum;
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
        <div className={`min-h-screen flex items-center justify-center font-sans transition-colors duration-500 ${isDark ? "bg-[#09090b]" : "bg-[#fbfbf9]"}`}>
            <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 dark:border-zinc-700 dark:border-t-white rounded-full animate-spin"></div>
        </div>
    );

    if (error && !canvas) return (
        <div className={`min-h-screen flex items-center justify-center font-sans transition-colors duration-500 ${isDark ? "bg-[#09090b] text-white" : "bg-[#fbfbf9] text-zinc-900"}`}>
            <div className="text-center max-w-md p-6">
                <span className="text-5xl block mb-6">🗺️</span>
                <p className="text-red-500 font-bold mb-6">{error}</p>
                <Link to="/my-trips" className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest ${isDark ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"}`}>
                    Return to dashboard
                </Link>
            </div>
        </div>
    );

    const totalCost = calculateTotalCost();

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
                
                {/* Error Toast */}
                {error && canvas && (
                    <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold text-center flex items-center justify-between">
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError('')} className="font-extrabold hover:underline">✕</button>
                    </div>
                )}

                {/* ── TWO COLUMN DESKTOP GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    
                    {/* ──── LEFT PANEL (STICKY SUMMARY) ──── */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-8">
                        
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
                                <span className="text-8xl">🧭</span>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
                                    canvas.coverImage 
                                        ? "bg-white/10 border-white/20 text-white" 
                                        : "bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20 text-indigo-600 dark:text-violet-300"
                                } border`}>
                                    <span className="text-[9px] tracking-wider uppercase font-bold">
                                        ✦ Co-Author Console
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
                                        <span>🛫</span>
                                        <span>From {canvas.startingLocation || 'Anywhere'}</span>
                                    </p>
                                </div>

                                <div className={`pt-4 border-t ${
                                    canvas.coverImage ? "border-white/10" : "border-zinc-200/50 dark:border-zinc-800/40"
                                } grid grid-cols-2 gap-4`}>
                                    <div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                            canvas.coverImage ? "text-zinc-400" : "text-zinc-400"
                                        }`}>Est. Cost</span>
                                        <span className={`text-lg font-black ${
                                            canvas.coverImage ? "text-white" : "text-zinc-900 dark:text-white"
                                        }`}>
                                            ₹{totalCost.toLocaleString('en-IN')}
                                        </span>
                                    </div>
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
                                </div>

                                {/* Crew Avatars */}
                                {canvas.members?.length > 0 && (
                                    <div className={`pt-4 border-t ${
                                        canvas.coverImage ? "border-white/10" : "border-zinc-200/50 dark:border-zinc-800/40"
                                    }`}>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider block mb-3 ${
                                            canvas.coverImage ? "text-zinc-400" : "text-zinc-400"
                                        }`}>Flight Crew</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {canvas.members.map(m => (
                                                <div 
                                                    key={m.id} 
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                                        m.role === 'OWNER' 
                                                            ? isDark ? "bg-white text-zinc-950 border-white" : "bg-zinc-950 text-white border-zinc-950"
                                                            : isDark ? "bg-zinc-800 border-zinc-700 text-zinc-300" : "bg-zinc-100 border-zinc-200 text-zinc-700"
                                                    }`} 
                                                    title={`${m.user?.name || m.user?.email} (${m.role})`}
                                                >
                                                    {m.user?.name?.[0]?.toUpperCase() || m.user?.email?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Interactive Actions */}
                                <div className={`pt-6 border-t ${
                                    canvas.coverImage ? "border-white/10" : "border-zinc-200/50 dark:border-zinc-800/40"
                                } flex items-center gap-3`}>
                                    <button 
                                        onClick={copyInviteLink} 
                                        className={`flex-1 py-3.5 rounded-2xl font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all text-center select-none ${
                                            copied 
                                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300" 
                                                : canvas.coverImage 
                                                    ? "bg-white text-zinc-950 hover:bg-zinc-200"
                                                    : isDark ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-zinc-800"
                                        }`}
                                    >
                                        {copied ? 'Link Copied' : 'Invite Crew'}
                                    </button>
                                    <button 
                                        onClick={fetchCanvas} 
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-colors cursor-pointer ${
                                            isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-950"
                                        }`}
                                        title="Synchronize"
                                    >
                                        ⟳
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stop progression visual checklist */}
                        {canvas.destinations?.length > 0 && (
                            <div className={`p-6 rounded-3xl ${
                                isDark ? "bg-zinc-950/40 border border-zinc-800/80" : "bg-white/40 border border-zinc-200/60"
                            } backdrop-blur-xl hidden lg:block`}>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-4">Route Progress</span>
                                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
                                    {canvas.destinations.map((dest, dIdx) => (
                                        <div key={dest.id} className="relative flex items-center justify-between gap-4">
                                            {/* dot */}
                                            <div className="absolute left-[-21px] w-3 h-3 rounded-full border-2 bg-indigo-500 border-white dark:border-zinc-950 shadow-sm" />
                                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{dest.name}</span>
                                            <span className="text-[10px] font-black text-zinc-400 shrink-0">STOP {dIdx + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ──── RIGHT PANEL (ACTIVE SCRAPBOOK STOPS) ──── */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {canvas.destinations?.length === 0 ? (
                            <div className="text-center py-12 md:py-20 px-5 md:px-8 rounded-[2rem] md:rounded-[2.5rem] border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-white/30 dark:bg-zinc-900/10 backdrop-blur-xl">
                                <div className="max-w-md mx-auto space-y-6">
                                    <span className="text-5xl block select-none">🗺️</span>
                                    <div>
                                        <p className={`text-xl font-black mb-2 ${isDark ? "text-zinc-300" : "text-zinc-950"}`}>
                                            No Stops Added Yet
                                        </p>
                                        <p className={`text-xs max-w-xs mx-auto ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                            This scrapbook needs destinations! Add your first target stop right here to start listing spots.
                                        </p>
                                    </div>
                                    
                                    <div className={`p-6 rounded-3xl ${
                                        isDark ? "bg-zinc-950/40 border-zinc-800" : "bg-white/50 border-zinc-150"
                                    } border text-left space-y-4`}>
                                        <input 
                                            value={newDestName} 
                                            onChange={e => setNewDestName(e.target.value)} 
                                            placeholder="Enter first stop name (e.g. Kyoto, Japan)" 
                                            className={`w-full bg-transparent text-base font-extrabold outline-none border-b pb-2 ${
                                                isDark 
                                                    ? "border-zinc-800 focus:border-violet-400 text-white placeholder:text-zinc-700" 
                                                    : "border-zinc-200 focus:border-indigo-500 text-zinc-900 placeholder:text-zinc-300"
                                            }`} 
                                        />
                                        
                                        {destSuggestions.length > 0 && (
                                            <div className={`rounded-2xl border overflow-hidden shadow-md max-h-60 overflow-y-auto ${
                                                isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"
                                            }`}>
                                                {destSuggestions.map((s, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => handleAddDestination(s.display_name)}
                                                        className={`w-full text-left px-4 py-3 flex flex-col transition-colors border-b last:border-0 cursor-pointer ${
                                                            isDark ? "hover:bg-zinc-800 border-zinc-800 text-white" : "hover:bg-zinc-50 border-zinc-150 text-zinc-900"
                                                        }`}
                                                    >
                                                        <span className="font-extrabold text-xs truncate">{s.display_name.split(',')[0]}</span>
                                                        <span className={`text-[10px] truncate ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                                            {s.display_name.split(',').slice(1).join(',').trim()}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => handleAddDestination()} 
                                            className={`w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer text-center select-none shadow-sm ${
                                                isDark ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-zinc-800"
                                            }`}
                                        >
                                            Add First Stop 🛫
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {canvas.destinations.map((dest, dIdx) => (
                                    <div 
                                        key={dest.id} 
                                        className={`p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] ${
                                            isDark ? "glass-premium-dark" : "glass-premium-light"
                                        } border transition-all duration-300 relative`}
                                    >
                                        {/* Stop Header badge */}
                                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/40">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black tracking-widest uppercase text-indigo-600 dark:text-violet-400">Stop {dIdx + 1}</span>
                                                <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                                                    {dest.name}
                                                </h2>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleRemoveDestination(dest.id)} 
                                                className={`text-xs font-bold transition-colors ${
                                                    isDark ? "text-zinc-600 hover:text-red-400" : "text-zinc-400 hover:text-red-500"
                                                }`}
                                            >
                                                Remove Stop
                                            </button>
                                        </div>

                                        {/* Canvas Items List */}
                                        {dest.items?.length > 0 ? (
                                            <div className="space-y-5 mb-8">
                                                {dest.items.map((item) => {
                                                    const tc = typeConfig(item.type);
                                                    return (
                                                        <div 
                                                            key={item.id} 
                                                            className={`group/item p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                                                                isDark 
                                                                    ? "bg-zinc-900/30 hover:bg-zinc-900/50 border-zinc-800/60" 
                                                                    : "bg-zinc-50/60 hover:bg-white border-zinc-100"
                                                            }`}
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                                    <span className="text-xl select-none">{tc.icon}</span>
                                                                    <span className="font-extrabold text-base text-zinc-950 dark:text-white">{item.title}</span>
                                                                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                                                        isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-200/50 text-zinc-500"
                                                                    }`}>
                                                                        {tc.label}
                                                                    </span>
                                                                    {item.aiSuggestion && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                                            AI Idea
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                
                                                                {item.description && (
                                                                    <p className={`text-sm leading-relaxed mb-3 pl-8 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                                                                        {item.description}
                                                                    </p>
                                                                )}
                                                                
                                                                <div className="flex items-center gap-4 pl-8 flex-wrap">
                                                                    {item.costEstimate && (
                                                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${
                                                                            isDark ? "bg-zinc-800/40 text-zinc-300 border-zinc-800" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                                                                        }`}>
                                                                            ₹{item.costEstimate.toLocaleString('en-IN')}
                                                                        </span>
                                                                    )}
                                                                    {item.url && (
                                                                        <a href={item.url} target="_blank" rel="noreferrer" className={`text-xs font-bold hover:underline ${
                                                                            isDark ? "text-violet-300" : "text-indigo-600"
                                                                        }`}>
                                                                            Booking Link ↗
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Upvote Meters & Trash actions */}
                                                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t border-dashed border-zinc-200/30 dark:border-zinc-800/20 sm:border-0 shrink-0">
                                                                <button
                                                                    onClick={() => handleVote(item.id)}
                                                                    className={`flex items-center gap-2 text-xs font-black transition-all px-3 py-1.5 rounded-xl cursor-pointer hover:scale-105 active:scale-95 ${
                                                                        item.votedByMe
                                                                            ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-400/20"
                                                                            : isDark ? "bg-zinc-800/50 text-zinc-500 border border-zinc-800/50 hover:text-white" : "bg-zinc-100 text-zinc-400 border border-zinc-200/50 hover:text-zinc-900"
                                                                    }`}
                                                                >
                                                                    <span>▲</span>
                                                                    <span>{item.voteCount || 0}</span>
                                                                </button>
                                                                
                                                                <button 
                                                                    onClick={() => handleRemoveItem(item.id)} 
                                                                    className={`opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity text-xs font-bold cursor-pointer ${
                                                                        isDark ? "text-zinc-600 hover:text-red-400" : "text-zinc-400 hover:text-red-500"
                                                                    }`}
                                                                    title="Remove Item"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className={`text-xs font-semibold mb-8 italic ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                                                No plans mapped for this stop yet. Click below to add places or pull AI recommendations.
                                            </p>
                                        )}

                                        {/* AI Suggestions Box (Glowing recommendation list) */}
                                        {aiSuggestions[dest.id]?.length > 0 && (
                                            <div className="space-y-4 mb-8 pt-4 border-t border-dashed border-zinc-200/50 dark:border-zinc-800/40">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
                                                    <span className="text-[8px] tracking-wider uppercase font-black text-blue-500">
                                                        ✦ AI Recommendations Guide
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    {aiSuggestions[dest.id].map((s, i) => {
                                                        const tc = typeConfig(s.type);
                                                        return (
                                                            <div key={i} className={`flex flex-col sm:flex-row sm:items-start gap-4 p-4 sm:p-5 rounded-2xl border ${
                                                                isDark ? "border-blue-900/30 bg-blue-950/10" : "border-blue-100 bg-blue-50/20"
                                                            }`}>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                                                        <span className="text-lg select-none">{tc.icon}</span>
                                                                        <span className="font-extrabold text-sm text-zinc-950 dark:text-white">{s.title}</span>
                                                                    </div>
                                                                    {s.description && (
                                                                        <p className={`text-xs leading-relaxed pl-7 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                                                                            {s.description}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-2 pt-3 sm:pt-0 border-t border-dashed border-blue-500/20 dark:border-blue-500/10 sm:border-0 shrink-0">
                                                                    <button 
                                                                        onClick={() => handleAcceptSuggestion(dest.id, s)} 
                                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors ${
                                                                            isDark ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-zinc-800"
                                                                        }`}
                                                                    >
                                                                        Add
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDismissSuggestion(dest.id, s.title)} 
                                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border ${
                                                                            isDark ? "hover:bg-zinc-900 text-zinc-400 border-zinc-800" : "hover:bg-zinc-100 text-zinc-500 border-zinc-200"
                                                                        }`}
                                                                    >
                                                                        Dismiss
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Add Item form */}
                                        {addingItemTo === dest.id ? (
                                            <div className={`p-6 rounded-2xl border ${isDark ? "bg-zinc-900/20 border-zinc-850" : "bg-zinc-50 border-zinc-200/50"} space-y-5 shadow-sm`}>
                                                <input 
                                                    autoFocus 
                                                    value={newItem.title} 
                                                    onChange={e => setNewItem(p => ({...p, title: e.target.value}))} 
                                                    placeholder="Activity Name (e.g. Kyoto Imperial Palace)" 
                                                    className={`w-full bg-transparent text-lg font-extrabold outline-none border-b pb-2 ${
                                                        isDark ? "border-zinc-800 focus:border-violet-400 text-white placeholder:text-zinc-700" : "border-zinc-200 focus:border-indigo-500 text-zinc-900 placeholder:text-zinc-300"
                                                    }`} 
                                                />
                                                
                                                <div className="space-y-1.5">
                                                    <span className={`text-[8px] font-black uppercase tracking-wider pl-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Category Type</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ITEM_TYPES.map(t => (
                                                            <button 
                                                                key={t.value} 
                                                                type="button" 
                                                                onClick={() => setNewItem(p => ({...p, type: t.value}))} 
                                                                className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                                                    newItem.type === t.value 
                                                                        ? isDark ? "bg-white text-zinc-950 shadow" : "bg-zinc-950 text-white shadow" 
                                                                        : isDark ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-400" : "bg-zinc-100 hover:bg-zinc-200/60 text-zinc-600"
                                                                }`}
                                                            >
                                                                {t.icon} {t.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <span className={`text-[8px] font-black uppercase tracking-wider pl-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>URL Link</span>
                                                        <input 
                                                            value={newItem.url} 
                                                            onChange={e => setNewItem(p => ({...p, url: e.target.value}))} 
                                                            placeholder="https://booking.com/etc" 
                                                            className="w-full px-4 py-3 rounded-xl text-xs outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white premium-input" 
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <span className={`text-[8px] font-black uppercase tracking-wider pl-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Cost (INR)</span>
                                                        <input 
                                                            value={newItem.costEstimate} 
                                                            onChange={e => setNewItem(p => ({...p, costEstimate: e.target.value}))} 
                                                            placeholder="e.g. 5000" 
                                                            type="number" 
                                                            className="w-full px-4 py-3 rounded-xl text-xs outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white premium-input" 
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <span className={`text-[8px] font-black uppercase tracking-wider pl-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Notes & Description</span>
                                                    <textarea 
                                                        value={newItem.description} 
                                                        onChange={e => setNewItem(p => ({...p, description: e.target.value}))} 
                                                        placeholder="Add stops details, schedules, transit details..." 
                                                        rows={2} 
                                                        className="w-full px-4 py-3 rounded-xl text-xs outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white resize-none premium-input" 
                                                    />
                                                </div>

                                                <div className="flex gap-3 pt-2">
                                                    <button 
                                                        onClick={() => handleAddItem(dest.id)} 
                                                        className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                                                            isDark ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-zinc-800"
                                                        }`}
                                                    >
                                                        Save Item
                                                    </button>
                                                    <button 
                                                        onClick={() => { setAddingItemTo(null); setNewItem({ title: '', type: 'PLACE', description: '', url: '', costEstimate: '' }); }} 
                                                        className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${
                                                            isDark ? "hover:bg-zinc-900 text-zinc-400 border-zinc-800" : "hover:bg-zinc-100 text-zinc-500 border-zinc-200"
                                                        }`}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4 pt-4 border-t border-dashed border-zinc-200/50 dark:border-zinc-800/40 flex-wrap">
                                                <button 
                                                    onClick={() => setAddingItemTo(dest.id)} 
                                                    className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${
                                                        isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-950"
                                                    }`}
                                                >
                                                    <span>+ Add Custom Spot</span>
                                                </button>
                                                <span className={isDark ? "text-zinc-800" : "text-zinc-200"}>|</span>
                                                <button 
                                                    onClick={() => handleAiSuggest(dest.id)} 
                                                    disabled={aiLoading[dest.id]} 
                                                    className={`inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${
                                                        aiLoading[dest.id] ? "opacity-50" : ""
                                                    } ${isDark ? "text-violet-300 hover:text-violet-200" : "text-indigo-600 hover:text-indigo-800"}`}
                                                >
                                                    {aiLoading[dest.id] ? "Loading ideas..." : "✨ Brainstorm AI Ideas"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── ADD DESTINATION STOP INPUT ── */}
                        <div className={`p-8 rounded-[2.5rem] ${
                            isDark ? "bg-zinc-900/10 border-zinc-850/60" : "bg-white/30 border-zinc-200/40"
                        } border backdrop-blur-xl`}>
                            {addingDest ? (
                                <div className="max-w-md space-y-4">
                                    <input 
                                        value={newDestName} 
                                        onChange={e => setNewDestName(e.target.value)} 
                                        placeholder="Add Stop Name (e.g. Kyoto, Japan)" 
                                        autoFocus 
                                        className={`w-full bg-transparent text-xl font-black outline-none border-b pb-2 ${
                                            isDark ? "border-zinc-800 focus:border-violet-400 text-white placeholder:text-zinc-700" : "border-zinc-200 focus:border-indigo-500 text-zinc-900 placeholder:text-zinc-300"
                                        }`} 
                                    />
                                    
                                    {destSuggestions.length > 0 && (
                                        <div className={`rounded-2xl border overflow-hidden shadow-md max-h-60 overflow-y-auto ${
                                            isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"
                                        }`}>
                                            {destSuggestions.map((s, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAddDestination(s.display_name)}
                                                    className={`w-full text-left px-4 py-3 flex flex-col transition-colors border-b last:border-0 ${
                                                        isDark ? "hover:bg-zinc-800 border-zinc-800 text-white" : "hover:bg-zinc-50 border-zinc-150 text-zinc-900"
                                                    }`}
                                                >
                                                    <span className="font-extrabold text-xs truncate">{s.display_name.split(',')[0]}</span>
                                                    <span className={`text-[10px] truncate ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                                                        {s.display_name.split(',').slice(1).join(',').trim()}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleAddDestination()} 
                                            className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                                                isDark ? "bg-white text-zinc-950 hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-zinc-800"
                                            }`}
                                        >
                                            Confirm Stop
                                        </button>
                                        <button 
                                            onClick={() => { setAddingDest(false); setNewDestName(''); setDestSuggestions([]); }} 
                                            className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border ${
                                                isDark ? "hover:bg-zinc-900 text-zinc-400 border-zinc-800" : "hover:bg-zinc-100 text-zinc-500 border-zinc-200"
                                            }`}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setAddingDest(true)} 
                                    className={`inline-flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${
                                        isDark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-950"
                                    }`}
                                >
                                    <span>+ Append Journey Stop</span>
                                    <span>🗺️</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripCanvas;
