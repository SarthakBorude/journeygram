import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
    const { logout } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [profile, setProfile] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [profileRes, tripsRes] = await Promise.all([
                axiosInstance.get("/api/auth/me"),
                axiosInstance.get("/api/trips/my")
            ]);
            setProfile(profileRes.data);
            setTrips(tripsRes.data);
        } catch (err) {
            console.error("Failed to fetch profile data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleVisibility = async (tripId) => {
        try {
            const response = await axiosInstance.patch(`/api/trips/${tripId}/visibility`);
            setTrips((prev) =>
                prev.map((t) => (t.id === tripId ? response.data : t))
            );
        } catch (err) {
            console.error("Failed to toggle visibility", err);
        }
    };

    const handleDelete = async (tripId) => {
        if (!window.confirm("Delete this trip forever from your journal?")) return;
        try {
            await axiosInstance.delete(`/api/trips/${tripId}`);
            setTrips((prev) => prev.filter((t) => t.id !== tripId));
        } catch (err) {
            console.error("Failed to delete trip", err);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex justify-center items-center ${isDark ? 'bg-[#09090b]' : 'bg-[#f8f7ff]'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    const userInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : (profile?.email ? profile.email.charAt(0).toUpperCase() : "?");

    return (
        <div className={`min-h-screen transition-all duration-700 font-['Outfit'] overflow-x-hidden relative ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#f8f7ff] text-zinc-900'}`}>
            
            {/* ── BACKGROUND LAYERS (Cohesive Theme) ────────────────────────── */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-map-grid opacity-[0.15]"></div>
                
                {/* Purple/Pink Wash */}
                <div className={`absolute top-[-20%] left-[-10%] w-[100%] h-[100%] rounded-full blur-[150px] transition-all duration-1000 ${isDark ? 'bg-violet-900/10' : 'bg-violet-200/30'}`}></div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full blur-[150px] transition-all duration-1000 ${isDark ? 'bg-pink-900/5' : 'bg-pink-100/20'}`}></div>

                {/* Faint Flight Path */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 1000 1000">
                    <path d="M-100,500 Q200,300 500,500 T1100,500" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="10,10" className="flight-path" />
                </svg>
            </div>

            {/* ── PREMIUM VOYAGER ID HEADER ───────────────────────────────────── */}
            <div className="relative z-10 pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="relative group">
                        {/* Background Decorative Layer (Map-like) */}
                        <div className={`absolute -inset-4 rounded-[2.5rem] shadow-sm rotate-[-1deg] opacity-40 z-0 border transition-all ${isDark ? 'bg-zinc-800/40 border-white/5' : 'bg-[#e8e4db] border-white/50'}`}></div>
                        
                        <div className={`relative p-10 md:p-16 rounded-[2rem] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.1)] z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16 border transition-all ${isDark ? 'bg-zinc-900/80 border-white/10' : 'bg-white/80 backdrop-blur-xl border-white'}`}>
                            {/* Washi tapes pinning the ID */}
                            <div className="washi-tape-beige absolute -top-4 left-20 rotate-[-3deg] opacity-80 scale-95"></div>
                            <div className="washi-tape-beige absolute -top-4 right-20 rotate-[2deg] opacity-80 scale-95"></div>
                            
                            {/* Profile Photo / Avatar Stamp */}
                            <div className="relative">
                                <div className={`w-52 h-52 rounded-3xl flex items-center justify-center text-8xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.2)] rotate-[-2deg] border-8 transition-all group-hover:rotate-0 duration-700 overflow-hidden ${isDark ? 'bg-violet-900/50 text-violet-200 border-zinc-800' : 'bg-zinc-900 text-white border-white'}`}>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] opacity-10"></div>
                                    <span className="relative z-10 drop-shadow-lg">{userInitial}</span>
                                </div>
                                
                                {/* Verification Stamp */}
                                <div className="absolute -bottom-6 -right-6 z-20">
                                    <div className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center rotate-[15deg] shadow-xl backdrop-blur-md ${isDark ? 'bg-violet-600/20 border-violet-400 text-violet-400' : 'bg-white border-violet-500 text-violet-600'}`}>
                                        <div className="text-center">
                                            <p className="text-[7px] font-black tracking-widest uppercase opacity-60">Identity</p>
                                            <p className="text-sm font-black tracking-tighter">VERIFIED</p>
                                            <div className="w-10 h-[1px] bg-current opacity-20 mx-auto my-1"></div>
                                            <p className="text-[7px] font-black tracking-widest italic script-font capitalize">Explorer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Voyager ID Details */}
                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 block ${isDark ? 'text-violet-400' : 'text-violet-500'}`}>Digital Passport</span>
                                    <h1 className={`text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4 ${isDark ? 'text-white' : 'text-zinc-800'}`}>
                                        {profile?.name || "Fellow Explorer"}
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <div className={`h-[1px] w-12 ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
                                        <p className={`font-bold text-[10px] uppercase tracking-widest italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                            Voyaging since {new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                                    <div className={`px-8 py-5 rounded-3xl border shadow-sm transition-all ${isDark ? 'bg-zinc-800/40 border-white/5' : 'bg-violet-50/50 border-violet-100/50'}`}>
                                        <span className={`block text-3xl font-black tracking-tighter leading-none mb-1 ${isDark ? 'text-violet-300' : 'text-violet-600'}`}>{trips.length}</span>
                                        <span className="text-[8px] font-black opacity-50 uppercase tracking-widest">Journeys</span>
                                    </div>
                                    <div className={`px-8 py-5 rounded-3xl border shadow-sm transition-all ${isDark ? 'bg-zinc-800/40 border-white/5' : 'bg-pink-50/50 border-pink-100/50'}`}>
                                        <span className={`block text-3xl font-black tracking-tighter leading-none mb-1 ${isDark ? 'text-pink-300' : 'text-pink-600'}`}>{trips.filter(t => t.publicTrip).length}</span>
                                        <span className="text-[8px] font-black opacity-50 uppercase tracking-widest">Shared</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Area */}
                            <div className="flex flex-col gap-4 w-full md:w-auto">
                                <Link to="/generate" className="px-10 py-5 bg-violet-600 text-white text-xs font-bold rounded-[2rem] text-center hover:bg-violet-700 transition-all uppercase tracking-[0.2em] shadow-lg shadow-violet-500/20 hover:-translate-y-1 active:scale-95">
                                    ✨ New Journey
                                </Link>
                                <button onClick={logout} className={`text-[10px] font-black uppercase tracking-widest transition-colors py-2 hover:text-violet-500 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                    Logout ➔
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── THE PERSONAL ARCHIVE ────────────────────────────────────────── */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <div className="flex items-center gap-8 mb-20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-violet-500 mb-1">Your Narrative</span>
                        <h2 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-zinc-800'}`}>Personal Archive</h2>
                    </div>
                    <div className={`h-[1px] flex-1 ${isDark ? 'bg-zinc-800' : 'bg-violet-100'}`}></div>
                    <span className="script-font text-violet-500 text-3xl opacity-60">Kyoto Collection</span>
                </div>
                
                {trips.length === 0 ? (
                    <div className={`p-20 text-center rounded-[3rem] border-2 border-dashed transition-all ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/50 border-violet-100 shadow-sm'}`}>
                        <div className="text-8xl mb-8 opacity-20 filter grayscale">🗺️</div>
                        <h3 className={`text-3xl font-black tracking-tighter mb-4 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>The map is blank.</h3>
                        <p className="text-zinc-400 mb-10 max-w-sm mx-auto font-bold text-[10px] uppercase tracking-widest leading-relaxed">Every legendary voyager started with a single draft. Initialize your first blueprint now.</p>
                        <Link to="/generate" className="px-12 py-6 bg-violet-600 text-white text-xs font-bold rounded-[2rem] hover:bg-violet-700 transition-all uppercase tracking-widest shadow-xl shadow-violet-500/20">
                            Start First Log →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {trips.map((trip, idx) => (
                            <div key={trip.id} className="group relative">
                                {/* Polaroid Glow Effect */}
                                <div className={`absolute -inset-2 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/5'}`}></div>
                                
                                <div className={`relative p-5 rounded-[1.5rem] transition-all duration-700 group-hover:-translate-y-3 border ${idx % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-[1deg]'} ${isDark ? 'bg-zinc-900 border-white/5 shadow-2xl' : 'bg-white border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]'}`}>
                                    {/* Washi Tape */}
                                    <div className="washi-tape-beige absolute -top-4 left-1/2 -translate-x-1/2 rotate-[-2deg] z-20 opacity-70 scale-90"></div>
                                    
                                    {/* Trip Polaroid Area */}
                                    <div className={`relative aspect-[5/4] rounded-xl overflow-hidden mb-6 transition-all group-hover:scale-[1.02] ${isDark ? 'bg-zinc-800' : 'bg-violet-50'}`}>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-5xl opacity-[0.05] grayscale rotate-12">✈️</span>
                                        </div>
                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md transition-all ${
                                                trip.publicTrip 
                                                ? 'bg-violet-500/20 text-violet-400 border border-violet-400/30' 
                                                : isDark ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' : 'bg-white text-zinc-400 border border-zinc-100'
                                            }`}>
                                                {trip.publicTrip ? '● Shared' : '○ Private'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-1 pb-2 space-y-5">
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-violet-500 mb-1.5 block">Log Entry</span>
                                            <h3 className={`text-3xl font-black tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-zinc-800'}`}>
                                                {trip.destination}
                                            </h3>
                                        </div>

                                        <div className={`flex items-center justify-between py-4 border-y ${isDark ? 'border-white/5' : 'border-zinc-50'}`}>
                                            <div className="text-center flex-1 border-r border-zinc-50/10">
                                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Days</p>
                                                <p className={`text-sm font-bold tracking-tighter ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{trip.durationDays}</p>
                                            </div>
                                            <div className="text-center flex-1">
                                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Budget</p>
                                                <p className={`text-sm font-bold tracking-tighter ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>₹{trip.budget.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-2 flex gap-3">
                                            <Link to={`/trip/${trip.id}`} className={`flex-1 py-4 text-[10px] font-black rounded-xl text-center transition-all uppercase tracking-widest shadow-lg ${isDark ? 'bg-white text-black hover:bg-violet-50' : 'bg-zinc-900 text-white hover:bg-black shadow-zinc-200'}`}>
                                                Open Log
                                            </Link>
                                            <button 
                                                onClick={() => handleToggleVisibility(trip.id)}
                                                className={`flex-1 py-4 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest border ${isDark ? 'bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700' : 'bg-white text-zinc-800 border-zinc-200 hover:border-violet-300'}`}
                                            >
                                                {trip.publicTrip ? 'Privatize' : 'Go Public'}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(trip.id)}
                                                className={`w-12 flex items-center justify-center transition-colors rounded-xl border ${isDark ? 'border-zinc-800 text-zinc-700 hover:text-red-400' : 'border-zinc-100 text-zinc-200 hover:text-red-500 hover:bg-red-50'}`}
                                            >
                                                <span className="text-xl">×</span>
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
    );
};

export default Profile;
