import axios from "axios";
import { ArrowLeft, Home, CheckCircle, ChevronDown, Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ToastContainer,toast } from "react-toastify";
import { BASE_URL } from "../baseUrl";
import { useNavigate } from "react-router-dom";

export default function IntegratedConfirmDeliveryPage() {
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [showDeliverySchedule, setShowDeliverySchedule] = useState(false);
  const [currentView, setCurrentView] = useState('delivery'); // Changed to 'delivery' initially
  const [cartItems,setCartItems]=useState([])
  const navigate=useNavigate();
  // Delivery scheduling states
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [orders,setOrders]=useState([])
  const [disabledTimeSlots, setDisabledTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("3:00 PM");
  const [userLocation, setUserLocation] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mapError, setMapError] = useState("");
  const [totalCost,setTotalCost]=useState()

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMapError("");
        },
        (error) => {
          console.log("Location access denied, using default location");
          setMapError("Could not access your location. Showing default location.");
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      setMapError("Geolocation is not supported by this browser.");
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  }, []);

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM"
  ];

  // Add the missing functions
  const isDateAvailable = (date) => {
    // Check if the date has any available time slots
    // If all time slots are booked for this date, return false
    const dateString = date.toDateString();
    const bookedSlotsForDate = orders.filter(order => {
      const orderDate = new Date(order.deliveryDate).toDateString();
      return orderDate === dateString;
    });
    
    // If all time slots are booked, the date is not available
    return bookedSlotsForDate.length < timeSlots.length;
  };

  const isTimeSlotAvailable = (date, timeSlot) => {
    // Check if a specific time slot is available for the given date
    const dateString = date.toDateString();
    const isBooked = orders.some(order => {
      const orderDate = new Date(order.deliveryDate).toDateString();
      return orderDate === dateString && order.deliveryTime === timeSlot;
    });
    
    return !isBooked;
  };

  // Update disabled time slots when date changes
  useEffect(() => {
    const updateDisabledTimeSlots = () => {
      const disabled = timeSlots.filter(timeSlot => !isTimeSlotAvailable(selectedDate, timeSlot));
      setDisabledTimeSlots(disabled);
      
      // If selected time is now disabled, pick the first available one
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

  const handleConfirmOrder = async() => {
    try{
      console.log(selectedTime)
      console.log(userLocation)
      console.log(currentMonth)
   
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation.lng},${userLocation.lat}.json?access_token=pk.eyJ1IjoiZGF3YXJhbGkiLCJhIjoiY21hbzdyb2p3MDU1cjJrczM5c3JpYTdkOSJ9.R405LfNX3bZBpn7We7mpLA`
      );
      
      let token=localStorage.getItem('token')
      let data={
        location:userLocation,deliveryDate:currentMonth,deliveryTime:selectedTime,locationName:response.data.features[0].place_name
      }
    
      // let response=await axios.post(`${BASE_URL}/createOrder`,{location:userLocation,deliveryDate:currentMonth,deliveryTime:selectedTime},{headers:{
      //   Authorization:`Bearer ${token}`
      // }})

    
      const encodedData = btoa(JSON.stringify(data));
    
      navigate(`/billing?data=${encodeURIComponent(encodedData)}`);

    }catch(e){
      console.log(e.message)
    }
  };

  useEffect(()=>{
    getCartItems();
    verifycalandar();
  },[])
  
  const verifycalandar = async () => {
    try {
      let token = localStorage.getItem('token');
      let response = await axios.get(`${BASE_URL}/verifyCalandar`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("verifyCalandar");
      console.log(response.data);
      setOrders(response.data.orders || []);
    } catch (e) {
      console.error("Error fetching calendar data:", e);
      toast.error("Error loading delivery schedule");
    }
  };

  const getCartItems=async(req,res)=>{
    try{
      let token=localStorage.getItem('token')
      let response=await axios.get(`${BASE_URL}/getCartItems`,{headers:{
        Authorization:`Bearer ${token}`
      }})

      console.log(response.data.cartItems)
      setCartItems(response.data.cartItems.items)
      let totalCost = 0;
      for(let i = 0; i < response.data.cartItems.items.length; i++) {
        totalCost = response.data.cartItems.items[i].monthly_price + totalCost
        setTotalCost(totalCost)
      }

    }catch(e){
      console.log(e.message)
    }
  }

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
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 sm:h-10"></div>);
    }
    
    // Days of the month
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
        
        {/* Legend */}
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
            {/* Back arrow */}
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
            {/* Map */}
            <div className="mb-4 sm:mb-6">
              <div className="bg-gray-100 rounded-lg h-32 sm:h-40 md:h-48 relative overflow-hidden">
                {userLocation ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-75">
                      <div className="relative">
                        <div className="grid grid-cols-5 gap-1 opacity-40">
                          {[...Array(25)].map((_, i) => (
                            <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 border border-gray-300 rounded-sm"></div>
                          ))}
                        </div>
                        
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400 opacity-50 transform -translate-y-1/2"></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gray-400 opacity-50 transform -translate-x-1/2"></div>
                        
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    
                    {mapError && (
                      <div className="absolute bottom-2 left-0 right-0 bg-yellow-100 text-yellow-800 text-xs p-2 text-center">
                        {mapError}
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs shadow">
                      {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </div>
                    
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <button className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded shadow flex items-center justify-center text-xs font-bold">+</button>
                      <button className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded shadow flex items-center justify-center text-xs font-bold">-</button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-500 text-sm sm:text-base">Loading location...</div>
                  </div>
                )}
              </div>
            </div>

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

            {/* Calendar and Time Selection (shown when See More is clicked) */}
            {showCalendar && (
              <div className="mb-4 sm:mb-6">
                <CalendarComponent />
                <TimeSlots />
              </div>
            )}

            {/* Select Button */}
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

  // Confirm & Submit View (default)
  return (
    <div className="min-h-screen bg-[#f3f4e6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
        
        <div className="bg-white px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center">
          {/* Back arrow */}
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
          {cartItems?.map((val,i)=>{
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-4 sm:mb-6 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Product icon */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#024a47] rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src={val?.photo} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-gray-600">Orefer SL 25</h3>
                        <h4 className="text-base sm:text-lg font-bold text-gray-900">{val?.name}</h4>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <span className="text-gray-600">${val?.monthly_price}/month</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

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

            {/* Schedule Delivery Button */}
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

            {/* Scheduled Delivery Info */}
            {showDeliverySchedule && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
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
                  <img src="./technican.jpg" alt="Technician" className="w-full h-full object-cover"/>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base text-start sm:text-lg font-bold text-gray-900 mb-1">Roosevelt Smith</h3>
                <p className="text-sm text-start sm:text-base text-gray-600 mb-2">Certified RentSimple Technician</p>
                <p className="text-sm sm:text-base text-start text-gray-600 mb-2">Technician</p>
                
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