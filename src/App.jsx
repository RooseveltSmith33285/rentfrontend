// import { useEffect, useState } from 'react';
// import React from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import axios from 'axios'
// import { BASE_URL } from './baseUrl';
// import { useNavigate, useLocation } from 'react-router-dom';

// export default function App() {
//   const [activeTab, setActiveTab] = useState('signup');
//   const [userType, setUserType] = useState('customer'); // 'customer' or 'vendor'
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     mobile: '',
//     password: ''
//   });

//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       if (formData.name.length == 0 && activeTab != "login") {
//         toast.error("Please enter your name", { containerId: "authPage" })
//         return;
//       } else if (formData.email.length == 0) {
//         toast.error("Please enter your email", { containerId: "authPage" })
//         return
//       } else if (formData.mobile.length == 0 && activeTab != "login") {
//         toast.error("Please enter your mobile number", { containerId: "authPage" })
//         return
//       } else if (formData.password.length == 0) {
//         toast.error("Please enter your password", { containerId: "authPage" })
//         return
//       }

//       let response;
//       if (activeTab != "login") {
//         // Determine endpoint based on user type
//         const endpoint = userType === 'vendor' ? '/vendor/register' : '/register';
//         response = await axios.post(`${BASE_URL}${endpoint}`, formData)
//       } else {
//         // Determine login endpoint based on user type
//         const endpoint = userType === 'vendor' ? '/vendor/login' : '/login';
//         response = await axios.post(`${BASE_URL}${endpoint}`, formData)
//       }

//       console.log(response.data)
//       toast.dismiss();
//       toast.success(response.data.message, { containerId: "authPage" })
//       localStorage.setItem("token", response.data.token)
//       localStorage.setItem("userType", userType) // Store user type
//       localStorage.removeItem('cartItems')
      
//       // Navigate based on user type
//       if (userType === 'vendor') {
//         navigate('/vendor/dashboard') // or your vendor dashboard route
//       } else {
//         navigate('/appliance')
//       }
//     } catch (e) {
//       console.log(e)
//       if (e?.response?.data?.error) {
//         toast.dismiss();
//         toast.error(e?.response?.data?.error, { containerId: "authPage" })
//       } else {
//         toast.dismiss();
//         toast.error("Error while authenticating please try again", { containerId: "authPage" })
//       }
//     }
//   };

//   useEffect(() => {
//     check();
//   }, [])

//   const check = () => {
//     const params = new URLSearchParams(location.search)
//     const login = params.get('login')
//     const vendor = params.get('vendor')
    
//     if (login) {
//       setActiveTab('login')
//     }
//     if (vendor) {
//       setUserType('vendor')
//     }
//   }

//   return (
//     <>
//       <ToastContainer containerId={"authPage"} />
//       <div className="min-h-screen bg-[#f3f4e6] flex flex-col items-center justify-center p-4">
//         <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
//           {/* Header with Logo */}
//           <div className="bg-white px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center">
//             <div className="mb-3 sm:mb-4">
//               <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-[#024a47] rounded-lg mb-2">
//                 <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor">
//                   <path d="M19 9.3V4h-3v2.6L12 3L2 12h3v8h6v-6h2v6h6v-8h3L19 9.3z" />
//                   <circle cx="8" cy="16" r="1" />
//                   <circle cx="16" cy="16" r="1" />
//                   <rect x="6" y="14" width="4" height="1" />
//                   <rect x="14" y="14" width="4" height="1" />
//                 </svg>
//               </div>
//             </div>
//             <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#024a47] mb-1">RentSimple</h1>
//             <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#024a47]">Rent-to-Own Appliance</p>
//           </div>

//           {/* Create Account / Log In Title */}
//           <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
//             <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#024a47] text-center">
//               Create Account / Log In
//             </h2>
//           </div>

//           {/* User Type Toggle */}
//           <div className="px-4 sm:px-6 md:px-8 pb-4">
//             <div className="bg-gray-100 rounded-lg p-1 flex">
//               <button
//                 onClick={() => setUserType('customer')}
//                 className={`flex-1 cursor-pointer py-2 px-3 rounded-md font-semibold transition-all ${
//                   userType === 'customer' 
//                     ? 'bg-white text-[#024a47] shadow-md' 
//                     : 'text-gray-600 hover:text-[#024a47]'
//                 }`}
//               >
//                 Customer
//               </button>
//               <button
//                 onClick={() => setUserType('vendor')}
//                 className={`flex-1 cursor-pointer py-2 px-3 rounded-md font-semibold transition-all ${
//                   userType === 'vendor' 
//                     ? 'bg-white text-[#024a47] shadow-md' 
//                     : 'text-gray-600 hover:text-[#024a47]'
//                 }`}
//               >
//                 Vendor
//               </button>
//             </div>
//           </div>

//           {/* Tab Toggle */}
//           <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6">
//             <div className="bg-[#024a47] rounded-lg p-1 flex">
//               <button
//                 onClick={() => setActiveTab('signup')}
//                 className={`flex-1 cursor-pointer py-3 px-4 rounded-md font-semibold text-white transition-all ${
//                   activeTab === 'signup' ? 'bg-[#035d59] shadow-md' : 'bg-[#024a47] hover:bg-[#035d59]'
//                 }`}
//               >
//                 Sign Up
//               </button>
//               <button
//                 onClick={() => setActiveTab('login')}
//                 className={`flex-1 cursor-pointer py-3 px-4 rounded-md font-semibold text-white transition-all ${
//                   activeTab === 'login' ? 'bg-[#035d59] shadow-md' : 'bg-[#024a47] hover:bg-[#035d59]'
//                 }`}
//               >
//                 Log In
//               </button>
//             </div>
//           </div>

//           {/* Sign Up Section */}
//           <div className="px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center mb-4 sm:mb-6">
//               <div className="flex-grow h-px bg-gray-300"></div>
//               <span className="px-3 sm:px-4 text-base sm:text-lg lg:text-xl font-semibold text-[#024a47]">
//                 {activeTab == "login" ? "Log In" : "Sign Up"} as {userType === 'vendor' ? 'Vendor' : 'Customer'}
//               </span>
//               <div className="flex-grow h-px bg-gray-300"></div>
//             </div>

//             <div className="space-y-3 sm:space-y-4">
//               {activeTab != "login" ? <>
//                 <div>
//                   <input
//                     type="text"
//                     name="name"
//                     placeholder="Full Name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] text-base sm:text-lg"
//                   />
//                 </div>
//               </> : ''}

//               <div>
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email Address"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] text-base sm:text-lg"
//                 />
//               </div>

//               {activeTab != "login" ? <>
//                 <div>
//                   <input
//                     type="tel"
//                     name="mobile"
//                     placeholder="Mobile Number"
//                     value={formData.mobile}
//                     onChange={handleInputChange}
//                     className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] text-base sm:text-lg"
//                   />
//                 </div>
//               </> : ''}

//               <div>
//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="Password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] text-base sm:text-lg"
//                 />
//               </div>

//               <div className="pt-3 sm:pt-4 pb-6 sm:pb-8">
//                 <div className='flex flex-row items-between justify-between mb-4'>
//                   <p onClick={() => {
//                     navigate('/reset-password')
//                   }} className='cursor-pointer underline text-[#024a47] hover:text-[#035d59]'>
//                     Reset Password
//                   </p>

//                   <p onClick={() => {
//                     navigate('/contact')
//                   }} className='cursor-pointer underline text-[#024a47] hover:text-[#035d59]'>
//                     Support
//                   </p>
//                 </div>

//                 <button
//                   onClick={handleSubmit}
//                   className="w-full cursor-pointer bg-[#024a47] hover:bg-[#035d59] text-white font-semibold py-3 sm:py-4 px-4 rounded-lg transition-colors text-base sm:text-lg lg:text-xl"
//                 >
//                   {activeTab == "login" ? "Log In" : "Sign Up"} as {userType === 'vendor' ? 'Vendor' : 'Customer'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


import { act, useEffect, useState } from 'react';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios'
import { BASE_URL } from './baseUrl';
import { useNavigate,useLocation } from 'react-router-dom';

export default function App() {
  const [activeTab, setActiveTab] = useState('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });

  const navigate=useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const location=useLocation();

  const handleSubmit = async(e) => {
   
    e.preventDefault();
   
   try{
    if(formData.name.length==0 && activeTab!="login"){
      toast.error("Please enter your name",{containerId:"authPage"})
      return;
    }else if(formData.email.length==0){
      toast.error("Please enter your email",{containerId:"authPage"})
      return
    }else if(formData.mobile.length==0 && activeTab!="login"){
toast.error("Please enter your mobile number",{containerId:"authPage"})
return
    }else if(formData.password.length==0){
toast.error("Please enter your password",{containerId:"authPage"})
return
    }
let response;
if(activeTab!="login"){
  response=await axios.post(`${BASE_URL}/register`,formData)
}else{
  response=await axios.post(`${BASE_URL}/login`,formData)
}
console.log(response.data)
toast.dismiss(); 
toast.success(response.data.message,{containerId:"authPage"})
localStorage.setItem("token",response.data.token)
localStorage.removeItem('cartItems')
navigate('/appliance')
   }catch(e){
    console.log(e)
    if(e?.response?.data?.error){
      toast.dismiss(); 
      toast.error(e?.response?.data?.error,{containerId:"authPage"})
    }else{
      toast.dismiss(); 
      toast.error("Error while authenticating please try again",{containerId:"authPage"})
    }
   }
  };

  useEffect(()=>{
check();
  },[])
  const check=()=>{
    const params=new URLSearchParams(location.search)
const login=params.get('login')
if(login){
  setActiveTab('login')

}
  }
  return (
    <>
    <ToastContainer containerId={"authPage"}/>
    <div className="min-h-screen bg-[#f3f4e6] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl bg-white rounded-lg shadow-lg overflow-hidden mx-auto">
        {/* Header with Logo */}
        <div className="bg-white px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 text-center">
          <div className="mb-3 sm:mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-[#024a47] rounded-lg mb-2">
              <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" fill="currentColor">
                <path d="M19 9.3V4h-3v2.6L12 3L2 12h3v8h6v-6h2v6h6v-8h3L19 9.3z"/>
                <circle cx="8" cy="16" r="1"/>
                <circle cx="16" cy="16" r="1"/>
                <rect x="6" y="14" width="4" height="1"/>
                <rect x="14" y="14" width="4" height="1"/>
              </svg>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#024a47] mb-1">RentSimple</h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#024a47]">Rent-to-Own Appliance</p>
        </div>

        {/* Create Account / Log In Title */}
        <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#024a47] text-center">
            Create Account / Log In
          </h2>
        </div>

        {/* Tab Toggle */}
        <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6">
          <div className="bg-[#024a47] rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('signup')}
             
              className={`flex-1 cursor-pointer py-3 px-4 rounded-md font-semibold text-white transition-all ${
                activeTab === 'signup' ? 'bg-[#024a47] shadow-md' : 'bg-[#024a47] hover:bg-[#024a47]'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 cursor-pointer py-3 px-4 rounded-md font-semibold text-white transition-all ${
                activeTab === 'login' ? 'bg-[#024a47] shadow-md' : 'bg-[#024a47] hover:bg-[#024a47]'
              }`}
            >
              Log In
            </button>
          </div>
        </div>

        {/* Sign Up Section */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 sm:px-4 text-base sm:text-lg lg:text-xl font-semibold text-[#024a47]">{activeTab=="login"?"Log In":"Sign Up"}</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <div className="space-y-3 sm:space-y-4">
           {activeTab!="login"?<>
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] text-base sm:text-lg"
              />
            </div>
           </>:''}

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] text-base sm:text-lg"
              />
            </div>

        {activeTab!="login"?<>
          <div>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] text-base sm:text-lg"
              />
            </div>
        </>:''}

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-3 sm:py-4 text-gray-700 placeholder-gray-400 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] text-base sm:text-lg"
              />
            </div>

            <div className="pt-3 sm:pt-4 pb-6 sm:pb-8">
              <div className='flex flex-row items-between justify-between mb-4'>
                <p onClick={()=>{
                  navigate('/reset-password')
                }} className='cursor-pointer underline text-[#024a47] hover:text-[#035d59]'>
                  Reset Password
                </p>

                <p onClick={()=>{
                  navigate('/contact')
                }} className='cursor-pointer underline text-[#024a47] hover:text-[#035d59]'>
                  Support
                </p>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full cursor-pointer bg-[#024a47] hover:bg-[#035d59] text-white font-semibold py-3 sm:py-4 px-4 rounded-lg transition-colors text-base sm:text-lg lg:text-xl mb-3"
              >
                {activeTab=="login"?"Log In":"Sign Up"}
              </button>

              {/* Vendor Login Button */}
              <button
                onClick={() => navigate('/vendorlogin')}
                className="w-full cursor-pointer bg-white hover:bg-gray-50 text-[#024a47] font-semibold py-3 sm:py-4 px-4 rounded-lg border-2 border-[#024a47] transition-colors text-base sm:text-lg lg:text-xl flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Register/Login as Vendor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
   
  );
}