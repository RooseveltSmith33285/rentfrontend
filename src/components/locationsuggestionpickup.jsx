import { useState, useEffect, useRef } from 'react';
import React from 'react'
const LocationSuggestionFieldPickup= ({ value, onChange, name = "location", required = false, placeholder = "Enter address..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    if (value?.name) {
      setInputValue(value.name);
    } else if (typeof value === 'string') {
      setInputValue(value);
    }
  }, [value]);

  // Fetch suggestions with debounce
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!inputValue || inputValue.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=8&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'RentalApp/1.0'
            }
          }
        );
        
        const data = await response.json();
        
        const formattedSuggestions = data.map(item => {
          const addr = item.address || {};
          const street = addr.road || addr.street || '';
          const houseNumber = addr.house_number || '';
          const fullStreet = houseNumber ? `${houseNumber} ${street}`.trim() : street;
          
          return {
            name: item.display_name,
            street: fullStreet,
            city: addr.city || addr.town || addr.village || '',
            state: addr.state || '',
            zipCode: addr.postcode || '',
            country: addr.country || '',
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon)
          };
        });
        
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (!newValue) {
      onChange(null);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion.name);
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto mt-2">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="px-4 py-3 hover:bg-[#024a47] hover:bg-opacity-10 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="text-sm font-semibold text-gray-900 mb-1.5">
                {suggestion.name}
              </div>
              
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-600">
                {suggestion.street && (
                  <div>
                    <span className="font-medium text-gray-500">Street:</span> {suggestion.street}
                  </div>
                )}
                {suggestion.city && (
                  <div>
                    <span className="font-medium text-gray-500">City:</span> {suggestion.city}
                  </div>
                )}
                {suggestion.state && (
                  <div>
                    <span className="font-medium text-gray-500">State:</span> {suggestion.state}
                  </div>
                )}
                {suggestion.zipCode && (
                  <div>
                    <span className="font-medium text-gray-500">Zip:</span> {suggestion.zipCode}
                  </div>
                )}
                {suggestion.country && (
                  <div className="col-span-2">
                    <span className="font-medium text-gray-500">Country:</span> {suggestion.country}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showSuggestions && !loading && inputValue && inputValue.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-2 px-4 py-4 text-center">
          <p className="text-sm text-gray-500">No locations found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
        </div>
      )}

      {inputValue && inputValue.length > 0 && inputValue.length < 3 && (
        <div className="absolute z-50 w-full bg-blue-50 border border-blue-200 rounded-lg shadow-sm mt-2 px-3 py-2">
          <p className="text-xs text-blue-600">Type at least 3 characters to see suggestions</p>
        </div>
      )}
    </div>
  );
};

export default LocationSuggestionFieldPickup;