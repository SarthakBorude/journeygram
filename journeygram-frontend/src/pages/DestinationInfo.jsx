import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import MapComponent from "../components/MapComponent";
import { useTheme } from "../context/ThemeContext";

const DestinationInfo = () => {
    const { name } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await axiosInstance.get(`/api/destinations/info?name=${name}`);
                const destination = response.data;
                
                if (destination && destination.dataJson) {
                    const parsedData = JSON.parse(destination.dataJson);
                    setData({
                        ...parsedData,
                        imageUrl: destination.imageUrl
                    });
                } else {
                    throw new Error("Invalid data format received");
                }
            } catch (err) {
                console.error(err);
                setError(`Could not retrieve guide for ${name}.`);
            } finally {
                setLoading(false);
            }
        };

        if (name) {
            loadData();
        }
    }, [name]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center font-sans transition-colors duration-500 ${isDark ? 'bg-[#09090b]' : 'bg-[#fbfbf9]'}`}>
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 dark:border-zinc-700 dark:border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-500 ${isDark ? 'bg-[#09090b] text-white' : 'bg-[#fbfbf9] text-zinc-900'}`}>
                <div className="text-center max-w-md">
                    <p className="text-red-500 font-extrabold text-lg mb-6">{error}</p>
                    <Link to="/explore" className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-950 text-white hover:bg-zinc-800'}`}>
                        Return to Discover
                    </Link>
                </div>
            </div>
        );
    }

    const renderListings = (listings, title) => {
        if (!listings || listings.length === 0) return null;

        return (
            <div className="mb-20">
                <h2 className="text-3xl font-black tracking-tight mb-8 border-b pb-4 border-zinc-200/50 dark:border-zinc-800/40 text-zinc-950 dark:text-white">
                    {title}
                </h2>
                
                <div className="space-y-10">
                    {listings.map((item, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
                            <div className="md:w-1/3">
                                <h3 className="font-extrabold text-lg tracking-tight mb-1.5 text-zinc-900 dark:text-zinc-100">
                                    {item.name}
                                </h3>
                                {item.price && (
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${isDark ? 'border-zinc-800 text-zinc-400 bg-zinc-900/45' : 'border-zinc-200 text-zinc-500 bg-zinc-50'}`}>
                                        {item.price}
                                    </span>
                                )}
                            </div>
                            
                            <div className="md:w-2/3 space-y-1.5">
                                {item.address && (
                                    <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                        ✈ {item.address}
                                    </p>
                                )}
                                <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-650'}`}>
                                    {item.content || item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
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

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                
                {/* ── HERO GUIDE SECTION ── */}
                <div className="mb-16">
                    <Link 
                        to="/explore" 
                        className={`text-xs font-black uppercase tracking-widest hover:underline mb-12 block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}
                    >
                        ← Passport Dispatch
                    </Link>
                    
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-violet-400/10 border border-indigo-500/20 dark:border-violet-400/20">
                            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-indigo-600 dark:text-violet-300">
                                ✦ Luxury Travel Guide
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none text-zinc-950 dark:text-white mb-6">
                            {data.name}
                        </h1>
                        <p className={`text-lg md:text-xl leading-relaxed font-semibold mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {data.summary}
                        </p>
                    </div>

                    <Link
                        to="/canvas/new"
                        state={{ startingLocation: data.name }}
                        className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-98 select-none shadow-md ${
                            isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-950 text-white hover:bg-zinc-800'
                        }`}
                    >
                        <span>Start Blueprint</span>
                        <span>🛫</span>
                    </Link>
                </div>

                {/* ── PRACTICAL INTEL ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
                    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900/15 border-zinc-800' : 'bg-white/40 border-zinc-200'} backdrop-blur`}>
                        <h4 className={`text-[8.5px] font-black uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Optimal Season
                        </h4>
                        <p className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                            {data.bestTimeToVisit}
                        </p>
                    </div>
                    
                    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-zinc-900/15 border-zinc-800' : 'bg-white/40 border-zinc-200'} backdrop-blur`}>
                        <h4 className={`text-[8.5px] font-black uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Cultural Intel
                        </h4>
                        <p className={`text-xs leading-relaxed font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {data.culturalTips}
                        </p>
                    </div>
                </div>

                {/* ── GEOGRAPHIC CONTEXT MAP ── */}
                {data?.see?.length > 0 && (
                    <div className="mb-24">
                        <div className={`rounded-[2rem] overflow-hidden border p-2 shadow-2xl ${
                            isDark ? 'border-zinc-800/80 bg-zinc-950/20' : 'border-zinc-200 bg-white/40'
                        } backdrop-blur`}>
                            <div className="h-[250px] md:h-[400px] w-full rounded-2xl overflow-hidden">
                                <MapComponent 
                                    locations={data.see.map(item => ({ name: item.name, activity: item.content, time: 'sight' }))} 
                                    destinationName={data.name} 
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── CURATED CATEGORIES ── */}
                <div>
                    {renderListings(data.see, "Sights & Landmarks")}
                    {renderListings(data.do, "Curated Activities")}
                    {renderListings(data.eat, "Gastronomy & Dining")}
                </div>
            </div>
        </div>
    );
};

export default DestinationInfo;
