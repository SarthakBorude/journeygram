import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const TripDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [parsedDays, setParsedDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await axiosInstance.get(`/api/trips/${id}`);
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
                setError(err.response?.data?.message || "Failed to load trip.");
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

    const handleToggleVisibility = async () => {
        try {
            const response = await axiosInstance.patch(`/api/trips/${id}/visibility`);
            setTrip(response.data);
        } catch (err) {
            console.error("Failed to toggle visibility", err);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this trip?");
        if (!confirmed) return;

        try {
            await axiosInstance.delete(`/api/trips/${id}`);
            navigate("/my-trips");
        } catch (err) {
            console.error("Failed to delete trip", err);
        }
    };

    const handleCopyShareLink = () => {
        if (!trip?.shareToken) return;
        const url = `${window.location.origin}/share/${trip.shareToken}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("Share link copied to clipboard!");
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Link to="/my-trips" className="text-blue-600 hover:underline">← Back to My Trips</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">

                {/* Back link */}
                <Link to="/my-trips" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
                    ← Back to My Trips
                </Link>

                {/* Trip Header */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">{trip.destination}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>{trip.durationDays} days</span>
                                <span>•</span>
                                <span>₹{trip.budget}</span>
                                <span>•</span>
                                <span className={trip.publicTrip ? 'text-green-600' : 'text-gray-400'}>
                                    {trip.publicTrip ? 'Public' : 'Private'}
                                </span>
                                {trip.createdAt && (
                                    <>
                                        <span>•</span>
                                        <span>{new Date(trip.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={handleToggleVisibility}
                                className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                {trip.publicTrip ? 'Make Private' : 'Make Public'}
                            </button>
                            {trip.publicTrip && trip.shareToken && (
                                <button
                                    onClick={handleCopyShareLink}
                                    className="px-3 py-2 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                                >
                                    Copy Share Link
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Itinerary */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-900 px-6 py-4">
                        <h2 className="text-lg font-bold text-white">Day-by-Day Itinerary</h2>
                    </div>

                    {parsedDays.length === 0 ? (
                        <div className="p-6">
                            <p className="text-gray-500 mb-2">Could not parse itinerary structure. Raw data:</p>
                            <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-wrap overflow-auto max-h-96">
                                {trip.itinerary}
                            </pre>
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

                {/* Budget Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Estimated Budget</p>
                    <p className="text-3xl font-bold text-gray-800">₹{trip.budget}</p>
                </div>
            </div>
        </div>
    );
};

export default TripDetail;
