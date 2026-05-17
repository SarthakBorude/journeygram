import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ITEM_TYPES = [
    { value: 'PLACE', label: 'Place to Visit', icon: '🏛️', color: 'indigo' },
    { value: 'FOOD', label: 'Food Spot', icon: '🍜', color: 'amber' },
    { value: 'HOTEL', label: 'Hotel / Stay', icon: '🏨', color: 'emerald' },
    { value: 'TRANSPORT', label: 'Transport', icon: '🚗', color: 'sky' },
    { value: 'NOTE', label: 'Note', icon: '📝', color: 'zinc' },
    { value: 'BOOKING', label: 'Booking Link', icon: '🔗', color: 'fuchsia' },
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
    const [expandedDests, setExpandedDests] = useState({});
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
            // Auto-expand all destinations on first load
            const expanded = {};
            res.data.destinations?.forEach(d => { expanded[d.id] = true; });
            setExpandedDests(prev => Object.keys(prev).length === 0 ? expanded : prev);
        } catch (err) {
            setError('Failed to load canvas');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchCanvas(); }, [fetchCanvas]);

    // Destination Autocomplete Logic
    useEffect(() => {
        if (!newDestName || newDestName.length < 2 || !addingDest) {
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
    }, [newDestName, addingDest]);

    const toggleDest = (destId) => setExpandedDests(p => ({ ...p, [destId]: !p[destId] }));

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
        if (!window.confirm('Remove this destination and all its items?')) return;
        try {
            await axiosInstance.delete(`/api/canvas/destinations/${destId}`);
            fetchCanvas();
        } catch { setError('Failed to remove destination'); }
    };

    const handleAddItem = async (destId) => {
        if (!newItem.title.trim()) {
            setError('Please provide a title for the item');
            return;
        }
        try {
            const payload = { ...newItem, costEstimate: newItem.costEstimate ? parseFloat(newItem.costEstimate) : null };
            await axiosInstance.post(`/api/canvas/destinations/${destId}/items`, payload);
            setNewItem({ title: '', type: 'PLACE', description: '', url: '', costEstimate: '' });
            setAddingItemTo(null);
            fetchCanvas();
        } catch { setError('Failed to add item'); }
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
            setError('AI suggestions failed. Try again.');
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
            // Update the item in local state with new vote data
            setCanvas(prev => ({
                ...prev,
                destinations: prev.destinations.map(dest => ({
                    ...dest,
                    items: dest.items.map(item =>
                        item.id === itemId
                            ? { ...item, voteCount: res.data.voteCount, votedByMe: res.data.votedByMe, voterNames: res.data.voterNames }
                            : item
                    )
                }))
            }));
        } catch {
            setError('Failed to vote');
        }
    };

    const copyInviteLink = () => {
        const url = `${window.location.origin}/canvas/join/${canvas.inviteToken}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center font-['Outfit'] ${isDark ? 'bg-[#09090b]' : 'bg-[#fafafa]'}`}>
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    );

    if (error && !canvas) return (
        <div className={`min-h-screen flex items-center justify-center font-['Outfit'] ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fafafa]'}`}>
            <p className="text-red-500 font-bold">{error}</p>
        </div>
    );

    return (
        <div className={`min-h-screen transition-all duration-700 font-['Outfit'] overflow-x-hidden pt-24 md:pt-28 pb-16 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fafafa] text-zinc-900'}`}>
            {/* BG */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-orb ${isDark ? 'bg-emerald-600/15' : 'bg-emerald-500/8'}`}></div>
                <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-orb-reverse ${isDark ? 'bg-sky-600/15' : 'bg-sky-500/8'}`}></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6">
                {/* Error Toast */}
                {error && canvas && (
                    <div className={`mb-6 p-4 rounded-2xl border text-sm font-bold ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                        ⚠️ {error}
                        <button onClick={() => setError('')} className="ml-4 opacity-60 hover:opacity-100">✕</button>
                    </div>
                )}

                {/* Canvas Header */}
                <div className={`rounded-[2rem] p-8 md:p-10 mb-8 border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-zinc-100 shadow-xl'}`}>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-3 flex-1">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-[0.3em] ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Collaborative Canvas
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">{canvas.name}</h1>
                            <div className={`flex flex-wrap items-center gap-4 text-xs font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {canvas.startingLocation && <span>📍 From {canvas.startingLocation}</span>}
                                {canvas.startDate && <span>🗓️ {canvas.startDate} → {canvas.endDate || '...'}</span>}
                                <span>👥 {canvas.members?.length || 1} member{canvas.members?.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={fetchCanvas} className={`p-3 rounded-xl border transition-all hover:scale-105 ${isDark ? 'bg-white/5 border-white/10 hover:border-white/30' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400'}`} title="Refresh">
                                🔄
                            </button>
                            <button onClick={copyInviteLink} className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 ${copied ? 'bg-emerald-500 text-white' : isDark ? 'bg-white text-black hover:bg-emerald-400' : 'bg-zinc-900 text-white hover:bg-emerald-600'}`}>
                                {copied ? '✓ Copied!' : '🔗 Invite'}
                            </button>
                        </div>
                    </div>

                    {/* Members row */}
                    {canvas.members?.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/5 flex items-center gap-2">
                            <span className={`text-[9px] font-bold uppercase tracking-widest mr-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Team</span>
                            {canvas.members.map(m => (
                                <div key={m.id} className={`px-3 py-1.5 rounded-full text-[10px] font-bold border ${m.role === 'OWNER' ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700') : (isDark ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600')}`}>
                                    {m.user?.name || m.user?.email} {m.role === 'OWNER' && '👑'}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Destinations */}
                <div className="space-y-6">
                    {canvas.destinations?.map((dest, idx) => (
                        <div key={dest.id} className={`rounded-[2rem] border overflow-hidden transition-all ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-zinc-100 shadow-lg'}`}>
                            {/* Dest Header */}
                            <div className={`flex items-center justify-between p-6 cursor-pointer select-none ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-zinc-50/80'}`} onClick={() => toggleDest(dest.id)}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold tracking-tight">{dest.name}</h3>
                                        <span className={`text-[10px] font-semibold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                            {dest.items?.length || 0} items
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveDestination(dest.id); }} className={`p-2 rounded-lg transition-all opacity-40 hover:opacity-100 ${isDark ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-red-50 hover:text-red-600'}`}>🗑️</button>
                                    <span className={`text-lg transition-transform ${expandedDests[dest.id] ? 'rotate-180' : ''}`}>▼</span>
                                </div>
                            </div>

                            {/* Dest Content */}
                            {expandedDests[dest.id] && (
                                <div className={`px-6 pb-6 border-t ${isDark ? 'border-white/5' : 'border-zinc-100'}`}>
                                    {/* Items */}
                                    {dest.items?.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            {dest.items.map(item => {
                                                const tc = typeConfig(item.type);
                                                return (
                                                    <div key={item.id} className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-zinc-50/50 border-zinc-100 hover:border-zinc-200'}`}>
                                                        <span className="text-xl mt-0.5">{tc.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold text-sm">{item.title}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-zinc-500' : 'bg-zinc-100 text-zinc-500'}`}>{tc.label}</span>
                                                                {item.aiSuggestion && <span className="text-[9px] text-amber-500 font-bold">✨ AI</span>}
                                                            </div>
                                                            {item.description && <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{item.description}</p>}
                                                            <div className={`flex items-center gap-3 mt-2 text-[10px] font-semibold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                                {item.costEstimate && <span>₹{item.costEstimate.toLocaleString('en-IN')}</span>}
                                                                {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">🔗 Link</a>}
                                                                <span>by {item.addedBy?.name || item.addedBy?.email}</span>
                                                            </div>

                                                            {/* Vote Section */}
                                                            <div className="flex items-center gap-3 mt-3">
                                                                <button
                                                                    onClick={() => handleVote(item.id)}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all hover:scale-105 active:scale-95 border ${
                                                                        item.votedByMe
                                                                            ? (isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                                                                            : (isDark ? 'bg-white/5 border-white/10 text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400' : 'bg-white border-zinc-200 text-zinc-400 hover:border-emerald-300 hover:text-emerald-600')
                                                                    }`}
                                                                >
                                                                    👍 {item.voteCount || 0}
                                                                </button>
                                                                {item.voterNames?.length > 0 && (
                                                                    <div className={`flex items-center gap-1 flex-wrap text-[9px] font-semibold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                                        {item.voterNames.slice(0, 4).map((name, i) => (
                                                                            <span key={i} className={`px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-zinc-100'}`}>
                                                                                {name}
                                                                            </span>
                                                                        ))}
                                                                        {item.voterNames.length > 4 && (
                                                                            <span className="opacity-60">+{item.voterNames.length - 4} more</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleRemoveItem(item.id)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1.5 rounded-lg text-xs transition-all">✕</button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* AI Suggestions */}
                                    {aiSuggestions[dest.id]?.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            <div className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>✨ AI Suggestions</div>
                                            {aiSuggestions[dest.id].map((s, i) => {
                                                const tc = typeConfig(s.type);
                                                return (
                                                    <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border-2 border-dashed transition-all ${isDark ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50/50'}`}>
                                                        <span className="text-xl mt-0.5">{tc.icon}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-bold text-sm">{s.title}</span>
                                                            {s.description && <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{s.description}</p>}
                                                            {s.costEstimate && <span className={`text-[10px] font-semibold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>₹{Number(s.costEstimate).toLocaleString('en-IN')}</span>}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleAcceptSuggestion(dest.id, s)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all">✓ Add</button>
                                                            <button onClick={() => handleDismissSuggestion(dest.id, s.title)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-zinc-100 hover:bg-zinc-200'}`}>✕</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Add Item Form */}
                                    {addingItemTo === dest.id ? (
                                        <div className={`mt-4 p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-zinc-50 border-zinc-200'}`}>
                                            <input autoFocus value={newItem.title} onChange={e => setNewItem(p => ({...p, title: e.target.value}))} placeholder="Item title" className={`w-full bg-transparent border-b py-2 text-sm font-bold outline-none ${isDark ? 'border-white/10 focus:border-emerald-500 text-white' : 'border-zinc-200 focus:border-zinc-900 text-zinc-900'}`} />
                                            <div className="flex flex-wrap gap-2">
                                                {ITEM_TYPES.map(t => (
                                                    <button key={t.value} type="button" onClick={() => setNewItem(p => ({...p, type: t.value}))} className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all ${newItem.type === t.value ? (isDark ? 'bg-white text-black border-white' : 'bg-zinc-900 text-white border-zinc-900') : (isDark ? 'bg-white/5 border-white/10 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400')}`}>
                                                        {t.icon} {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea value={newItem.description} onChange={e => setNewItem(p => ({...p, description: e.target.value}))} placeholder="Description (optional)" rows={2} className={`w-full bg-transparent border rounded-xl p-3 text-xs outline-none resize-none ${isDark ? 'border-white/10 focus:border-emerald-500' : 'border-zinc-200 focus:border-zinc-900'}`} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input value={newItem.url} onChange={e => setNewItem(p => ({...p, url: e.target.value}))} placeholder="URL (optional)" className={`bg-transparent border rounded-xl p-3 text-xs outline-none ${isDark ? 'border-white/10' : 'border-zinc-200'}`} />
                                                <input value={newItem.costEstimate} onChange={e => setNewItem(p => ({...p, costEstimate: e.target.value}))} placeholder="Cost ₹ (optional)" type="number" className={`bg-transparent border rounded-xl p-3 text-xs outline-none ${isDark ? 'border-white/10' : 'border-zinc-200'}`} />
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => handleAddItem(dest.id)} className="px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-emerald-500 text-white hover:bg-emerald-600 transition-all">Add Item</button>
                                                <button onClick={() => { setAddingItemTo(null); setNewItem({ title: '', type: 'PLACE', description: '', url: '', costEstimate: '' }); }} className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 hover:border-white/30' : 'border-zinc-200 hover:border-zinc-400'}`}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            <button onClick={() => setAddingItemTo(dest.id)} className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all hover:scale-105 ${isDark ? 'bg-white/5 border-white/10 hover:border-emerald-500 hover:text-emerald-400' : 'bg-zinc-50 border-zinc-200 hover:border-emerald-500 hover:text-emerald-600'}`}>
                                                + Add Item
                                            </button>
                                            <button onClick={() => handleAiSuggest(dest.id)} disabled={aiLoading[dest.id]} className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all hover:scale-105 ${aiLoading[dest.id] ? 'opacity-50 cursor-not-allowed' : ''} ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:border-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600 hover:border-amber-500'}`}>
                                                {aiLoading[dest.id] ? (
                                                    <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></span> Thinking...</span>
                                                ) : '🤖 Get AI Suggestions'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Destination */}
                <div className="mt-8 relative">
                    {addingDest ? (
                        <div className={`rounded-[2rem] p-8 border transition-all duration-500 animate-in zoom-in-95 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-zinc-100 shadow-2xl'}`}>
                            <div className="relative group">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl opacity-40 group-focus-within:opacity-100 transition-opacity">🔍</span>
                                <input 
                                    value={newDestName} 
                                    onChange={e => setNewDestName(e.target.value)} 
                                    placeholder="Where to next? (e.g. Ujjain, Kyoto)" 
                                    autoFocus 
                                    className={`w-full bg-transparent border-b-2 pl-10 py-4 text-2xl md:text-3xl font-bold outline-none transition-all placeholder:opacity-20 ${isDark ? 'border-white/10 focus:border-emerald-500 text-white' : 'border-zinc-200 focus:border-zinc-900 text-zinc-900'}`} 
                                />
                                {suggestLoading && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                        <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            {destSuggestions.length > 0 && (
                                <div className={`mt-4 rounded-2xl border overflow-hidden animate-in slide-in-from-top-2 duration-300 ${isDark ? 'bg-[#18181b] border-white/10' : 'bg-white border-zinc-100 shadow-2xl'}`}>
                                    {destSuggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleAddDestination(s.display_name)}
                                            className={`w-full text-left px-6 py-4 flex items-center gap-4 transition-colors ${isDark ? 'hover:bg-white/5 border-b border-white/5 last:border-0' : 'hover:bg-zinc-50 border-b border-zinc-50 last:border-0'}`}
                                        >
                                            <span className="text-xl opacity-50">📍</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{s.display_name.split(',')[0]}</div>
                                                <div className={`text-[10px] font-medium truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                    {s.display_name.split(',').slice(1).join(',').trim()}
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Select</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => handleAddDestination()} className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white text-black hover:bg-emerald-400' : 'bg-zinc-900 text-white hover:bg-emerald-600'}`}>
                                    Add Destination
                                </button>
                                <button onClick={() => { setAddingDest(false); setNewDestName(''); setDestSuggestions([]); }} className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all hover:scale-105 active:scale-95 ${isDark ? 'border-white/10 hover:border-white/30 text-white' : 'border-zinc-200 hover:border-zinc-400 text-zinc-600'}`}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setAddingDest(true)} className={`group w-full py-10 rounded-[2.5rem] border-2 border-dashed transition-all duration-500 hover:scale-[1.01] flex flex-col items-center justify-center gap-3 ${isDark ? 'border-white/10 text-zinc-600 hover:border-emerald-500/50 hover:text-emerald-400' : 'border-zinc-200 text-zinc-400 hover:border-emerald-500 hover:text-emerald-600'}`}>
                            <span className="text-3xl transition-transform group-hover:scale-125 group-hover:rotate-12 duration-500">➕</span>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Add Another Destination</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripCanvas;
