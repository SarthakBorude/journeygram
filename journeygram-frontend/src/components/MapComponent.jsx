import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon not appearing in React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Helper component to auto-resize and center the map based on markers or active location
const ChangeView = ({ markers, activeMarker, fallbackCenter }) => {
    const map = useMap();
    useEffect(() => {
        if (activeMarker) {
            map.setView([activeMarker.lat, activeMarker.lon], 15, {
                animate: true,
                duration: 1
            });
        } else if (markers && markers.length > 0) {
            const group = new L.featureGroup(
                markers.map(m => L.marker([m.lat, m.lon]))
            );
            map.fitBounds(group.getBounds().pad(0.1));
        } else if (fallbackCenter) {
            map.setView(fallbackCenter, 11, {
                animate: true,
                duration: 1
            });
        }
    }, [markers, activeMarker, fallbackCenter, map]);
    return null;
};

// Custom icons
const defaultIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const activeIcon = new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div class="marker-active-pulse"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const MapComponent = ({ locations, destinationName, activeLocationName }) => {
    const [discoveredMarkers, setDiscoveredMarkers] = useState([]);
    const [fallbackCenter, setFallbackCenter] = useState([20.5937, 78.9629]);

    // 1. Initialize with markers that already have coordinates from backend
    useEffect(() => {
        const initial = locations.filter(loc => loc.lat && loc.lon);
        setDiscoveredMarkers(initial);
    }, [locations]);

    // 2. Live Discovery: If activeLocation appears but has no coordinates, find them!
    useEffect(() => {
        if (!activeLocationName) return;

        // Check if we already have it
        const exists = discoveredMarkers.find(m => m.name === activeLocationName);
        if (exists) return;

        // If not, find it in the original locations list
        const locInfo = locations.find(l => l.name === activeLocationName);
        if (!locInfo) return;

        // If it's missing coordinates, fetch them now (Live Fallback)
        const fetchCoordinates = async () => {
            try {
                const query = `${activeLocationName}, ${destinationName}`;
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                    { headers: { 'User-Agent': 'Journeygram/1.0' } }
                );
                const data = await response.json();
                if (data && data.length > 0) {
                    const newMarker = {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                        name: activeLocationName,
                        activity: locInfo.activity,
                        time: locInfo.time
                    };
                    setDiscoveredMarkers(prev => [...prev, newMarker]);
                }
            } catch (err) {
                console.error("Live discovery failed", err);
            }
        };

        fetchCoordinates();
    }, [activeLocationName, locations, destinationName]);

    // 3. Destination Fallback
    useEffect(() => {
        if (discoveredMarkers.length === 0 && destinationName) {
            const fetchFallback = async () => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationName)}&limit=1`,
                        { headers: { 'User-Agent': 'Journeygram/1.0' } }
                    );
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setFallbackCenter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                    }
                } catch (err) {
                    console.error("Fallback geocoding failed", err);
                }
            };
            fetchFallback();
        }
    }, [discoveredMarkers.length, destinationName]);

    const activeMarker = discoveredMarkers.find(m => m.name === activeLocationName);
    
    const mapCenter = activeMarker 
        ? [activeMarker.lat, activeMarker.lon] 
        : (discoveredMarkers.length > 0 ? [discoveredMarkers[0].lat, discoveredMarkers[0].lon] : fallbackCenter);

    return (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 h-full w-full relative z-0">
            <MapContainer
                center={mapCenter}
                zoom={discoveredMarkers.length > 0 ? 14 : 11}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {discoveredMarkers.map((marker, idx) => (
                    <Marker 
                        key={`${marker.name}-${idx}`} 
                        position={[marker.lat, marker.lon]}
                        icon={marker.name === activeLocationName ? activeIcon : defaultIcon}
                    >
                        <Popup>
                            <div className="p-2 min-w-[150px]">
                                <p className="font-bold text-blue-600 text-sm mb-1">{marker.name}</p>
                                {marker.activity && (
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">{marker.time}</span> 
                                        {marker.activity}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
                
                <ChangeView markers={discoveredMarkers} activeMarker={activeMarker} fallbackCenter={fallbackCenter} />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
