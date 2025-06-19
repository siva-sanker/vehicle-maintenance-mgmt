import React, { useState, useEffect } from 'react';
import { MapPin, Car, Navigation, Clock } from 'lucide-react';
import { vehicleAPI, Vehicle } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/VehicleLocation.css';

interface VehicleLocationProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

interface LocationHistoryEntry {
  id: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

interface VehicleWithLocation extends Vehicle {
  currentLocation?: Location;
}

const VehicleLocation: React.FC<VehicleLocationProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [vehicles, setVehicles] = useState<VehicleWithLocation[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationHistory, setLocationHistory] = useState<LocationHistoryEntry[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchVehicles();
    getCurrentLocation();
    fetchLocationHistory();
  }, []);

  const fetchVehicles = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await vehicleAPI.getAllVehicles();
      setVehicles(data as VehicleWithLocation[]);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationHistory = async (): Promise<void> => {
    try {
      console.log('Fetching location history...');
      // Load all location history data from the database
      const response = await fetch(`${getBaseURL()}/locationHistory`);
      console.log('Location history response:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Location history data:', data);
        setLocationHistory(data);
      } else {
        console.log('No location history data found or endpoint not available');
        // Add some mock data for testing
        const mockHistory: LocationHistoryEntry[] = [
          {
            id: 'loc_1',
            vehicleId: '1',
            latitude: 12.9716,
            longitude: 77.5946,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            address: 'Bangalore, Karnataka, India'
          },
          {
            id: 'loc_2',
            vehicleId: '1',
            latitude: 12.9720,
            longitude: 77.5950,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            address: 'MG Road, Bangalore, Karnataka, India'
          }
        ];
        setLocationHistory(mockHistory);
      }
    } catch (error) {
      console.error('Error fetching location history:', error);
      // Add some mock data for testing
      const mockHistory: LocationHistoryEntry[] = [
        {
          id: 'loc_1',
          vehicleId: '1',
          latitude: 12.9716,
          longitude: 77.5946,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          address: 'Bangalore, Karnataka, India'
        },
        {
          id: 'loc_2',
          vehicleId: '1',
          latitude: 12.9720,
          longitude: 77.5950,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          address: 'MG Road, Bangalore, Karnataka, India'
        }
      ];
      setLocationHistory(mockHistory);
    }
  };

  // Helper function to get base URL (copied from api.js)
  const getBaseURL = (): string => {
    if (import.meta.env.DEV) {
      return 'http://192.168.50.154:4000';
    } else {
      return import.meta.env.VITE_API_URL || 'http://localhost:4000';
    }
  };

  const getCurrentLocation = (): void => {
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

  const updateVehicleLocation = async (vehicleId: string, location: { latitude: number; longitude: number }): Promise<void> => {
    try {
      const locationData: Location = {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
        address: await getAddressFromCoordinates(location.latitude, location.longitude)
      };

      // Update vehicle with new location using vehicleAPI
      await vehicleAPI.patchVehicle(vehicleId, { currentLocation: locationData });

      // Add to location history
      const newHistoryEntry: LocationHistoryEntry = {
        id: `loc_${Date.now()}`,
        vehicleId,
        ...locationData
      };

      // Add to database
      try {
        await fetch(`${getBaseURL()}/locationHistory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newHistoryEntry)
        });
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

  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
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

  const simulateVehicleMovement = (vehicle: VehicleWithLocation): void => {
    // Simulate vehicle movement by adding small random changes to coordinates
    const currentLat = vehicle.currentLocation?.latitude || 12.9716; // Default to Bangalore
    const currentLng = vehicle.currentLocation?.longitude || 77.5946;

    const newLat = currentLat + (Math.random() - 0.5) * 0.01; // Small random change
    const newLng = currentLng + (Math.random() - 0.5) * 0.01;

    updateVehicleLocation(vehicle.id, { latitude: newLat, longitude: newLng });
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getDistanceFromCurrent = (vehicleLocation: Location): string => {
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
      <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="vehicle-location-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicle locations...</p>
        </div>
        <Footer />
      </div>
      </>
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
            <div className="search-container3">
              {/* <Search size={16} className="search-icon" /> */}
              <i className="search-icon fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="vehicle-list">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`vehicle-item ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="vehicle-info">
                  <h3 className="vehicle-name text-capitalize">{vehicle.make} {vehicle.model}</h3>
                  <p className="vehicle-registration text-uppercase">{vehicle.registrationNumber}</p>
                  <p className="vehicle-owner">{vehicle.owner}</p>
                </div>
                <div className="vehicle-location-info">
                  {vehicle.currentLocation ? (
                    <>
                      <p className="location-status online">Online</p>
                      <p className="location-distance">
                        {getDistanceFromCurrent(vehicle.currentLocation)}
                      </p>
                      <p className="location-time">
                        {formatTimestamp(vehicle.currentLocation.timestamp)}
                      </p>
                    </>
                  ) : (
                    <p className="location-status offline">Offline</p>
                  )}
                </div>
                <button
                  className="update-location-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    simulateVehicleMovement(vehicle);
                  }}
                >
                  <Navigation size={14} />
                  Update
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Location Details Section */}
        <div className="location-details-section">
          {selectedVehicle ? (
            <div className="location-details">
              <div className="details-header">
                <h2 className="details-title text-capitalize">
                  <MapPin size={20} />
                  {selectedVehicle.make} {selectedVehicle.model}
                </h2>
                <p className="details-subtitle text-uppercase">{selectedVehicle.registrationNumber}</p>
              </div>

              {selectedVehicle.currentLocation ? (
                <div className="location-info">
                  <div className="info-item">
                    <span className="info-label">Status:</span>
                    <span className="info-value online">Online</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Distance:</span>
                    <span className="info-value">{getDistanceFromCurrent(selectedVehicle.currentLocation)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Updated:</span>
                    <span className="info-value">{formatTimestamp(selectedVehicle.currentLocation.timestamp)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Address:</span>
                    <span className="info-value">{selectedVehicle.currentLocation.address || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Coordinates:</span>
                    <span className="info-value">
                      {selectedVehicle.currentLocation.latitude.toFixed(6)}, {selectedVehicle.currentLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="no-location">
                  <p>No location data available for this vehicle.</p>
                  <button
                    className="btn-primary"
                    onClick={() => simulateVehicleMovement(selectedVehicle)}
                  >
                    <Navigation size={16} />
                    Update Location
                  </button>
                </div>
              )}

              {/* Location History */}
              <div className="location-history">
                <h3 className="history-title">
                  <Clock size={16} />
                  Location History
                </h3>
                <div className="history-list">
                  {(() => {
                    const vehicleHistory = locationHistory.filter(entry => entry.vehicleId === selectedVehicle.id);
                    console.log('Location history for vehicle:', selectedVehicle.id, vehicleHistory);
                    
                    if (vehicleHistory.length === 0) {
                      return (
                        <div className="history-item">
                          <div className="history-time">No history available</div>
                          <div className="history-location">No location history found for this vehicle</div>
                        </div>
                      );
                    }
                    
                    return vehicleHistory
                      .slice(0, 10)
                      .map((entry) => (
                        <div key={entry.id} className="history-item">
                          <div className="history-time">{formatTimestamp(entry.timestamp)}</div>
                          <div className="history-location">
                            {entry.address || `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`}
                          </div>
                        </div>
                      ));
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <MapPin size={48} />
              <h3>Select a Vehicle</h3>
              <p>Choose a vehicle from the list to view its location details and history.</p>
            </div>
          )}
        </div>
      </div>

    </div>
      <Footer />
    </>
  );
};

export default VehicleLocation; 