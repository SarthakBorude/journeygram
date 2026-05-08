import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const SharedTrip = () => {
    const { token: shareToken } = useParams();
    const { token: authToken } = useAuth();
    const [trip, setTrip] = useState(null);
    const [parsedDays, setParsedDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await axiosInstance.get(`/api/trips/share/${shareToken}`);
                const tripData = response.data;
                setTrip(tripData);

                try {
                    const parsed = JSON.parse(tripData.itinerary);
                    setParsedDays(parsed.days || []);
                } catch {
                    console.error("Failed to parse itinerary JSON");
                }
            } catch (err) {
                console.error(err);
                setError("This trip doesn't exist or is no longer public.");
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [shareToken]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Link to="/login" className="text-blue-600 hover:underline">Go to Journeygram →</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* Brand header for public view */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/" className="text-xl font-bold text-blue-600">Journeygram</Link>
                    {!authToken && (
                        <Link
                            to="/register"
                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Join Journeygram
                        </Link>
                    )}
                </div>

                {/* Trip Header */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-1">{trip.destination}</h1>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{trip.durationDays} days</span>
                        <span>•</span>
                        <span>₹{trip.budget}</span>
                        {trip.user && (
                            <>
                                <span>•</span>
                                <span>by {trip.user.name || trip.user.email}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Itinerary */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-900 px-6 py-4">
                        <h2 className="text-lg font-bold text-white">Day-by-Day Itinerary</h2>
                    </div>

                    {parsedDays.length === 0 ? (
                        <div className="p-6 text-gray-500 text-center">
                            Itinerary data is not available.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {parsedDays.map((day) => (
                                <div key={day.day} className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-blue-600 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center">
                                            {day.day}
                                        </span>
                                        <h3 className="font-bold text-gray-800">Day {day.day}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        {['morning', 'afternoon', 'evening'].map((time) => (
                                            <div key={time} className="bg-gray-50 rounded-lg p-4">
                                                <p className="text-xs font-bold text-blue-600 uppercase mb-2">{time}</p>
                                                <p className="text-sm text-gray-800 font-medium mb-1">
                                                    {day[time]?.activity || 'N/A'}
                                                </p>
                                                {day[time]?.location && (
                                                    <p className="text-xs text-gray-400 mb-2">📍 {day[time].location}</p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    Est. cost: <span className="font-bold text-gray-700">₹{day[time]?.cost || 0}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {day.tip && (
                                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-4 py-2">
                                            <p className="text-xs text-yellow-800">
                                                <span className="font-bold">💡 Tip:</span> {day.tip}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Budget */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Estimated Budget</p>
                    <p className="text-3xl font-bold text-gray-800">₹{trip.budget}</p>
                </div>

                {/* CTA for non-logged-in users */}
                {!authToken && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-6 text-center">
                        <p className="text-blue-800 font-medium mb-2">Want to create your own AI-powered itinerary?</p>
                        <Link
                            to="/register"
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                            Sign up for free →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedTrip;
