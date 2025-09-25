import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Home, CheckCircle, ChevronDown, Calendar, Clock, MapPin, ChevronLeft, ChevronRight, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../baseUrl";
import { useNavigate } from "react-router-dom";

// Mock data for fallback
const mockCartItems = [
  {
    id: 1,
    name: "Smart TV 55\"",
    monthly_price: 49.99,
    photo: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&h=100&fit=crop"
  },
  {
    id: 2,
    name: "Gaming Console",
    monthly_price: 29.99,
    photo: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=100&h=100&fit=crop"
  }
];

const mockOrders = [];

export default function IntegratedConfirmDeliveryPage() {
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [showDeliverySchedule, setShowDeliverySchedule] = useState(false);
  const [currentView, setCurrentView] = useState('delivery');
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [disabledTimeSlots, setDisabledTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("3:00 PM");
  const [userLocation, setUserLocation] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [mapError, setMapError] = useState("");
  
  // Mapbox related states
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState('');

  const navigate = useNavigate();
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGF3YXJhbGkiLCJhIjoiY21hbzdyb2p3MDU1cjJrczM5c3JpYTdkOSJ9.R405LfNX3bZBpn7We7mpLA';

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
  ];

  // Load cart items and orders on component mount
  useEffect(() => {
    getCartItems();
    verifyCalendar();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          reverseGeocode(newLocation);
          setMapError("");
        },
        (error) => {
          console.log("Location access denied, using default location");
          setMapError("Could not access your location. Showing default location.");
          const defaultLocation = { lat: 40.7128, lng: -74.0060 };
          setUserLocation(defaultLocation);
          setSelectedLocationName("New York, NY, USA");
        }
      );
    } else {
      setMapError("Geolocation is not supported by this browser.");
      const defaultLocation = { lat: 40.7128, lng: -74.0060 };
      setUserLocation(defaultLocation);
      setSelectedLocationName("New York, NY, USA");
    }
  }, []);

  // Load Mapbox GL JS
  useEffect(() => {
    if (!mapboxLoaded) {
      // Load Mapbox CSS
      const cssLink = document.createElement('link');
      cssLink.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      cssLink.rel = 'stylesheet';
      document.head.appendChild(cssLink);

      // Load Mapbox JS
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
      script.onload = () => {
        setMapboxLoaded(true);
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(cssLink);
        document.head.removeChild(script);
      };
    }
  }, [mapboxLoaded]);

  // Initialize map when Mapbox is loaded
  useEffect(() => {
    if (mapboxLoaded && mapContainer.current && !map.current && userLocation) {
      window.mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLocation.lng, userLocation.lat],
        zoom: 13
      });

      // Add marker
      new window.mapboxgl.Marker({
        color: '#024a47'
      })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);

      // Add navigation controls
      map.current.addControl(new window.mapboxgl.NavigationControl());
    }
  }, [mapboxLoaded, userLocation]);

  // Update map when location changes
  useEffect(() => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13
      });

      // Remove existing markers
      const markers = document.querySelectorAll('.mapboxgl-marker');
      markers.forEach(marker => marker.remove());

      // Add new marker
      new window.mapboxgl.Marker({
        color: '#024a47'
      })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);
    }
  }, [userLocation]);

  // Fetch cart items from API
  const getCartItems = async () => {
    try {
      let token = localStorage.getItem('token');
      let response = await axios.get(`${BASE_URL}/getCartItems`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Cart items:", response.data.cartItems);
      setCartItems(response.data.cartItems?.items || mockCartItems);
      
      // Calculate total cost
      let totalCost = 0;
      if (response.data.cartItems?.items) {
        for (let i = 0; i < response.data.cartItems.items.length; i++) {
          totalCost += response.data.cartItems.items[i].monthly_price;
        }
      } else {
        // Use mock data total if API fails
        totalCost = mockCartItems.reduce((sum, item) => sum + item.monthly_price, 0);
      }
      setTotalCost(totalCost);

    } catch (e) {
      console.error("Error fetching cart items:", e.message);
      toast.error("Error loading cart items");
      // Fallback to mock data
      setCartItems(mockCartItems);
      setTotalCost(mockCartItems.reduce((sum, item) => sum + item.monthly_price, 0));
    }
  };

  // Fetch calendar data from API
  const verifyCalendar = async () => {
    try {
      let token = localStorage.getItem('token');
      let response = await axios.get(`${BASE_URL}/verifyCalandar`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("Calendar data:", response.data);
      setOrders(response.data.orders || []);
    } catch (e) {
      console.error("Error fetching calendar data:", e);
      toast.error("Error loading delivery schedule");
      setOrders(mockOrders);
    }
  };

  // Reverse geocoding to get location name
  const reverseGeocode = async (location) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setSelectedLocationName(data.features[0].place_name);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Search for locations
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=8&types=place,locality,neighborhood,address`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Debounce timer ref
  const searchTimeoutRef = useRef(null);

  // Handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  };

  // Handle Enter key press in search input
  const handleLocationInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        // Select the first search result
        selectLocation(searchResults[0]);
      } else if (locationQuery.trim()) {
        // Force search if no results are shown
        searchLocation(locationQuery);
      }
    }
  };

  // Select a location from search results
  const selectLocation = (feature) => {
    const [lng, lat] = feature.center;
    setUserLocation({ lat, lng });
    setSelectedLocationName(feature.place_name);
    setLocationQuery('');
    setShowSearchResults(false);
  };

  const isDateAvailable = (date) => {
    const dateString = date.toDateString();
    const bookedSlotsForDate = orders.filter(order => {
      const orderDate = new Date(order.deliveryDate).toDateString();
      return orderDate === dateString;
    });
    return bookedSlotsForDate.length < timeSlots.length;
  };

  const isTimeSlotAvailable = (date, timeSlot) => {
    const dateString = date.toDateString();
    const isBooked = orders.some(order => {
      const orderDate = new Date(order.deliveryDate).toDateString();
      return orderDate === dateString && order.deliveryTime === timeSlot;
    });
    return !isBooked;
  };

  useEffect(() => {
    const updateDisabledTimeSlots = () => {
      const disabled = timeSlots.filter(timeSlot => !isTimeSlotAvailable(selectedDate, timeSlot));
      setDisabledTimeSlots(disabled);
      
      if (disabled.includes(selectedTime)) {
        const availableTime = timeSlots.find(slot => !disabled.includes(slot));
        if (availableTime) {
          setSelectedTime(availableTime);
        }
      }
    };

    if (orders.length > 0) {
      updateDisabledTimeSlots();
    }
  }, [selectedDate, orders, selectedTime]);

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleConfirmOrder = async () => {
    try {
      if (!userLocation) {
        toast.error("Please select a delivery location");
        return;
      }
  
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation.lng},${userLocation.lat}.json?access_token=${MAPBOX_TOKEN}`
      );
      
      let orderData = {
        location: userLocation,
        deliveryDate: selectedDate,
        deliveryTime: selectedTime,
        locationName: response.data.features[0]?.place_name || selectedLocationName
      };
  
      // Simple URL encoding - no base64
      const encodedData = encodeURIComponent(JSON.stringify(orderData));
      navigate(`/billing?data=${encodedData}`);
  
    } catch (e) {
      console.error("Error confirming order:", e.message);
      toast.error("Error confirming order");
    }
  };

  const handleScheduleDelivery = () => {
    setCurrentView('delivery');
  };

  const handleDeliveryScheduled = () => {
    setShowDeliverySchedule(true);
    setCurrentView('confirm');
  };

  const handleSeeMoreClick = () => {
    setShowCalendar(!showCalendar);
  };

  const CalendarComponent = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 sm:h-10"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === currentMonth.getMonth() && 
                        selectedDate.getFullYear() === currentMonth.getFullYear();
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentMonth.getMonth() && 
                     new Date().getFullYear() === currentMonth.getFullYear();
      const isPast = date < new Date().setHours(0, 0, 0, 0);
      const isAvailable = isDateAvailable(date);
      
      days.push(
        <button
          key={day}
          onClick={() => !isPast && isAvailable && selectDate(day)}
          disabled={isPast || !isAvailable}
          className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium transition-colors relative ${
            isSelected 
              ? 'bg-[#024a47] text-white' 
              : isPast
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : !isAvailable
                  ? 'bg-red-100 text-red-400 cursor-not-allowed'
                  : isToday
                    ? 'border border-[#024a47] text-[#024a47]'
                    : 'hover:bg-gray-100 text-gray-700'
          }`}
          title={!isAvailable ? "No available time slots" : isPast ? "Past date" : ""}
        >
          {day}
          {!isAvailable && !isPast && (
            <span className="absolute bottom-0.5 w-1 h-1 bg-red-400 rounded-full"></span>
          )}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-1">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
          <h3 className="font-semibold text-base sm:text-lg text-[#024a47]">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => navigateMonth(1)} className="p-1">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="h-6 sm:h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
        
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-100 rounded-full"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-100 rounded-full"></div>
            <span>Available</span>
          </div>
        </div>
      </div>
    );
  };

  const TimeSlots = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-sm mb-4">
      <h3 className="font-semibold text-base sm:text-lg text-[#024a47] mb-3">Select Time</h3>
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map(time => {
          const isDisabled = disabledTimeSlots.includes(time);
          
          return (
            <button
              key={time}
              onClick={() => !isDisabled && setSelectedTime(time)}
              disabled={isDisabled}
              className={`py-2 px-2 sm:px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedTime === time
                  ? 'bg-[#024a47] text-white'
                  : isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={isDisabled ? "This time slot is already booked" : ""}
            >
              {time}
              {isDisabled && " ⛔"}
            </button>
          );
        })}
      </div>
      
      {disabledTimeSlots.length === timeSlots.length && (
        <div className="mt-2 text-center text-red-500 text-sm">
          No available time slots for this date. Please select another date.
        </div>
      )}
    </div>
  );

  // Delivery Appointment View
  if (currentView === 'delivery') {
    return (
      <div className="min-h-screen bg-[#f3f4e6] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
          {/* Header */}
          <div className="bg-white px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center">
            <div className="flex justify-start mb-4">
              <ArrowLeft 
                className="w-5 h-5 sm:w-6 sm:h-6 text-[#024a47] cursor-pointer" 
                onClick={() => setCurrentView('confirm')}
              />
            </div>
            
            <div className="mb-3 sm:mb-4">
              <Calendar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-[#024a47] mx-auto" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#024a47] mb-1">Delivery Appointment</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#024a47]">Schedule your delivery</p>
          </div>

          {/* Content Container */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            {/* Location Search */}
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    value={locationQuery}
                    onChange={handleLocationInputChange}
                    onKeyPress={handleLocationInputKeyPress}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] focus:border-transparent"
                  />
                </div>
                
                {/* Search Results */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                    {searchResults.map((feature, index) => (
                      <button
                        key={index}
                        onClick={() => selectLocation(feature)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900 text-sm">
                          {feature.place_name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Location Display */}
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#024a47] flex-shrink-0" />
                  <span className="text-sm sm:text-base font-medium text-[#024a47] truncate">
                    {selectedLocationName || "Loading location..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Map */}
            {currentView === 'delivery'?<>
              <div className="mb-4 sm:mb-6">
              <div className="bg-gray-100 rounded-lg h-48 sm:h-56 md:h-64 relative overflow-hidden">
                {mapboxLoaded && userLocation ? (
                  <>
                    <div ref={mapContainer} className="w-full h-full rounded-lg" />
                    {mapError && (
                      <div className="absolute bottom-2 left-0 right-0 bg-yellow-100 text-yellow-800 text-xs p-2 text-center">
                        {mapError}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-500 text-sm sm:text-base">
                      {userLocation ? "Loading map..." : "Getting your location..."}
                    </div>
                  </div>
                )}
              </div>
            </div>
            </>:''}
           

            {/* Selected Date Display */}
            <div className="mb-3 sm:mb-4">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#024a47]" />
                  <span className="text-base sm:text-lg lg:text-xl font-semibold text-[#024a47]">{formatDate(selectedDate)}</span>
                </div>
              </div>
            </div>

            {/* Selected Time Display */}
            <div className="mb-3 sm:mb-4">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#024a47]" />
                  <span className="text-base sm:text-lg lg:text-xl font-semibold text-[#024a47]">{selectedTime}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#024a47] font-semibold text-sm sm:text-base lg:text-lg">Delivery time - Free</span>
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#024a47]" />
                  </div>
                  <button 
                    className="text-[#024a47] font-semibold underline text-sm sm:text-base lg:text-lg"
                    onClick={handleSeeMoreClick}
                  >
                    {showCalendar ? "See Less" : "See More"}
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar and Time Selection */}
            {showCalendar && (
              <div className="mb-4 sm:mb-6">
                <CalendarComponent />
                <TimeSlots />
              </div>
            )}

            {/* Schedule Button */}
            <button 
              className="w-full bg-[#024a47] hover:bg-[#024a47] text-white font-semibold py-3 sm:py-4 px-4 rounded-lg transition-colors text-base sm:text-lg lg:text-xl"
              onClick={handleDeliveryScheduled}
            >
              Schedule Delivery
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Confirm & Submit View
  return (
    <div className="min-h-screen bg-[#f3f4e6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
        
        <div className="bg-white px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center">
          <div className="flex justify-start mb-4">
            <ArrowLeft 
              className="w-5 h-5 sm:w-6 sm:h-6 text-[#024a47] cursor-pointer" 
              onClick={() => setCurrentView('delivery')}
            />
          </div>
          
          <div className="mb-3 sm:mb-4">
            <Calendar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 text-[#024a47] mx-auto" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#024a47] mb-1">Confirm & Submit</h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#024a47]">Confirm your delivery</p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          {/* Order Details */}
          {cartItems?.map((val, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#024a47] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={val?.photo} alt={val?.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-gray-600">Product</h3>
                      <h4 className="text-base sm:text-lg font-bold text-gray-900">{val?.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm sm:text-base">
                    <span className="text-gray-600">${val?.monthly_price}/month</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mb-4 text-right">
            <span className="text-gray-900 font-semibold text-lg">Total ${totalCost}/month</span>
          </div>
          
          {/* Delivery Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-[#4a9b8e] mb-1">Delivery</h3>
                <p className="text-xs sm:text-sm text-[#4a9b8e]">& install, fee free</p>
              </div>
              <div className="bg-[#024a47] text-white px-3 py-1 rounded-full">
                <span className="text-xs sm:text-sm font-medium">Free</span>
              </div>
            </div>

            {!showDeliverySchedule && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={handleScheduleDelivery}
                  className="w-full bg-[#024a47] text-white py-2 px-4 rounded-lg font-medium text-sm sm:text-base transition-colors hover:bg-[#024a47]"
                >
                  Schedule Delivery
                </button>
              </div>
            )}

            {showDeliverySchedule && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4a9b8e]" />
                  <span className="text-sm sm:text-base font-medium text-gray-900 truncate">{selectedLocationName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4a9b8e]" />
                  <span className="text-sm sm:text-base font-medium text-gray-900">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4a9b8e]" />
                  <span className="text-sm sm:text-base font-medium text-gray-900">{selectedTime}</span>
                </div>
                <button 
                  onClick={handleScheduleDelivery}
                  className="text-[#4a9b8e] text-sm font-medium underline"
                >
                  Reschedule
                </button>
              </div>
            )}
          </div>

          {/* Technician Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-600 rounded-full flex-shrink-0 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center">
                  <img src={"./technican.jpg"} alt="Technician" className="w-full h-full object-cover"/>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base text-start sm:text-lg font-bold text-gray-900 mb-1">Roosevelt Smith</h3>
                <p className="text-sm text-start sm:text-base text-gray-600 mb-2">Certified RentSimple Technician</p>

                
                <button 
                  onClick={() => setShowTechDetails(!showTechDetails)}
                  className="flex items-center gap-2 text-[#4a9b8e] text-sm sm:text-base"
                >
                  <CheckCircle className="w-4 h-4 text-[#4a9b8e]" />
                  <span className="font-medium">Certified RentSimple Tech</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTechDetails ? 'rotate-180' : ''}`} />
                </button>
                
                {showTechDetails && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Background Checked & Insured</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button 
            onClick={handleConfirmOrder}
            className={`w-full font-bold py-3 sm:py-4 px-4 rounded-lg transition-colors text-base sm:text-lg lg:text-xl ${
              showDeliverySchedule 
                ? 'bg-[#024a47] hover:bg-[#024a47] text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!showDeliverySchedule}
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}