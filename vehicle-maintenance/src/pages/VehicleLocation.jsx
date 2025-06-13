import React, { useState, useEffect } from 'react';
import { vehicleAPI, locationAPI } from '../services/api';
import { MapPin, Navigation, Clock, Car, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import '../styles/VehicleLocation.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VehicleLocation = ({ sidebarCollapsed, toggleSidebar }) => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationHistory, setLocationHistory] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchVehicles();
        getCurrentLocation();
        fetchLocationHistory();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const data = await vehicleAPI.getAllVehicles();
            setVehicles(data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const fetchLocationHistory = async () => {
        try {
            // Load all location history data from the database
            const response = await fetch(`${getBaseURL()}/locationHistory`);
            if (response.ok) {
                const data = await response.json();
                setLocationHistory(data);
            } else {
                console.log('No location history data found or endpoint not available');
                setLocationHistory([]);
            }
        } catch (error) {
            console.error('Error fetching location history:', error);
            // Don't show error toast as this is optional
            setLocationHistory([]);
        }
    };

    // Helper function to get base URL (copied from api.js)
    const getBaseURL = () => {
        if (import.meta.env.DEV) {
            return 'http://192.168.50.154:4000';
        } else {
            return import.meta.env.VITE_API_URL || 'http://localhost:4000';
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    });
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    toast.warning('Unable to get current location. Please enable location services.');
                }
            );
        } else {
            toast.warning('Geolocation is not supported by this browser.');
        }
    };

    const updateVehicleLocation = async (vehicleId, location) => {
        try {
            const locationData = {
                latitude: location.latitude,
                longitude: location.longitude,
                timestamp: new Date().toISOString(),
                address: await getAddressFromCoordinates(location.latitude, location.longitude)
            };

            // Update vehicle with new location using locationAPI
            await locationAPI.updateVehicleLocation(vehicleId, locationData);

            // Add to location history
            const newHistoryEntry = {
                id: `loc_${Date.now()}`,
                vehicleId,
                ...locationData
            };

            // Add to database
            try {
                await locationAPI.addLocationHistory(newHistoryEntry);
            } catch (error) {
                console.warn('Could not save to location history:', error);
            }

            // Update local state
            setLocationHistory(prev => [newHistoryEntry, ...prev].slice(0, 50)); // Keep last 50 entries

            toast.success('Vehicle location updated successfully');
            fetchVehicles(); // Refresh vehicle data
        } catch (error) {
            console.error('Error updating vehicle location:', error);
            toast.error('Failed to update vehicle location');
        }
    };

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            return data.display_name || 'Unknown location';
        } catch (error) {
            console.error('Error getting address:', error);
            return 'Unknown location';
        }
    };

    const simulateVehicleMovement = (vehicle) => {
        // Simulate vehicle movement by adding small random changes to coordinates
        const currentLat = vehicle.currentLocation?.latitude || 12.9716; // Default to Bangalore
        const currentLng = vehicle.currentLocation?.longitude || 77.5946;

        const newLat = currentLat + (Math.random() - 0.5) * 0.01; // Small random change
        const newLng = currentLng + (Math.random() - 0.5) * 0.01;

        updateVehicleLocation(vehicle.id, { latitude: newLat, longitude: newLng });
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const getDistanceFromCurrent = (vehicleLocation) => {
        if (!currentLocation || !vehicleLocation) return 'Unknown';

        const R = 6371; // Earth's radius in kilometers
        const dLat = (vehicleLocation.latitude - currentLocation.latitude) * Math.PI / 180;
        const dLng = (vehicleLocation.longitude - currentLocation.longitude) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(currentLocation.latitude * Math.PI / 180) * Math.cos(vehicleLocation.latitude * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(2)}km`;
    };

    // Filter vehicles based on search term
    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
            <div className="vehicle-location-container">
                {/* Header */}
                <div className="vehicle-location-header">
                    <div className="header-content">
                        <h1 className="page-title">
                            <MapPin className="page-icon" size={28} />
                            Vehicle Location Tracking
                        </h1>
                        <p className="page-subtitle">Track and monitor vehicle locations in real-time</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="location-content-grid">
                    {/* Vehicle List Section */}
                    <div className="vehicle-list-section">
                        <div className="vehicle-list-header">
                            <h2 className="vehicle-list-title">
                                <Car size={18} />
                                Vehicles <span className="vehicle-list-count">({filteredVehicles.length})</span>
                            </h2>
                            <div className="vehicle-search-container">
                                <div className="search-input-wrapper">
                                    <Search size={16} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search by registration..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="vehicle-search-input"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="clear-search-btn"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="vehicle-list-content">
                            {filteredVehicles.length > 0 ? (
                                filteredVehicles.map((vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className={`vehicle-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedVehicle(vehicle)}
                                    >
                                        <div className="vehicle-card-header">
                                            <div className="vehicle-info">
                                                <h3 className="vehicle-name text-capitalize">
                                                    {vehicle.make} {vehicle.model}
                                                </h3>
                                                <p className="vehicle-registration text-uppercase">{vehicle.registrationNumber}</p>
                                                {vehicle.currentLocation && (
                                                    <p className="vehicle-last-seen">
                                                        Last: {formatTimestamp(vehicle.currentLocation.timestamp).split(',')[0]}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="vehicle-status">
                                                {vehicle.currentLocation ? (
                                                    <span className="vehicle-status active">
                                                        <MapPin size={10} />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="vehicle-status inactive">
                                                        <MapPin size={10} />
                                                        No Location
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-vehicles-found">
                                    <p>No vehicles found matching "{searchTerm}"</p>
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="clear-search-link"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Details Section */}
                    <div className="location-details-section">
                        {selectedVehicle ? (
                            <>
                                <div className="location-details-header">
                                    <h2 className="location-details-title">
                                        {selectedVehicle.make} {selectedVehicle.model} - Location
                                    </h2>
                                    <button
                                        onClick={() => simulateVehicleMovement(selectedVehicle)}
                                        className="btn-update-location"
                                    >
                                        <Navigation size={14} />
                                        Update Location
                                    </button>
                                </div>

                                <div className="location-map-container">
                                    {/* Map Placeholder */}
                                    <div className={`map-placeholder ${selectedVehicle.currentLocation ? 'has-location' : ''}`}>
                                        {selectedVehicle.currentLocation ? (
                                            <div className="map-content">
                                                <MapPin size={40} className="map-icon" />
                                                <p className="map-address">
                                                    {selectedVehicle.currentLocation.address}
                                                </p>
                                                <p className="map-coordinates">
                                                    Coordinates: {selectedVehicle.currentLocation.latitude.toFixed(6)}, {selectedVehicle.currentLocation.longitude.toFixed(6)}
                                                </p>
                                                {currentLocation && (
                                                    <p className="map-distance">
                                                        Distance from you: {getDistanceFromCurrent(selectedVehicle.currentLocation)}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="map-no-location">
                                                <MapPin size={40} className="map-no-location-icon" />
                                                <p className="map-no-location-text">No location data available</p>
                                                <button
                                                    onClick={() => updateVehicleLocation(selectedVehicle.id, currentLocation || { latitude: 12.9716, longitude: 77.5946 })}
                                                    className="btn-set-location"
                                                >
                                                    <MapPin size={14} />
                                                    Set Current Location
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Location History */}
                                    <div className="location-history-section">
                                        <h3 className="location-history-header">
                                            <Clock size={16} />
                                            Location History
                                        </h3>
                                        <div className="location-history-list">
                                            {locationHistory && locationHistory.length > 0 ? (
                                                locationHistory
                                                    .filter(entry => entry.vehicleId === selectedVehicle.id)
                                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                                    .slice(0, 10)
                                                    .map((entry) => (
                                                        <div key={entry.id} className="location-history-item">
                                                            <div className="location-history-content">
                                                                <div className="location-history-info">
                                                                    <p className="location-history-address">{entry.address}</p>
                                                                    <p className="location-history-time">
                                                                        {formatTimestamp(entry.timestamp).split(',')[0]}
                                                                    </p>
                                                                </div>
                                                                <div className="location-history-coordinates">
                                                                    {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                            ) : (
                                                <p className="location-history-empty">No location history available</p>
                                            )}
                                            {locationHistory && locationHistory.filter(entry => entry.vehicleId === selectedVehicle.id).length === 0 && (
                                                <p className="location-history-empty">No location history available for this vehicle</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="empty-state">
                                <MapPin size={48} className="empty-state-icon" />
                                <h3 className="empty-state-title">Select a Vehicle</h3>
                                <p className="empty-state-description">
                                    Choose a vehicle from the list to view its location and tracking information
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Location Info */}
                {currentLocation && (
                    <div className="current-location-info">
                        <h3 className="current-location-header">
                            <Navigation size={16} />
                            Your Current Location
                        </h3>
                        <p className="current-location-coordinates">
                            Latitude: {currentLocation.latitude.toFixed(6)}, Longitude: {currentLocation.longitude.toFixed(6)}
                        </p>
                        <p className="current-location-time">
                            Last updated: {formatTimestamp(currentLocation.timestamp)}
                        </p>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default VehicleLocation; 