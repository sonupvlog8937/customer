import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNearbyMarkets, fetchMarkets, saveCurrentLocation, savePreferredMarket } from "../../store/goMarketSlice";
import CircularProgress from "@mui/material/CircularProgress";
import toast from "react-hot-toast";

const SelectLocation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  
  const isLogin = useSelector((s) => s.app.isLogin);
  const { nearbyMarkets, markets, loading } = useSelector((s) => s.goMarket);
  
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const [savingMarket, setSavingMarket] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
      return;
    }
    
    // Fetch all markets as fallback
    dispatch(fetchMarkets({ search: "", page: 1 }));
  }, [isLogin, navigate, dispatch]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location not supported by your browser");
      return;
    }
    
    setGeoLoading(true);
    setGeoError(false);
    
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        const coordsToSave = { lat, lng };
        const address = `Current location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setUserCoords(coordsToSave);

        try {
          await dispatch(saveCurrentLocation({ location: coordsToSave, address })).unwrap();
          const result = await dispatch(fetchNearbyMarkets({ latitude: lat, longitude: lng })).unwrap();
          const nearestMarket = result?.data?.[0];
          if (!nearestMarket) {
            toast.error("No nearby markets found. Your location has been saved.");
            setGeoLoading(false);
            return;
          }
          await handleSelectMarket(nearestMarket, coordsToSave);
        } catch (error) {
          console.error("Error saving location or finding nearby markets:", error);
          toast.error(error?.message || "Failed to find a nearby market");
          setGeoLoading(false);
          setGeoError(true);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Location access denied. Showing all markets.");
        setGeoLoading(false);
        setGeoError(true);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSelectMarket = async (market, selectedCoords = userCoords) => {
    setSavingMarket(market._id);
    
    const location = selectedCoords
      ? { lat: selectedCoords.lat, lng: selectedCoords.lng }
      : undefined;
    
    const address = selectedCoords
      ? `Current location: ${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`
      : "";

    try {
      await dispatch(savePreferredMarket({
      marketId: market._id, 
      location, 
      address,
      forceLocationUpdate: !!selectedCoords,
      })).unwrap();
      toast.success(`Nearest market selected: ${market.name}`);
      const requested = new URLSearchParams(routeLocation.search).get("redirect") || "/";
      const destination = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/";
      navigate(selectedCoords && destination === "/"
        ? `/go-market/market/${market._id}`
        : destination, { replace: true });
    } catch (error) {
      console.error("Error saving preferred market:", error);
      toast.error(error?.message || "Failed to save market preference");
      setSavingMarket(null);
    }
  };

  const allMarkets = nearbyMarkets.length > 0 ? nearbyMarkets : markets;

  return (
    <div className="sl-root">
      <style>{styles}</style>
      
      <div className="sl-container">
        <div className="sl-card">
          {/* Header */}
          <div className="sl-header">
            <div className="sl-icon">📍</div>
            <h1 className="sl-title">Select Your Location</h1>
            <p className="sl-subtitle">
              Choose your nearest market for fast delivery
            </p>
          </div>

          {/* Location Button */}
          <button 
            type="button" 
            className="sl-location-btn"
            onClick={handleUseCurrentLocation}
            disabled={geoLoading}
          >
            {geoLoading ? (
              <>
                <CircularProgress size={18} color="inherit" />
                <span>Detecting location...</span>
              </>
            ) : (
              <>
                <span className="sl-btn-icon">📍</span>
                <span>Use Current Location</span>
              </>
            )}
          </button>

          {/* Markets List */}
          <div className="sl-markets">
            {loading && allMarkets.length === 0 ? (
              <div className="sl-loading">
                <CircularProgress size={32} />
                <p>Loading markets...</p>
              </div>
            ) : allMarkets.length === 0 ? (
              <div className="sl-empty">
                <span className="sl-empty-icon">🏪</span>
                <p>No markets available at the moment</p>
              </div>
            ) : (
              <>
                {nearbyMarkets.length > 0 && (
                  <div className="sl-section-label">
                    📍 Nearby Markets
                  </div>
                )}
                
                {allMarkets.map((market) => (
                  <button
                    key={market._id}
                    type="button"
                    className="sl-market-card"
                    onClick={() => handleSelectMarket(market)}
                    disabled={savingMarket === market._id}
                  >
                    <div className="sl-market-info">
                      <div className="sl-market-name">{market.name}</div>
                      <div className="sl-market-details">
                        {market.city && <span>{market.city}</span>}
                        {market.pincode && <span>• {market.pincode}</span>}
                        {market.distanceKm !== undefined && (
                          <span className="sl-distance">• {market.distanceKm.toFixed(1)} km away</span>
                        )}
                      </div>
                    </div>
                    
                    {savingMarket === market._id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <span className="sl-arrow">→</span>
                    )}
                  </button>
                ))}
                
                {nearbyMarkets.length > 0 && markets.length > nearbyMarkets.length && (
                  <div className="sl-section-label" style={{ marginTop: 24 }}>
                    🏪 All Markets
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  
  .sl-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    font-family: 'DM Sans', system-ui, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }
  
  .sl-container {
    width: 100%;
    max-width: 560px;
  }
  
  .sl-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow: 
      0 0 0 1px rgba(0,0,0,0.05),
      0 4px 6px rgba(0,0,0,0.04),
      0 20px 40px rgba(0,0,0,0.08);
    animation: slideIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0; 
      transform: translateY(24px) scale(0.98); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  .sl-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .sl-icon {
    font-size: 48px;
    margin-bottom: 1rem;
    animation: bounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
  }
  
  @keyframes bounce {
    from { 
      opacity: 0; 
      transform: scale(0.5) translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  .sl-title {
    font-size: 1.75rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.03em;
    margin: 0 0 0.5rem;
  }
  
  .sl-subtitle {
    font-size: 0.9375rem;
    color: #64748b;
    margin: 0;
  }
  
  .sl-location-btn {
    width: 100%;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #FF6B00 0%, #FF9500 100%);
    color: #fff;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 700;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(255,107,0,0.4);
    margin-bottom: 1.5rem;
  }
  
  .sl-location-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255,107,0,0.45);
  }
  
  .sl-location-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  .sl-btn-icon {
    font-size: 20px;
  }
  
  .sl-section-label {
    font-size: 0.75rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
  }
  
  .sl-markets {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 4px;
  }
  
  .sl-markets::-webkit-scrollbar {
    width: 6px;
  }
  
  .sl-markets::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  .sl-markets::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .sl-markets::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  .sl-market-card {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: #fff;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 10px;
    font-family: inherit;
    text-align: left;
  }
  
  .sl-market-card:hover:not(:disabled) {
    border-color: #FF6B00;
    box-shadow: 0 8px 20px rgba(255,107,0,0.15);
    transform: translateX(4px);
  }
  
  .sl-market-card:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .sl-market-info {
    flex: 1;
  }
  
  .sl-market-name {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }
  
  .sl-market-details {
    font-size: 0.8125rem;
    color: #64748b;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .sl-distance {
    color: #FF6B00;
    font-weight: 600;
  }
  
  .sl-arrow {
    font-size: 1.25rem;
    color: #cbd5e1;
    transition: transform 0.2s, color 0.2s;
  }
  
  .sl-market-card:hover:not(:disabled) .sl-arrow {
    color: #FF6B00;
    transform: translateX(4px);
  }
  
  .sl-loading,
  .sl-empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #94a3b8;
  }
  
  .sl-loading p,
  .sl-empty p {
    margin-top: 1rem;
    font-size: 0.9375rem;
  }
  
  .sl-empty-icon {
    font-size: 56px;
    display: block;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  @media (max-width: 640px) {
    .sl-card {
      padding: 2rem 1.5rem;
      border-radius: 20px;
    }
    
    .sl-title {
      font-size: 1.5rem;
    }
    
    .sl-markets {
      max-height: 350px;
    }
  }
`;

export default SelectLocation;
