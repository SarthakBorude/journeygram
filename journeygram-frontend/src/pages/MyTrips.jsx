import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const MyTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTrips = async () => {
        try {
            const response = await axiosInstance.get("/api/trips/my");
            setTrips(response.data);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
    }, []);

    const handleToggleVisibility = async (tripId) => {
        try {
            const response = await axiosInstance.patch(`/api/trips/${tripId}/visibility`);
            // Update the trip in local state
            setTrips((prev) =>
                prev.map((t) => (t.id === tripId ? response.data : t))
            );
        } catch (err) {
            console.error("Failed to toggle visibility", err);
        }
    };

    const handleDelete = async (tripId) => {
        const confirmed = window.confirm("Are you sure you want to delete this trip? This cannot be undone.");
        if (!confirmed) return;

        try {
            await axiosInstance.delete(`/api/trips/${tripId}`);
            setTrips((prev) => prev.filter((t) => t.id !== tripId));
        } catch (err) {
            console.error("Failed to delete trip", err);
        }
    };

    const handleCopyShareLink = (shareToken) => {
        const url = `${window.location.origin}/share/${shareToken}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("Share link copied to clipboard!");
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
                        <p className="text-gray-500 text-sm mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} saved</p>
                    </div>
                    <Link
                        to="/generate"
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        + New Trip
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : trips.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-4xl mb-4">🎒</p>
                        <p className="text-gray-500 text-lg mb-4">No trips yet.</p>
                        <Link
                            to="/generate"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Create your first trip →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {trips.map((trip) => (
                            <div
                                key={trip.id}
                                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {/* Trip Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">{trip.destination}</h3>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                trip.publicTrip
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {trip.publicTrip ? 'Public' : 'Private'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{trip.durationDays} days</span>
                                            <span>₹{trip.budget}</span>
                                            {trip.createdAt && (
                                                <span>
                                                    {new Date(trip.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Link
                                            to={`/trip/${trip.id}`}
                                            className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={() => handleToggleVisibility(trip.id)}
                                            className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            {trip.publicTrip ? 'Make Private' : 'Make Public'}
                                        </button>
                                        {trip.publicTrip && trip.shareToken && (
                                            <button
                                                onClick={() => handleCopyShareLink(trip.shareToken)}
                                                className="px-3 py-2 text-sm font-medium text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                                            >
                                                Copy Link
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(trip.id)}
                                            className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            Delete
                                        </button>
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

export default MyTrips;
