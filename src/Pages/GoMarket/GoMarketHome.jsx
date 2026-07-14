import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarkets, fetchNearbyMarkets, savePreferredMarket } from "../../store/goMarketSlice";
import { fetchDataFromApi } from "../../utils/api";
import { STYLES, useMyLocation } from "./shared";

const GoMarketHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { markets, nearbyMarkets, loading } = useSelector((s) => s.goMarket);
  const isLogin = useSelector((s) => s.app.isLogin);
  const userData = useSelector((s) => s.app.userData);

  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [collections, setCollections] = useState([]);
  const [showNearby, setShowNearby] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [manualLocation, setManualLocation] = useState({ lat: null, lng: null, address: "" });

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    }
  }, [isLogin, navigate]);

  // Auto-navigate to preferred market if exists (skip if coming from edit)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isFromEdit = params.get("edit") === "true";
    
    if (isLogin && userData?.preferredMarketId && !isFromEdit) {
      console.log("🎯 Auto-navigating to preferred market:", userData.preferredMarketId);
      navigate(`/go-market/market/${userData.preferredMarketId}`);
    }
  }, [isLogin, userData, navigate]);

  useEffect(() => {
    dispatch(fetchMarkets({ search: "" }));
  }, [dispatch]);
  fetchDataFromApi("/api/settings/commerce").then((res) => setCollections((res?.data?.collections || []).filter((c) => c.isActive !== false)));

  const allMarkets = useMemo(() => {
    if (showNearby) return nearbyMarkets;
    const map = new Map([...nearbyMarkets, ...markets].map((m) => [m._id, m]));
    return Array.from(map.values());
  }, [markets, nearbyMarkets, showNearby]);

  // Fuzzy search function - matches even with typos
  const fuzzyMatch = (text, query) => {
    if (!text || !query) return false;
    text = text.toLowerCase();
    query = query.toLowerCase();
    
    // Exact match
    if (text.includes(query)) return true;
    
    // Fuzzy match - allows 1-2 character differences
    let queryIndex = 0;
    let matchCount = 0;
    
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        matchCount++;
        queryIndex++;
      }
    }
    
    // If matched at least 70% of query characters, consider it a match
    return matchCount >= Math.floor(query.length * 0.7);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allMarkets;
    return allMarkets.filter(
      (m) =>
        fuzzyMatch(m.name, q) ||
        fuzzyMatch(m.city, q) ||
        String(m.pincode || "").includes(q),
    );
  }, [allMarkets, search]);

  const onSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    dispatch(fetchMarkets({ search }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setShowSuggestions(true);
    setShowNearby(false);
    setFocusedIndex(-1);
  };

  const handleSuggestionClick = (market) => {
    console.log("🔍 Suggestion clicked:", market.name, market._id);
    setSearch(market.name);
    setShowSuggestions(false);
    // Save preferred market and navigate
    dispatch(savePreferredMarket({ marketId: market._id }));
    openMarket(market._id);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(filtered[focusedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const useLocation = useMyLocation((lat, lng) => {
    console.log("📍 User coordinates detected:", { lat, lng });
    dispatch(fetchNearbyMarkets({ latitude: lat, longitude: lng }))
      .unwrap()
      .then((response) => {
        console.log("📍 API Response from nearby markets:", response);
        console.log("📍 Full response.data:", response?.data);
        if (response?.data && response.data.length > 0) {
          const nearestMarket = response.data[0];
          console.log("🎯 Nearest market found:", nearestMarket.name, "at", nearestMarket.distanceKm, "km");
          // Save preferred market WITH CURRENT LOCATION to user profile
          const locationAddress = `Current Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          dispatch(savePreferredMarket({ 
            marketId: nearestMarket._id, 
            location: { lat, lng }, 
            address: locationAddress 
          }));
          console.log("💾 Saved location to user profile:", locationAddress);
          openMarket(nearestMarket._id);
        } else {
          console.warn("⚠️ No nearby markets found. Response:", response);
          alert("❌ No markets found in your area. Please try searching or check back later.");
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching nearby markets:", error);
        alert("❌ Failed to find nearby markets. Error: " + (error?.message || "Unknown error"));
      });
  });

  const openMarket = (marketId) => {
    if (!marketId) return;
    // Save preferred market before navigating
    dispatch(savePreferredMarket({ marketId, location: userData?.goMarketLocation ? { lat: userData.goMarketLocation.coordinates?.[1], lng: userData.goMarketLocation.coordinates?.[0] } : undefined, address: userData?.goMarketLocation?.address || "" }));
    navigate(`/go-market/market/${marketId}`);
  };

  const handleManualLocationSelect = (lat, lng, address) => {
    console.log("📍 Manual location selected:", { lat, lng, address });
    console.log("📍 Location data types:", { latType: typeof lat, lngType: typeof lng, latValue: lat, lngValue: lng });
    
    setManualLocation({ lat, lng, address });
    setShowLocationPicker(false);
    
    // Ensure lat/lng are proper numbers
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      console.error("❌ Invalid coordinates:", { lat, lng });
      alert("❌ Invalid location coordinates. Please try again.");
      return;
    }
    
    console.log("📍 Parsed coordinates:", { latitude, longitude });
    
    // Fetch nearby markets based on manually selected location
    dispatch(fetchNearbyMarkets({ latitude, longitude }))
      .unwrap()
      .then((response) => {
        console.log("📍 API Response:", response);
        console.log("📍 Nearby markets data:", response?.data);
        
        if (response?.data && response.data.length > 0) {
          const nearestMarket = response.data[0];
          console.log("🎯 Nearest market found:", nearestMarket.name, "at", nearestMarket.distanceKm, "km");
          
          // Save preferred market WITH MANUAL LOCATION to user profile
          dispatch(savePreferredMarket({ 
            marketId: nearestMarket._id, 
            location: { lat: latitude, lng: longitude }, 
            address: address || `Manual Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          console.log("💾 Saved manual location to user profile:", address);
          openMarket(nearestMarket._id);
        } else {
          console.warn("⚠️ No nearby markets found for manual location");
          alert("❌ No markets found in this area. Please try another location.");
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching nearby markets:", error);
        alert("❌ Failed to find nearby markets. Error: " + (error?.message || "Unknown error"));
      });
  };

  return (
    <div className="gmp-root">
      <style>{STYLES}</style>
      <section className="gmp-hero">
        <div className="gmp-container">
          <p className="gmp-eyebrow">Quick commerce · 10–30 min delivery</p>
          <h1>Go Market</h1>
          <p>Search your market, use current location, then pick a market to browse grocery shops and restaurants nearby.</p>

          <form onSubmit={onSearch} className="gmp-tools">
            <div className="gmp-input-wrap" style={{ position: "relative" }}>
              <span className="gmp-input-icon">🔍</span>
              <input
                className="gmp-input"
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => search && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                placeholder="Search market by name, city, pincode…"
                autoComplete="off"
              />
              
              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && search.trim() && filtered.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    maxHeight: 300,
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  {filtered.slice(0, 5).map((market, idx) => (
                    <button
                      key={market._id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        handleSuggestionClick(market);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        border: "none",
                        background: focusedIndex === idx ? "#f1f5f9" : "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                        borderBottom: idx < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={() => setFocusedIndex(idx)}
                    >
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b", marginBottom: 2 }}>
                        {market.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {market.city}{market.state ? `, ${market.state}` : ""} · {market.pincode || "—"}
                        {market.distanceKm != null ? ` · ${market.distanceKm} km away` : ""}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="gmp-btn gmp-btn-outline" onClick={useLocation}>
              📍 Current location
            </button>
            <button type="button" className="gmp-btn gmp-btn-outline" onClick={() => setShowLocationPicker(true)}>
              🗺️ Pick on map
            </button>
            <button type="submit" className="gmp-btn gmp-btn-primary">Search</button>
          </form>
        </div>
      </section>

      {collections.length > 0 && <div className="gmp-container" style={{ marginTop: 24 }}><p style={{ fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 10 }}>Collections</p><div className="gmp-chip-row">{collections.map((c, i) => <button key={`${c.title}-${i}`} className="gmp-chip active" type="button">{c.image ? <img src={c.image} alt="" style={{ width: 22, height: 22, borderRadius: 999, objectFit: "cover", marginRight: 6 }} /> : null}{c.title}</button>)}</div></div>}

      <div className="gmp-container" style={{ marginTop: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 }}>
          Select a market to continue
        </p>

        {loading && <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading markets…</p>}

        {!loading && filtered.length === 0 && (
          <div className="gmp-empty">
            <span className="gmp-empty-icon">🗺️</span>
            No markets found. Try another search or enable location.
          </div>
        )}

        <div className="gmp-market-pick">
          {filtered.map((m) => (
            <button
              key={m._id}
              type="button"
              className="gmp-market-row"
              onClick={() => openMarket(m._id)}
            >
              <div>
                <div className="gmp-market-row-name">{m.name}</div>
                <div className="gmp-market-row-sub">
                  {m.city}{m.state ? `, ${m.state}` : ""} · {m.pincode || "—"}
                  {m.distanceKm != null ? ` · ${m.distanceKm} km away` : ""}
                </div>
              </div>
              <span style={{ fontSize: 18, color: "#2563eb" }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPickerModal
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleManualLocationSelect}
          initialLocation={userData?.goMarketLocation ? {
            lat: userData.goMarketLocation.coordinates?.[1],
            lng: userData.goMarketLocation.coordinates?.[0]
          } : null}
        />
      )}
    </div>
  );
};

// Location Picker Modal Component
const LocationPickerModal = ({ onClose, onSelect, initialLocation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLat, setSelectedLat] = useState(initialLocation?.lat || 28.6139);
  const [selectedLng, setSelectedLng] = useState(initialLocation?.lng || 77.2090);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: selectedLat, lng: selectedLng });

  // Debounced search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchLocation(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchLocation = async (query) => {
    setIsSearching(true);
    try {
      // Using Nominatim OpenStreetMap API (free, no API key needed)
      // Increased limit to 15 for more suggestions
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=15&addressdetails=1`
      );
      const data = await response.json();
      console.log("🔍 Search results:", data);
      setSearchResults(data || []);
    } catch (error) {
      console.error("Location search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    console.log("📍 Selected search result:", { lat, lng, address: result.display_name });
    console.log("📍 Result data types:", { latType: typeof lat, lngType: typeof lng });
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error("❌ Invalid coordinates from search result:", result);
      return;
    }
    
    setSelectedLat(lat);
    setSelectedLng(lng);
    setMapCenter({ lat, lng });
    setSelectedAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleConfirm = () => {
    if (selectedLat && selectedLng) {
      console.log("✅ Confirming location:", { lat: selectedLat, lng: selectedLng, address: selectedAddress });
      onSelect(selectedLat, selectedLng, selectedAddress);
    } else {
      console.error("❌ Cannot confirm - invalid coordinates:", { lat: selectedLat, lng: selectedLng });
    }
  };

  const handleMapClick = (e) => {
    // For simple implementation, clicking on map updates coordinates
    // In production, you'd use a proper map library like Leaflet or Google Maps
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Simple coordinate calculation (this is approximate)
    const latOffset = (y - rect.height / 2) / 1000;
    const lngOffset = (x - rect.width / 2) / 1000;
    
    const newLat = mapCenter.lat - latOffset;
    const newLng = mapCenter.lng + lngOffset;
    
    setSelectedLat(newLat);
    setSelectedLng(newLng);
    
    // Reverse geocode to get address
    reverseGeocode(newLat, newLng);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setSelectedAddress(data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (error) {
      console.error("Reverse geocode error:", error);
      setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      animation: "fadeIn 0.2s ease"
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff",
        borderRadius: 20,
        maxWidth: 600,
        width: "100%",
        maxHeight: "90vh",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.3s ease"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              🗺️ Pick Your Location
            </h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
              Search or click on map to select your location
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "#f1f5f9",
              color: "#475569",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#f1f5f9"}
          >
            ✕
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, landmark, or place..."
              style={{
                width: "100%",
                padding: "12px 12px 12px 40px",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                fontSize: 14,
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563eb"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18
            }}>
              🔍
            </span>
            {isSearching && (
              <span style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 12,
                color: "#64748b"
              }}>
                Searching...
              </span>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{
              marginTop: 8,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              maxHeight: 300,
              overflowY: "auto"
            }}>
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectResult(result)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    borderBottom: idx < searchResults.length - 1 ? "1px solid #e2e8f0" : "none",
                    transition: "background 0.15s",
                    fontSize: 13,
                    color: "#334155"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#e2e8f0"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  📍 {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Area */}
        <div style={{ flex: 1, position: "relative", minHeight: 300, overflow: "hidden" }}>
          {/* Simple Map Placeholder - Click to select location */}
          <div
            onClick={handleMapClick}
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #fef3c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "crosshair",
              position: "relative"
            }}
          >
            <iframe
              title="Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLng-0.01},${selectedLat-0.01},${selectedLng+0.01},${selectedLat+0.01}&layer=mapnik&marker=${selectedLat},${selectedLng}`}
            />
            
            {/* Center Pin Marker */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -100%)",
              fontSize: 40,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              pointerEvents: "none",
              animation: "bounce 1s infinite"
            }}>
              📍
            </div>
          </div>
        </div>

        {/* Selected Location Info */}
        <div style={{
          padding: "16px 24px",
          background: "#f8fafc",
          borderTop: "1px solid #e2e8f0"
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Selected Location
          </p>
          <p style={{ fontSize: 13, color: "#0f172a", margin: "0 0 4px", fontWeight: 500 }}>
            {selectedAddress || "Click on map to select"}
          </p>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontFamily: "monospace" }}>
            {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
          </p>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          gap: 12
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px 20px",
              border: "1px solid #e2e8f0",
              background: "#fff",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLat || !selectedLng}
            style={{
              flex: 2,
              padding: "12px 20px",
              border: "none",
              background: selectedLat && selectedLng ? "#2563eb" : "#cbd5e1",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              cursor: selectedLat && selectedLng ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => selectedLat && selectedLng && (e.currentTarget.style.background = "#1d4ed8")}
            onMouseLeave={(e) => selectedLat && selectedLng && (e.currentTarget.style.background = "#2563eb")}
          >
            ✓ Confirm Location & Find Markets
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -100%); }
          50% { transform: translate(-50%, -110%); }
        }
      `}</style>
    </div>
  );
};

export default GoMarketHome;
