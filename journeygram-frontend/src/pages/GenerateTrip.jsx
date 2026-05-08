import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const TRAVEL_STYLES = ["Backpacker", "Budget", "Moderate", "Luxury"];
const INTEREST_OPTIONS = ["Culture", "Food", "Adventure", "Nature", "Shopping", "Nightlife", "History", "Photography"];

const GenerateTrip = () => {
    const [destination, setDestination] = useState("");
    const [days, setDays] = useState("");
    const [budget, setBudget] = useState("");
    const [travelStyle, setTravelStyle] = useState("");
    const [interests, setInterests] = useState([]);
    const [travelers, setTravelers] = useState("");
    const [notes, setNotes] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const toggleInterest = (interest) => {
        setInterests((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handleGenerate = async () => {
        if (!destination || !days || !budget) {
            setError("Please fill in destination, duration, and budget.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const response = await axiosInstance.post("/api/trips/generate", {
                destination,
                durationDays: parseInt(days),
                budget: parseFloat(budget),
                travelStyle,
                interests,
                travelers: travelers ? parseInt(travelers) : null,
                notes,
                isPublic,
            });

            const tripData = response.data;
            let parsedDays = [];
            try {
                const parsed = JSON.parse(tripData.itinerary);
                parsedDays = parsed.days || [];
            } catch {
                // If parsing fails, we still show the trip but without day breakdown
                console.error("Failed to parse itinerary JSON");
            }

            setTrip({ ...tripData, parsedDays });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to generate trip. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTrip(null);
        setDestination("");
        setDays("");
        setBudget("");
        setTravelStyle("");
        setInterests([]);
        setTravelers("");
        setNotes("");
        setIsPublic(false);
        setError("");
    };

    // ─── If trip is generated, show the result ───────────────
    if (trip) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-4xl mx-auto">

                    {/* Trip Header */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 mb-1">{trip.destination}</h1>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <span>{trip.durationDays} days</span>
                                    <span>•</span>
                                    <span>₹{trip.budget} budget</span>
                                    <span>•</span>
                                    <span className={trip.publicTrip ? 'text-green-600' : 'text-gray-400'}>
                                        {trip.publicTrip ? 'Public' : 'Private'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    to="/my-trips"
                                    className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    View in My Trips
                                </Link>
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Generate Another
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Itinerary — Unified Section */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-900 px-6 py-4">
                            <h2 className="text-lg font-bold text-white">Day-by-Day Itinerary</h2>
                        </div>

                        {trip.parsedDays.length === 0 ? (
                            <div className="p-6 text-gray-500 text-center">
                                Could not parse itinerary. Raw data saved to your trips.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {trip.parsedDays.map((day) => (
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
                        <p className="text-xs text-gray-400 mt-2">Saved to your trips dashboard.</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Generation Form ─────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Generate a Trip</h1>
                    <p className="text-gray-500">Fill in the details and let AI craft your perfect itinerary.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 space-y-6">

                    {/* Row 1: Destination + Days + Budget */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                placeholder="e.g. Goa, Paris"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days) *</label>
                            <input
                                type="number"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                placeholder="e.g. 5"
                                min="1"
                                max="30"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (INR) *</label>
                            <input
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="e.g. 25000"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Row 2: Travel Style + Travelers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Travel Style</label>
                            <select
                                value={travelStyle}
                                onChange={(e) => setTravelStyle(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Select style...</option>
                                {TRAVEL_STYLES.map((style) => (
                                    <option key={style} value={style}>{style}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Travelers</label>
                            <input
                                type="number"
                                value={travelers}
                                onChange={(e) => setTravelers(e.target.value)}
                                placeholder="e.g. 2"
                                min="1"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Interests */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                        <div className="flex flex-wrap gap-2">
                            {INTEREST_OPTIONS.map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                        interests.includes(interest)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                                    }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Special Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Vegetarian food only, traveling with kids, wheelchair accessible..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Public/Private Toggle */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${isPublic ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </button>
                        <span className="text-sm text-gray-600">
                            {isPublic ? 'Public — visible on Explore feed' : 'Private — only you can see this'}
                        </span>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Generating Itinerary...
                            </>
                        ) : (
                            "Generate Itinerary"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GenerateTrip;
