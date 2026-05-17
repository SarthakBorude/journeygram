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
        startingLocation: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (location.state?.startingLocation) {
            setFormData(prev => ({
                ...prev,
                startingLocation: location.state.startingLocation,
                name: `${location.state.startingLocation} Trip`
            }));
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('/api/canvas', formData);
            navigate(`/canvas/${response.data.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create canvas. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen transition-all duration-700 font-['Outfit'] overflow-x-hidden pt-32 pb-20 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fafafa] text-zinc-900'}`}>
            
            {/* Background Accents */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-orb transition-all duration-1000 ${isDark ? 'bg-emerald-600/20' : 'bg-emerald-500/10'}`}></div>
                <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-orb-reverse transition-all duration-1000 ${isDark ? 'bg-sky-600/20' : 'bg-sky-500/10'}`}></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6">
                
                {/* Header */}
                <div className="mb-16 space-y-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-colors ${isDark ? 'bg-white/5 border-white/10' : 'bg-zinc-900/5 border-zinc-200'}`}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-emerald-400' : 'text-zinc-600'}`}>Trip Canvas</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
                        Plan <br />
                        <span className={`italic font-light ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Together.</span>
                    </h1>
                    <p className={`text-lg font-light max-w-lg ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Create a collaborative canvas and invite your travel companions to plan the perfect trip.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {error && (
                        <div className={`p-6 rounded-3xl border-2 animate-in slide-in-from-top-4 duration-300 flex items-center gap-4 font-bold ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    {/* Trip Name */}
                    <div className="group">
                        <label className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Trip Name</label>
                        <input 
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Summer Road Trip 2026"
                            className={`w-full bg-transparent border-b-2 py-4 text-3xl md:text-4xl font-bold tracking-tight transition-all outline-none placeholder:opacity-20 ${isDark ? 'border-white/10 focus:border-emerald-500 text-white' : 'border-zinc-200 focus:border-zinc-900 text-zinc-900'}`}
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className={`text-[10px] font-bold uppercase tracking-[0.3em] block ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Start Date</label>
                            <input 
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                className={`w-full bg-transparent border rounded-2xl p-5 text-lg font-semibold outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-emerald-500 text-white [color-scheme:dark]' : 'bg-white border-zinc-200 focus:border-zinc-900 shadow-sm'}`}
                            />
                        </div>
                        <div className="space-y-4">
                            <label className={`text-[10px] font-bold uppercase tracking-[0.3em] block ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>End Date</label>
                            <input 
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                className={`w-full bg-transparent border rounded-2xl p-5 text-lg font-semibold outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 focus:border-emerald-500 text-white [color-scheme:dark]' : 'bg-white border-zinc-200 focus:border-zinc-900 shadow-sm'}`}
                            />
                        </div>
                    </div>

                    {/* Starting Location */}
                    <div className="space-y-4">
                        <label className={`text-[10px] font-bold uppercase tracking-[0.3em] block ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Starting Location</label>
                        <input 
                            type="text"
                            value={formData.startingLocation}
                            onChange={(e) => setFormData({...formData, startingLocation: e.target.value})}
                            placeholder="Mumbai, India"
                            className={`w-full bg-transparent border rounded-2xl p-5 text-lg font-semibold outline-none transition-all placeholder:opacity-20 ${isDark ? 'bg-white/5 border-white/10 focus:border-emerald-500 text-white' : 'bg-white border-zinc-200 focus:border-zinc-900 shadow-sm'}`}
                        />
                    </div>

                    {/* Submit */}
                    <div className="pt-8">
                        <button 
                            type="submit"
                            disabled={loading}
                            className={`relative group w-full px-16 py-6 rounded-2xl font-bold text-sm tracking-widest overflow-hidden transition-all hover:scale-[1.02] active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : 'shadow-2xl'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-sky-600 transition-transform duration-500 group-hover:scale-110"></div>
                            <span className="relative flex items-center justify-center gap-3 text-white uppercase">
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating...
                                    </>
                                ) : (
                                    '🎨 Create Trip Canvas'
                                )}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCanvas;
