import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import MapComponent from "../components/MapComponent";

const DestinationInfo = () => {
    const { name } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
                setError(`Could not fetch travel guide for ${name}. Please try again later.`);
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
            <div className="min-h-screen bg-[#F9F7F2] flex flex-col justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F292F] mb-6"></div>
                <p className="text-[#0F292F]/60 font-black journal-font text-2xl animate-pulse">Drafting guide for {name}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F9F7F2] flex flex-col justify-center items-center p-8">
                <div className="notebook-page postcard-border p-16 rounded-xl text-center max-w-2xl mx-auto">
                    <div className="text-6xl mb-8">⚠️</div>
                    <p className="text-[#C0392B] font-black text-xl journal-font mb-8">{error}</p>
                    <Link to="/" className="btn-primary">
                        ← RETURN HOME
                    </Link>
                </div>
            </div>
        );
    }

    const renderListings = (listings, title, emoji) => {
        if (!listings || listings.length === 0) return null;

        return (
            <div className="mb-24">
                <div className="flex items-center gap-6 mb-12">
                    <h2 className="text-4xl font-black text-[#0F292F] journal-font">{title}</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-[#0F292F]/10 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {listings.map((item, idx) => (
                        <div key={idx} className="notebook-page p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                            <div className="washi-tape -top-2 left-6 bg-[#A3B18A]/30"></div>
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="font-black text-[#0F292F] text-2xl journal-font leading-tight group-hover:text-[#E67E22] transition-colors">{item.name}</h3>
                                {item.price && (
                                    <div className="stamp-effect border-[#0F292F]/10 text-[#0F292F]/40 scale-50 origin-top-right">
                                        <span className="text-[8px]">{item.price}</span>
                                    </div>
                                )}
                            </div>
                            {item.address && (
                                <p className="text-[10px] font-black text-[#0F292F]/30 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <span>📍</span> {item.address}
                                </p>
                            )}
                            <p className="text-lg text-[#0F292F]/60 leading-relaxed italic script-font">
                                "{item.content || item.description}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F9F7F2] pb-32 overflow-x-hidden">
            {/* Hero Journal Section */}
            <div className="relative pt-12 md:pt-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <Link to="/explore" className="text-[11px] font-black text-[#0F292F]/40 hover:text-[#0F292F] uppercase tracking-[0.3em] mb-12 inline-flex items-center gap-3 transition-all hover:-translate-x-2">
                        ← Explorer's Feed
                    </Link>
                    
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-16 mb-24">
                        <div className="max-w-4xl relative">
                            <span className="script-font text-[#E67E22] text-4xl block mb-4">Official Guide to:</span>
                            <h1 className="text-7xl md:text-9xl font-black text-[#0F292F] journal-font tracking-tighter leading-[0.8] mb-12">
                                {data.name}
                            </h1>
                            <div className="notebook-page postcard-border p-10 md:p-16 rounded-xl relative overflow-hidden">
                                <div className="washi-tape -top-2 left-10"></div>
                                <div className="washi-tape -top-2 right-10 bg-[#E67E22]"></div>
                                <p className="text-2xl md:text-3xl text-[#0F292F]/70 leading-relaxed font-medium italic script-font">
                                    {data.summary}
                                </p>
                            </div>
                        </div>

                        <div className="lg:sticky lg:top-32">
                            <div className="stamp-effect border-[#C0392B] text-[#C0392B] mb-8 rotate-3">
                                <span className="text-[10px] tracking-[0.4em]">VERIFIED</span>
                                <span className="text-xl">DESTINATION</span>
                            </div>
                            <Link
                                to="/canvas/new"
                                state={{ startingLocation: data.name }}
                                className="btn-primary w-full md:w-auto shadow-2xl"
                            >
                                ✨ CRAFT VOYAGE
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Practical Intel Bar */}
            <div className="max-w-7xl mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="notebook-page p-10 rounded-2xl flex items-center gap-8 border-l-8 border-[#E67E22]">
                        <div className="text-5xl">📅</div>
                        <div>
                            <h4 className="text-[11px] font-black text-[#0F292F]/30 uppercase tracking-[0.3em] mb-2">Prime Window</h4>
                            <p className="text-2xl font-black text-[#0F292F] journal-font">{data.bestTimeToVisit}</p>
                        </div>
                    </div>
                    <div className="notebook-page p-10 rounded-2xl flex items-center gap-8 border-l-8 border-[#0F292F]">
                        <div className="text-5xl">💡</div>
                        <div>
                            <h4 className="text-[11px] font-black text-[#0F292F]/30 uppercase tracking-[0.3em] mb-2">Explorer's Intel</h4>
                            <p className="text-xl font-black text-[#0F292F]/60 journal-font line-clamp-2" title={data.culturalTips}>
                                {data.culturalTips}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Blueprint Section */}
            {data?.see?.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 mb-32">
                    <div className="flex items-center gap-6 mb-12">
                        <h2 className="text-4xl font-black text-[#0F292F] journal-font">The Voyage Map</h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#0F292F]/10 to-transparent"></div>
                    </div>
                    <div className="h-[500px] rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                        <MapComponent 
                            locations={data.see.map(item => ({ name: item.name, activity: item.content, time: 'sight' }))} 
                            destinationName={data.name} 
                        />
                    </div>
                </div>
            )}

            {/* Curated Logs Section */}
            <div className="max-w-7xl mx-auto px-6">
                {renderListings(data.see, "Must See Sights", "🏛️")}
                {renderListings(data.do, "Top Experiences", "🎯")}
                {renderListings(data.eat, "Local Flavors", "🍲")}
            </div>
        </div>
    );
};

export default DestinationInfo;
