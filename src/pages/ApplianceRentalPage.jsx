import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';
import { ToastContainer,toast } from 'react-toastify';
import { BASE_URL } from '../baseUrl';
import { useNavigate } from 'react-router-dom';
export default function ApplianceRentalPage() {
  const [selectedAppliances, setSelectedAppliances] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [appliances, setAppliances] = useState([]);
  const [cartItems, setCartItems] = useState([]); // New state for cart items
  const [loadingCart, setLoadingCart] = useState(false);
  const navigate=useNavigate();

  const handleSelect = async (applianceId) => {
    try {
      let token = localStorage.getItem('token');
      
      if (selectedAppliances.includes(applianceId)) {
        // Remove from cart
        await axios.delete(`${BASE_URL}/removeFromCart`, {
          data: { applianceId },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Add to cart
        await axios.post(`${BASE_URL}/addItemsToCart`, { applianceId }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      // Immediately fetch updated cart to sync with server
      await fetchCartItems();
      
    } catch(e) {
      console.error('Error updating cart:', e);
      toast.error('Error updating cart');
    }
  };
  
  // Also optimize fetchCartItems to avoid unnecessary state updates:
  const fetchCartItems = async () => {
    try {
      setLoadingCart(true);
      let token = localStorage.getItem('token');
      let response = await axios.get(`${BASE_URL}/getCartItems`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const items = response.data.cartItems.items || [];
      console.log("CART ITEMS:", items);
      
      setCartItems(items);
      
      // Only update selectedAppliances if different
      const idsOnly = items.map(val => val._id);
      setSelectedAppliances(prev => {
        // Simple comparison to avoid unnecessary re-renders
        if (prev.length !== idsOnly.length || !idsOnly.every(id => prev.includes(id))) {
          return idsOnly;
        }
        return prev;
      });
      
    } catch(e) {
      console.error('Error fetching cart items:', e);
      toast.error('Error loading cart items');
      setCartItems([]);
      setSelectedAppliances([]); // Clear selections on error
    } finally {
      setLoadingCart(false);
    }
  };

  const handleViewCart = async () => {
    setShowCart(true);
 
  };

  const handleCloseCart = () => {
    setShowCart(false);
  };


  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + parseInt(item.monthly_price);
    }, 0);
  };

  useEffect(() => {
    getProducts();
    fetchCartItems()
  }, []);

  const getProducts = async () => {
    try {
      let response = await axios.get(`${BASE_URL}/getProducts`)
      console.log(response.data)
      setAppliances(response.data.products)
    } catch(e) {
      if(e?.response?.data?.error){
        toast.dismiss(); 
        toast.error(e?.response?.data?.error,{containerId:"productsPage"})
      } else {
        toast.dismiss(); 
        toast.error("Error while fetching products please try again",{containerId:"productsPage"})
      }
    }
  }

  const WasherDryerIcon = () => (
    <div className="flex space-x-1">
      <div className="w-16 h-20 bg-gray-100 border-2 border-gray-300 rounded-lg relative">
        <div className="absolute top-2 left-2 w-2 h-1 bg-gray-400 rounded"></div>
        <div className="absolute top-2 right-2 w-3 h-1 bg-gray-700 rounded"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 border-2 border-gray-400 rounded-full">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-300 rounded-full"></div>
        </div>
      </div>
      <div className="w-16 h-20 bg-gray-100 border-2 border-gray-300 rounded-lg relative">
        <div className="absolute top-2 left-2 w-2 h-1 bg-gray-400 rounded"></div>
        <div className="absolute top-2 right-2 w-3 h-1 bg-gray-700 rounded"></div>
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 border-2 border-gray-400 rounded-full bg-gray-700"></div>
      </div>
    </div>
  );

  const RefrigeratorIcon = () => (
    <div className="w-20 h-24 bg-gray-100 border-2 border-gray-300 rounded-lg relative">
      <div className="absolute top-2 left-2 w-2 h-1 bg-gray-400 rounded"></div>
      <div className="absolute top-2 right-2 w-3 h-1 bg-gray-700 rounded"></div>
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-400"></div>
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-400"></div>
    </div>
  );

  const DeepFreezerIcon = () => (
    <div className="w-20 h-16 bg-gray-100 border-2 border-gray-300 rounded-lg relative">
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-200 border border-gray-300 rounded-t"></div>
      <div className="absolute top-4 left-2 right-2 bottom-2 bg-gray-50 rounded"></div>
    </div>
  );

  const getApplianceIcon = (photo) => {
    if (photo?.includes('washer') || photo?.includes('dryer')) {
      return <WasherDryerIcon />;
    } else if (photo?.includes('refrigerator')) {
      return <RefrigeratorIcon />;
    } else if (photo?.includes('freezer')) {
      return <DeepFreezerIcon />;
    } else {
      return <WasherDryerIcon />;
    }
  };

  if (showCart) {
    return (
      <div className="min-h-screen bg-[#f9faf5] p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Cart Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button
              onClick={handleCloseCart}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {loadingCart ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-lg">Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <button
                onClick={handleCloseCart}
                className="mt-4 bg-[#024a47] hover:bg-[#024a47] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                   <img className='w-[5rem]' src={item?.photo}/>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <div className="text-sm text-gray-600">
                        {item.key_features && item.key_features.length > 0 ? (
                          item.key_features.map((feature, index) => (
                            <span key={index}>
                              {feature}
                              {index < item.key_features.length - 1 && ', '}
                            </span>
                          ))
                        ) : (
                          <span>No features listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-gray-900">${item.monthly_price}/mo</span>
                    <button
                      onClick={() => handleSelect(item._id)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Cart Summary */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total Monthly Cost:</span>
                  <span className="text-2xl font-bold text-[#024a47]">${getTotalPrice()}/mo</span>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleCloseCart}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button onClick={(e)=>{
                        navigate('/delivery')
                  }} className="flex-1 bg-[#024a47] hover:bg-[#024a47] text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer containerId={"productsPage"}/>
      <div className="min-h-screen bg-[#f9faf5] p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {appliances.map((appliance) => (
              <div key={appliance._id} className="bg-white min-h-[30px] rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[200px]">
                {/* Appliance Icon */}
                <div className="flex min-h-[100px] justify-center mb-6">
                  <img src={appliance?.photo}/>
                </div>

                {/* Product Info */}
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {appliance.name}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    ${appliance.monthly_price}/mo
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4 relative">
                    {appliance.key_features && appliance.key_features.length > 0 ? (
                      appliance.key_features.map((feature, index) => (
                        <div key={index} className="flex min-h-[30px] items-center justify-center text-gray-700">
                          <div className="w-2 h-2 bg-[#024a47] rounded-full mr-3"></div>
                          <span className="text-base sm:text-lg">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex min-h-[30px] items-center justify-center text-gray-500">
                        <span className="text-base sm:text-lg">No features listed</span>
                      </div>
                    )}
                  </div>

                  {/* Stock Status */}
                  {appliance.stock_status === 'low' && (
                    <div className="flex absolute md:mx-[8%] mx-[25%] items-center justify-center text-gray-500 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">Low stock</span>
                    </div>
                  )}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelect(appliance._id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
                    selectedAppliances.includes(appliance._id)
                      ? 'bg-[#024a47] text-white'
                      : 'bg-[#024a47] hover:bg-[#024a47] text-white'
                  }`}
                >
                  {selectedAppliances.includes(appliance._id) ? 'Selected' : 'Select'}
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Navigation/Action Bar */}
          <div className="bg-[#024a47] rounded-2xl p-4 sm:p-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-white mb-4 sm:mb-0">
                <span className="text-lg font-semibold">
                  {selectedAppliances.length} item{selectedAppliances.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex space-x-4">
                <button 
                  onClick={handleViewCart}
                  className="bg-white text-[#024a47] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  View Cart
                </button>
                <button 
                onClick={()=>{
                  navigate('/delivery')
                }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedAppliances.length > 0
                      ? 'bg-[#024a47] text-white hover:bg-[#024a47]'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                  disabled={selectedAppliances.length === 0}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}