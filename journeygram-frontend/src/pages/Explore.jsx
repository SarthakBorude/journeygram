import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const Explore = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicTrips = async () => {
            try {
                const response = await axiosInstance.get("/api/trips/explore");
                setTrips(response.data);
            } catch (err) {
                console.error("Failed to fetch public trips", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPublicTrips();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Explore</h1>
                    <p className="text-gray-500 text-sm mt-1">Discover itineraries shared by the community</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : trips.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-4xl mb-4">🌍</p>
                        <p className="text-gray-500 text-lg mb-2">No public trips yet.</p>
                        <p className="text-gray-400 text-sm">Be the first to share an itinerary!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trips.map((trip) => (
                            <Link
                                key={trip.id}
                                to={`/share/${trip.shareToken}`}
                                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all block"
                            >
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{trip.destination}</h3>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                                    <span>{trip.durationDays} days</span>
                                    <span>•</span>
                                    <span>₹{trip.budget}</span>
                                </div>
                                {trip.user && (
                                    <p className="text-xs text-gray-400 mb-3">by {trip.user.name || trip.user.email}</p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span>❤️ {trip.likesCount || 0} likes</span>
                                    <span>📋 {trip.clonesCount || 0} clones</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Explore;