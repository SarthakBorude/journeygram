import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

const Home = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchTrips();
    }, []);

    const totalTrips = trips.length;
    const publicTrips = trips.filter(t => t.publicTrip).length;
    const privateTrips = totalTrips - publicTrips;
    const recentTrips = trips.slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Welcome Section */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome back{user?.email ? `, ${user.email}` : ''} 👋
                    </h1>
                    <p className="text-gray-500">Here's a snapshot of your travel plans.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <p className="text-sm text-gray-500 mb-1">Total Trips</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {loading ? '—' : totalTrips}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <p className="text-sm text-gray-500 mb-1">Public</p>
                        <p className="text-3xl font-bold text-green-600">
                            {loading ? '—' : publicTrips}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <p className="text-sm text-gray-500 mb-1">Private</p>
                        <p className="text-3xl font-bold text-gray-600">
                            {loading ? '—' : privateTrips}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-blue-600 rounded-xl p-8 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Ready for your next adventure?</h2>
                        <p className="text-blue-200 text-sm">Let AI craft a personalized itinerary for you.</p>
                    </div>
                    <Link
                        to="/generate"
                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
                    >
                        Generate a Trip →
                    </Link>
                </div>

                {/* Recent Trips */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Recent Trips</h2>
                        {totalTrips > 4 && (
                            <Link to="/my-trips" className="text-sm text-blue-600 hover:underline font-medium">
                                View all →
                            </Link>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : recentTrips.length === 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                            <p className="text-gray-400 mb-2">No trips yet.</p>
                            <Link to="/generate" className="text-blue-600 font-medium hover:underline text-sm">
                                Create your first trip →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {recentTrips.map((trip) => (
                                <Link
                                    key={trip.id}
                                    to={`/trip/${trip.id}`}
                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all block"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-base font-bold text-gray-800">{trip.destination}</h3>
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
                                    </div>
                                    {trip.createdAt && (
                                        <p className="text-xs text-gray-400 mt-3">
                                            {new Date(trip.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                        to="/my-trips"
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all flex items-center gap-4"
                    >
                        <span className="text-2xl">🗂️</span>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">My Trips</p>
                            <p className="text-xs text-gray-500">Manage all your saved itineraries</p>
                        </div>
                    </Link>
                    <Link
                        to="/explore"
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all flex items-center gap-4"
                    >
                        <span className="text-2xl">🌍</span>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">Explore</p>
                            <p className="text-xs text-gray-500">Discover trips shared by the community</p>
                        </div>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Home;
