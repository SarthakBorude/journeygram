import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useTheme } from '../context/ThemeContext';

const CreateCanvas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        startingLocation: '',
        coverImage: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isDark = theme === 'dark';

    useEffect(() => {
        if (location.state?.startingLocation) {
            setFormData(prev => ({
                ...prev,
                startingLocation: location.state.startingLocation,
                name: `Voyage to ${location.state.startingLocation}`
            }));
        }
    }, [location.state]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError("Cover photo must be less than 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({
                ...prev,
                coverImage: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic date validation
        if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
            setError("End Date cannot be earlier than Start Date.");
            setLoading(false);
            return;
        }

        try {
            const response = await axiosInstance.post('/api/canvas', formData);
            navigate(`/canvas/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to initialize canvas. Please try again.');
        } finally {
            setLoading(false);
        }
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

            {/* Bullet Journal Dot Grid Backdrop */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] dark:bg-[radial-gradient(#a78bfa_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.03] dark:opacity-[0.015]" />

            <div className="max-w-3xl mx-auto px-6 relative z-10">
                
                {/* ── HEADER ── */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20 mb-6">
                        <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-indigo-600 dark:text-violet-300">
                            ✦ Blueprint Initializer
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-zinc-950 dark:text-white mb-4">
                        Initialize Blueprint
                    </h1>
                    <p className={`text-base font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                        Begin a blank travel canvas. Fill in structural dates and locations below to unlock co-author boards.
                    </p>
                </div>

                {/* ── CARD FORM ── */}
                <div className={`p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[2.5rem] ${
                    isDark ? "glass-premium-dark" : "glass-premium-light"
                } border shadow-[0_30px_100px_rgba(99,102,241,0.04)]`}>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold text-center flex items-center justify-center gap-2">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-8">
                            {/* Trip Title */}
                            <div className="space-y-1.5">
                                <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${
                                    isDark ? "text-zinc-500" : "text-zinc-400"
                                }`}>
                                    Blueprint Title
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="E.g. Summer Escapade in Tokyo"
                                    className={`w-full bg-transparent text-2xl md:text-3xl font-extrabold tracking-tight outline-none border-b pb-3 transition-colors ${
                                        isDark 
                                            ? "border-zinc-800 focus:border-violet-400 text-white placeholder:text-zinc-700" 
                                            : "border-zinc-200 focus:border-indigo-500 text-zinc-950 placeholder:text-zinc-300"
                                    }`}
                                />
                            </div>

                            {/* Starting Location */}
                            <div className="space-y-2">
                                <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${
                                    isDark ? "text-zinc-500" : "text-zinc-400"
                                }`}>
                                    Starting Location
                                </label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.startingLocation}
                                    onChange={(e) => setFormData({...formData, startingLocation: e.target.value})}
                                    placeholder="e.g. San Francisco or New Delhi"
                                    className="w-full px-5 py-4 rounded-2xl text-sm outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white premium-input"
                                />
                            </div>

                            {/* Trip Cover Image Selector */}
                            <div className="space-y-4">
                                <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${
                                    isDark ? "text-zinc-500" : "text-zinc-400"
                                }`}>
                                    Trip Cover Image
                                </label>

                                {formData.coverImage ? (
                                    <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-zinc-200/20 shadow-inner group">
                                        <img 
                                            src={formData.coverImage} 
                                            alt="Cover preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-3">
                                            <label 
                                                htmlFor="cover-photo-upload" 
                                                className="px-4 py-2 rounded-xl bg-white text-zinc-950 font-bold text-xs uppercase cursor-pointer hover:bg-zinc-200 transition-all active:scale-95"
                                            >
                                                Change Image
                                            </label>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs uppercase hover:bg-red-700 transition-all active:scale-95 cursor-pointer"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => document.getElementById('cover-photo-upload').click()}
                                        className={`aspect-[21/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 ${
                                            isDark 
                                                ? "border-zinc-800 bg-zinc-900/10 hover:border-violet-500 hover:bg-violet-950/5 text-zinc-500 hover:text-violet-300" 
                                                : "border-zinc-200 bg-zinc-50/30 hover:border-indigo-500 hover:bg-indigo-50/10 text-zinc-400 hover:text-indigo-600"
                                        }`}
                                    >
                                        <span className="text-4xl mb-2 select-none">📸</span>
                                        <p className="font-extrabold text-sm mb-1">Upload custom cover photo</p>
                                        <p className="text-[10px] font-bold opacity-60">JPG, PNG, or WEBP. Max 2MB.</p>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    id="cover-photo-upload" 
                                    onChange={handleFileChange} 
                                />

                                {/* Curated Presets Carousel */}
                                <div className="space-y-2">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest pl-1 block ${
                                        isDark ? "text-zinc-600" : "text-zinc-400"
                                    }`}>
                                        Or choose from our premium design presets:
                                    </span>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { name: "Alps", url: "https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600" },
                                            { name: "Tokyo", url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600" },
                                            { name: "Amalfi", url: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=600" },
                                            { name: "Bali", url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600" }
                                        ].map((preset) => (
                                            <button
                                                key={preset.name}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, coverImage: preset.url }))}
                                                className={`relative h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all active:scale-95 group shadow-sm ${
                                                    formData.coverImage === preset.url
                                                        ? isDark ? "border-violet-400 scale-[1.03] shadow-violet-500/10" : "border-indigo-500 scale-[1.03] shadow-indigo-500/10"
                                                        : "border-transparent"
                                                }`}
                                            >
                                                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                                    <span className="text-[9px] font-black uppercase text-white tracking-widest">{preset.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Trip Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${
                                        isDark ? "text-zinc-500" : "text-zinc-400"
                                    }`}>
                                        Start Date
                                    </label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl text-sm outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] premium-input"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${
                                        isDark ? "text-zinc-500" : "text-zinc-400"
                                    }`}>
                                        End Date
                                    </label>
                                    <input 
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl text-sm outline-none bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] premium-input"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 border-t border-zinc-200/50 dark:border-zinc-800/40 flex justify-end">
                                <button 
                                    type="submit"
                                    disabled={loading}
                                    className={`px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all hover:scale-105 active:scale-98 select-none shadow-md ${
                                        isDark 
                                            ? "bg-white text-zinc-950 hover:bg-zinc-200" 
                                            : "bg-zinc-950 text-white hover:bg-zinc-800"
                                    } disabled:opacity-50 disabled:pointer-events-none`}
                                >
                                    {loading ? "Initializing..." : "Create Board"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateCanvas;
