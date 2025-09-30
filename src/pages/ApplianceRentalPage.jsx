import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { BASE_URL } from '../baseUrl';
import { useNavigate } from 'react-router-dom';

export default function ApplianceRentalPage() {
  const [selectedAppliances, setSelectedAppliances] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [appliances, setAppliances] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showComboPopup, setShowComboPopup] = useState(false);
  const [selectedComboAppliance, setSelectedComboAppliance] = useState(null);
  const [selectedPlugType, setSelectedPlugType] = useState('');
  const [selectedTvSize, setSelectedTvSize] = useState(0);
  const [loading,setLoading]=useState(false)
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    getProducts();
    loadCartFromLocalStorage();
  }, []);

  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        setSelectedAppliances(parsedCart.map(item => item._id));
      }
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
    }
  };

  const saveCartToLocalStorage = (items) => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
      toast.error('Error saving cart');
    }
  };

  const handleSelect = (appliance) => {
    try {
      // Check if it's a TV appliance
      if (appliance.name.toLowerCase().includes('tv') && !selectedAppliances.includes(appliance._id)) {
        setSelectedComboAppliance(appliance);
        setShowComboPopup(true);
        return;
      }

      if (appliance.combo === true && !selectedAppliances.includes(appliance._id)) {
        setSelectedComboAppliance(appliance);
        setShowComboPopup(true);
        return;
      }

      if (selectedAppliances.includes(appliance._id)) {
        // Remove from cart
        removeFromCart(appliance._id);
      } else {
        // Add to cart
        addToLocalCart(appliance);
      }
    } catch (e) {
      console.error('Error updating cart:', e);
      toast.error('Error updating cart');
    }
  };

  const addToLocalCart = (appliance, plugType = null, tvSize = null) => {
    const cartItem = { ...appliance };

    // Handle TV size selection
    if (appliance.name.toLowerCase().includes('tv') && tvSize) {
      cartItem.tvSize = tvSize;
      setSelectedTvSize(tvSize.replace('"', ''));
    }

    // Handle combo appliance (dryer with plug type)
    if (appliance.combo === true && plugType) {
      cartItem.comboItem = {
        plugType: plugType,
        plugDescription: plugType === '3-prong'
          ? '3-prong 220v USA Homes'
          : '4-prong 220V USA Homes'
      };
    }

    const updatedCart = [...cartItems, cartItem];
    setCartItems(updatedCart);
    setSelectedAppliances([...selectedAppliances, appliance._id]);
    saveCartToLocalStorage(updatedCart);
    toast.success('Item added to cart');
  };

  const removeFromCart = (applianceId) => {
    const updatedCart = cartItems.filter(item => item._id !== applianceId);
    setCartItems(updatedCart);
    setSelectedAppliances(selectedAppliances.filter(id => id !== applianceId));
    saveCartToLocalStorage(updatedCart);
    toast.info('Item removed from cart');
  };

  const handlePlugTypeSelect = (plugType) => {
    try {
      setSelectedPlugType(plugType);

      if (selectedComboAppliance) {
        // Check if it's a TV or a combo appliance
        if (selectedComboAppliance.name.toLowerCase().includes('tv')) {
          addToLocalCart(selectedComboAppliance, null, plugType);
        } else {
          addToLocalCart(selectedComboAppliance, plugType);
        }
      }

      setShowComboPopup(false);
      setSelectedComboAppliance(null);
      setSelectedPlugType('');
    } catch (e) {
      console.error('Error adding appliance to cart:', e);
      toast.error('Error adding appliance to cart');
    }
  };

  const handleCloseComboPopup = () => {
    setShowComboPopup(false);
    setSelectedComboAppliance(null);
    setSelectedPlugType('');
  };

  const syncCartWithAPI = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token');
      
      
     
   
       await axios.post(`${BASE_URL}/addItemsToCart`, { cartItems }, { headers:{
        Authorization:`Bearer ${token}`
       } })
     

      // Update TV size if exists
      if (selectedTvSize) {
        await axios.patch(`${BASE_URL}/updateTvscreen`, 
          { tvSize: selectedTvSize },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      return true;
    } catch (e) {
      console.error('Error syncing cart with API:', e);
      toast.error('Error syncing cart');
      return false;
    }
  };

  const handleContinue = async () => {
    if (selectedAppliances.length === 0) {
      toast.warning('Please select at least one item');
      return;
    }

    const synced = await syncCartWithAPI();
    setLoading(false)
    if (synced) {
      navigate('/delivery');
    }
  };

  const handleViewCart = () => {
    setShowCart(true);
  };

  const handleCloseCart = () => {
    setShowCart(false);
  };

  const getTotalPrice = () => {
    let total = cartItems.reduce((total, item) => {
      return total + parseInt(item.monthly_price);
    }, 0);

    if (cartItems?.find(u => u?.name?.toLowerCase().includes("tv"))) {
      total = (total + parseInt(selectedTvSize)) - 1;
    }
    return total;
  };

  const getProducts = async () => {
    try {
      let response = await axios.get(`${BASE_URL}/getProducts`);
      setAppliances(response.data.products);
    } catch (e) {
      if (e?.response?.data?.error) {
        toast.dismiss();
        toast.error(e?.response?.data?.error, { containerId: "productsPage" });
      } else {
        toast.dismiss();
        toast.error("Error while fetching products please try again", { containerId: "productsPage" });
      }
    }
  };

  const ComboPopup = ({ showComboPopup, selectedPlugType, setShowComboPopup, setSelectedPlugType, selectedComboAppliance, handlePlugTypeSelect }) => {
    const isTV = selectedComboAppliance?.name.toLowerCase().includes('tv');

    const tvSizes = [
      { size: '40"', price: 40, note: 'Entry-level size for bedrooms, dorm rooms, small apartments' },
      { size: '43"', price: 43, note: 'Popular budget-friendly living-room option' },
      { size: '50"', price: 50, note: 'Very common mid-range size for living rooms' },
      { size: '55"', price: 55, note: 'One of the top-selling mainstream sizes for households' },
      { size: '60"', price: 60, note: 'Preferred for larger living rooms or family spaces' },
      { size: '65"', price: 65, note: 'Fast-growing favorite for home-entertainment setups' },
      { size: '70"', price: 70, note: 'Big-screen experience for movie and sports fans' },
      { size: '75"', price: 75, note: 'Premium choice; often requested for home theaters' },
      { size: '80"', price: 80, note: 'Upper-end for most renters; ideal for large rooms or event viewing' }
    ];

    const handlePlugSelect = (plugType) => {
      handlePlugTypeSelect(plugType);
    };

    const handleTvSize = (tvSize) => {
      handlePlugSelect(tvSize);
    };

    const PlugIcon3Prong = () => (
      <div className="w-24 h-24 mx-auto mb-4">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#024a47" strokeWidth="3" />
          <line x1="35" y1="25" x2="45" y2="35" stroke="#024a47" strokeWidth="4" strokeLinecap="round" />
          <line x1="65" y1="25" x2="55" y2="35" stroke="#024a47" strokeWidth="4" strokeLinecap="round" />
          <line x1="50" y1="60" x2="50" y2="75" stroke="#024a47" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    );

    const PlugIcon4Prong = () => (
      <div className="w-24 h-24 mx-auto mb-4">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#024a47" strokeWidth="3" />
          <rect x="35" y="25" width="4" height="15" fill="#024a47" rx="2" />
          <rect x="48" y="25" width="4" height="15" fill="#024a47" rx="2" />
          <rect x="61" y="25" width="4" height="15" fill="#024a47" rx="2" />
          <ellipse cx="50" cy="65" rx="8" ry="6" fill="#024a47" />
        </svg>
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                <div className="relative">
                  <svg width="80" height="60" viewBox="0 0 80 60" className="text-[#024a47]">
                    <rect x="10" y="8" width="6" height="12" fill="#4a9b8e" />
                    <polygon points="40,5 70,25 10,25" fill="#024a47" />
                    <rect x="15" y="25" width="50" height="30" fill="#4a9b8e" />
                    <rect x="30" y="35" width="8" height="6" fill="white" stroke="#024a47" strokeWidth="1" />
                    <rect x="42" y="35" width="8" height="6" fill="white" stroke="#024a47" strokeWidth="1" />
                    <circle cx="34" cy="38" r="2" fill="none" stroke="#024a47" strokeWidth="0.5" />
                    <circle cx="46" cy="38" r="2" fill="none" stroke="#024a47" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#024a47] mb-2">RentSimple</h1>
              <p className="text-lg text-gray-600">Rent-to-Own Appliance</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            {isTV ? (
              <>
                <h2 className="text-4xl font-bold text-[#024a47] text-center mb-4">
                  Select TV Size
                </h2>
                <p className="text-center text-gray-600 mb-8">Choose the perfect screen size for your space</p>

                <div className="grid gap-4 max-w-3xl mx-auto">
                  {tvSizes.map((tv) => (
                    <div key={tv.size} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center min-w-[60px]">
                            <div className="text-3xl font-bold text-[#024a47]">{tv.size}</div>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 text-sm">{tv.note}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right mr-4">
                            <div className="text-2xl font-bold text-[#024a47]">${tv.price}</div>
                            <div className="text-sm text-gray-500">/month</div>
                          </div>
                          <button
                            onClick={() => handleTvSize(tv.size)}
                            className="bg-[#024a47] hover:bg-[#035d59] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-[#024a47] text-center mb-12">
                  Select Dryer Plug Type
                </h2>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:shadow-lg transition-all duration-200">
                    <PlugIcon3Prong />
                    <h3 className="text-3xl font-bold text-[#024a47] mb-2">3-Prong</h3>
                    <p className="text-xl text-gray-600 mb-8">220V • USA Homes</p>
                    <button
                      onClick={() => handlePlugSelect('3-prong')}
                      className="w-full bg-[#024a47] hover:bg-[#035d59] text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors duration-200 transform hover:scale-105"
                    >
                      Select
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center hover:shadow-lg transition-all duration-200">
                    <PlugIcon4Prong />
                    <h3 className="text-3xl font-bold text-[#024a47] mb-2">4-Prong</h3>
                    <p className="text-xl text-gray-600 mb-8">220V • USA Homes</p>
                    <button
                      onClick={() => handlePlugSelect('4-prong')}
                      className="w-full bg-[#024a47] hover:bg-[#035d59] text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors duration-200 transform hover:scale-105"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <button onClick={handleCloseCart} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <button onClick={handleCloseCart} className="mt-4 bg-[#024a47] hover:bg-[#024a47] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img className='w-[5rem]' src={item?.photo} alt={item.name} />
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
                      {item.comboItem && (
                        <div className="text-xs text-[#024a47] mt-1">
                          Plug type: {item.comboItem.plugDescription}
                        </div>
                      )}
                      {item.tvSize && (
                        <div className="text-xs text-[#024a47] mt-1">
                          TV Size: {item.tvSize}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-gray-900">${item?.name?.match(/tv/i) ? (item.monthly_price * parseInt(selectedTvSize)) : item.monthly_price}/mo</span>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total Monthly Cost:</span>
                  <span className="text-2xl font-bold text-[#024a47]">${getTotalPrice()}/mo</span>
                </div>
                <div className="flex space-x-4">
                  <button onClick={handleCloseCart} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors">
                    Continue Shopping
                  </button>
                  <button onClick={handleContinue} className="flex-1 bg-[#024a47] hover:bg-[#024a47] text-white py-3 px-6 rounded-lg font-semibold transition-colors">
               {loading?'...Processing':'Proceed to Checkout'}
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
      <ToastContainer containerId={"productsPage"} />
      {showComboPopup ? (
        <ComboPopup
          selectedPlugType={selectedPlugType}
          setSelectedPlugType={setSelectedPlugType}
          showComboPopup={showComboPopup}
          setShowComboPopup={setShowComboPopup}
          selectedComboAppliance={selectedComboAppliance}
          handlePlugTypeSelect={handlePlugTypeSelect}
        />
      ) : (
        <div className="min-h-screen bg-[#f9faf5] p-4 sm:p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {appliances.map((appliance) => (
                <div key={appliance._id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex min-h-[100px] max-h-[250px] justify-center mb-6">
                    <img className='w-[8rem]' src={appliance?.photo} alt={appliance.name} />
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {appliance.name}
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                      ${appliance.monthly_price}/mo
                    </p>

                    {appliance.combo && (
                      <div className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mb-3">
                        COMBO SET
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      {appliance.key_features && appliance.key_features.length > 0 ? (
                        appliance.key_features.map((feature, index) => (
                          <div key={index} className="flex items-center justify-center text-gray-700">
                            <div className="w-2 h-2 bg-[#024a47] rounded-full mr-3"></div>
                            <span className="text-base sm:text-lg">{feature}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center text-gray-500">
                          <span className="text-base sm:text-lg">No features listed</span>
                        </div>
                      )}
                    </div>

                    {appliance.stock_status === 'low' && (
                      <div className="flex items-center justify-center text-gray-500 mb-4">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">Low stock</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelect(appliance)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${selectedAppliances.includes(appliance._id)
                        ? 'bg-[#024a47] text-white'
                        : 'bg-[#024a47] hover:bg-[#024a47] text-white'
                      }`}
                  >
                    {selectedAppliances.includes(appliance._id) ? 'Selected' : 'Select'}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-[#024a47] rounded-2xl p-4 sm:p-6 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="text-white mb-4 sm:mb-0">
                  <span className="text-lg font-semibold">
                    {selectedAppliances.length} item{selectedAppliances.length !== 1 ? 's' : ''} selected
                  </span>
                </div>

                <div className="flex space-x-4">
                  <button onClick={handleViewCart} className="bg-white text-[#024a47] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    View Cart
                  </button>
                  <button
                    onClick={handleContinue}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${selectedAppliances.length > 0
                        ? 'bg-white text-[#024a47] hover:bg-gray-100'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                    disabled={selectedAppliances.length === 0}
                  >
                   {loading?'...Processing':' Continue'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}