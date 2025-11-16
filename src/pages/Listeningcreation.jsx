// import React, { useState, useEffect } from "react";
// import { X, Upload, Check, AlertCircle } from "lucide-react";
// import { ToastContainer, toast } from 'react-toastify';
// import axios from 'axios';
// import { BASE_URL } from '../baseUrl';
// import { useNavigate } from 'react-router-dom';

// function ListingCreationFlow() {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [formData, setFormData] = useState({
//     title: '',
//     category: '',
//     brand: '',
//     condition: '',
//     rentPrice: '',
//     buyPrice: '',
//     description: '',
//     listAsActive: true,
//     publishToFeed: false,
//     location: {
//       city: '',
//       state: '',
//       zipCode: ''
//     }
//   });

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData({
//         ...formData,
//         [parent]: {
//           ...formData[parent],
//           [child]: value
//         }
//       });
//     } else {
//       setFormData({
//         ...formData,
//         [name]: type === 'checkbox' ? checked : value
//       });
//     }
//   };

//   // Handle image file selection
//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
    
//     if (imageFiles.length + files.length > 5) {
//       toast.error('Maximum 5 images allowed', { containerId: 'listingPage' });
//       return;
//     }

//     // Validate file size (10MB max)
//     const validFiles = files.filter(file => {
//       if (file.size > 10 * 1024 * 1024) {
//         toast.error(`${file.name} is too large. Max 10MB per image`, { containerId: 'listingPage' });
//         return false;
//       }
//       return true;
//     });

//     setImageFiles([...imageFiles, ...validFiles]);

//     // Create previews
//     validFiles.forEach(file => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreviews(prev => [...prev, reader.result]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   // Remove image
//   const removeImage = (index) => {
//     setImageFiles(imageFiles.filter((_, i) => i !== index));
//     setImagePreviews(imagePreviews.filter((_, i) => i !== index));
//   };

//   // Upload images to server/cloud
//   const uploadImages = async () => {
//     if (imageFiles.length === 0) return [];

//     const uploadedImages = [];
    
//     for (let file of imageFiles) {
//       const formData = new FormData();
//       formData.append('image', file);

//       try {
//         // Replace with your actual image upload endpoint
//         const response = await axios.post(`${BASE_URL}/upload-image`, formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//             'Authorization': `Bearer ${localStorage.getItem('token')}`
//           }
//         });

//         uploadedImages.push({
//           url: response.data.url,
//           publicId: response.data.publicId,
//           isPrimary: uploadedImages.length === 0
//         });
//       } catch (error) {
//         console.error('Image upload error:', error);
//         toast.error('Failed to upload image', { containerId: 'listingPage' });
//       }
//     }

//     return uploadedImages;
//   };

//   // Validate form data
//   const validateStep = () => {
//     if (step === 1) {
//       if (!formData.title.trim()) {
//         toast.error('Please enter a listing title', { containerId: 'listingPage' });
//         return false;
//       }
//       if (!formData.category) {
//         toast.error('Please select a category', { containerId: 'listingPage' });
//         return false;
//       }
//       if (!formData.brand.trim()) {
//         toast.error('Please enter the brand', { containerId: 'listingPage' });
//         return false;
//       }
//       if (!formData.condition) {
//         toast.error('Please select the condition', { containerId: 'listingPage' });
//         return false;
//       }
//     }

//     if (step === 2) {
//       if (!formData.rentPrice || formData.rentPrice <= 0) {
//         toast.error('Please enter a valid rent price', { containerId: 'listingPage' });
//         return false;
//       }
//       if (!formData.buyPrice || formData.buyPrice <= 0) {
//         toast.error('Please enter a valid buy price', { containerId: 'listingPage' });
//         return false;
//       }
//       if (imageFiles.length === 0) {
//         toast.error('Please upload at least one image', { containerId: 'listingPage' });
//         return false;
//       }
//     }

//     if (step === 3) {
//       if (!formData.description.trim()) {
//         toast.error('Please enter a description', { containerId: 'listingPage' });
//         return false;
//       }
//       if (formData.description.length < 50) {
//         toast.error('Description must be at least 50 characters', { containerId: 'listingPage' });
//         return false;
//       }
//     }

//     return true;
//   };

//   // Handle next step
//   const handleNext = () => {
//     if (validateStep()) {
//       setStep(step + 1);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async () => {
//     if (!validateStep()) return;

//     setLoading(true);

//     try {
//       // Upload images first
//       toast.info('Uploading images...', { containerId: 'listingPage' });
//       const images = await uploadImages();

//       // Prepare listing data
//       const listingData = {
//         title: formData.title,
//         category: formData.category,
//         brand: formData.brand,
//         condition: formData.condition,
//         rentPrice: parseFloat(formData.rentPrice),
//         buyPrice: parseFloat(formData.buyPrice),
//         description: formData.description,
//         images,
//         listAsActive: formData.listAsActive,
//         publishToFeed: formData.publishToFeed,
//         location: formData.location
//       };

//       // Submit to API
//       const response = await axios.post(
//         `${BASE_URL}/listings`,
//         listingData,
//         {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       toast.dismiss();
//       toast.success(response.data.message || 'Listing created successfully!', {
//         containerId: 'listingPage'
//       });

//       // Redirect after 1.5 seconds
//       setTimeout(() => {
//         navigate('/vendordashboard');
//       }, 1500);

//     } catch (error) {
//       console.error('Create listing error:', error);
//       toast.dismiss();
      
//       if (error?.response?.data?.error) {
//         toast.error(error.response.data.error, { containerId: 'listingPage' });
//       } else {
//         toast.error('Failed to create listing. Please try again.', {
//           containerId: 'listingPage'
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <ToastContainer containerId="listingPage" />
//       <div className="min-h-screen pb-20 bg-[#f3f4e6]">
//         <header className="bg-white shadow-sm">
//           <div className="max-w-3xl mx-auto px-4 py-4">
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={() => navigate('/vendordashboard')}
//                 className="text-gray-600 hover:text-[#024a47]"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//               <h1 className="text-2xl font-bold text-[#024a47]">Create New Listing</h1>
//             </div>
//           </div>
//         </header>

//         <div className="max-w-3xl mx-auto px-4 py-8">
//           {/* Progress Indicator */}
//           <div className="flex items-center justify-between mb-8">
//             {[1, 2, 3].map((s) => (
//               <div key={s} className="flex items-center flex-1">
//                 <div
//                   className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
//                     step >= s ? 'bg-[#024a47] text-white' : 'bg-gray-200 text-gray-600'
//                   }`}
//                 >
//                   {step > s ? <Check className="w-5 h-5" /> : s}
//                 </div>
//                 {s < 3 && (
//                   <div
//                     className={`flex-1 h-1 mx-2 transition-all ${
//                       step > s ? 'bg-[#024a47]' : 'bg-gray-200'
//                     }`}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             {/* Step 1: Basic Information */}
//             {step === 1 && (
//               <div className="space-y-4">
//                 <h2 className="text-xl font-bold text-[#024a47] mb-4">
//                   Basic Information
//                 </h2>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Listing Title *
//                   </label>
//                   <input
//                     type="text"
//                     name="title"
//                     value={formData.title}
//                     onChange={handleInputChange}
//                     placeholder="e.g., Samsung 5.0 Cu. Ft. Refrigerator"
//                     className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Category *
//                     </label>
//                     <select
//                       name="category"
//                       value={formData.category}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
//                     >
//                       <option value="">Select category</option>
//                       <option value="refrigerator">Refrigerator</option>
//                       <option value="washer">Washing Machine</option>
//                       <option value="dryer">Dryer</option>
//                       <option value="dishwasher">Dishwasher</option>
//                       <option value="oven">Oven</option>
//                       <option value="microwave">Microwave</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Brand *
//                     </label>
//                     <input
//                       type="text"
//                       name="brand"
//                       value={formData.brand}
//                       onChange={handleInputChange}
//                       placeholder="e.g., Samsung"
//                       className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Condition *
//                   </label>
//                   <div className="grid grid-cols-3 gap-3">
//                     {['New', 'Like New', 'Good'].map((cond) => (
//                       <button
//                         key={cond}
//                         type="button"
//                         onClick={() =>
//                           setFormData({ ...formData, condition: cond })
//                         }
//                         className={`py-3 rounded-lg font-semibold transition-all ${
//                           formData.condition === cond
//                             ? 'bg-[#024a47] text-white'
//                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                         }`}
//                       >
//                         {cond}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       City
//                     </label>
//                     <input
//                       type="text"
//                       name="location.city"
//                       value={formData.location.city}
//                       onChange={handleInputChange}
//                       placeholder="City"
//                       className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       State
//                     </label>
//                     <input
//                       type="text"
//                       name="location.state"
//                       value={formData.location.state}
//                       onChange={handleInputChange}
//                       placeholder="State"
//                       className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       ZIP Code
//                     </label>
//                     <input
//                       type="text"
//                       name="location.zipCode"
//                       value={formData.location.zipCode}
//                       onChange={handleInputChange}
//                       placeholder="ZIP"
//                       className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Pricing & Images */}
//             {step === 2 && (
//               <div className="space-y-4">
//                 <h2 className="text-xl font-bold text-[#024a47] mb-4">
//                   Pricing & Images
//                 </h2>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Monthly Rent Price *
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-4 top-3 text-gray-600">$</span>
//                       <input
//                         type="number"
//                         name="rentPrice"
//                         value={formData.rentPrice}
//                         onChange={handleInputChange}
//                         placeholder="49.99"
//                         step="0.01"
//                         min="0"
//                         className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Buy Now Price *
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-4 top-3 text-gray-600">$</span>
//                       <input
//                         type="number"
//                         name="buyPrice"
//                         value={formData.buyPrice}
//                         onChange={handleInputChange}
//                         placeholder="599.99"
//                         step="0.01"
//                         min="0"
//                         className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Upload Images * (Max 5 images, 10MB each)
//                   </label>
//                   <input
//                     type="file"
//                     id="image-upload"
//                     multiple
//                     accept="image/png,image/jpeg,image/jpg"
//                     onChange={handleImageChange}
//                     className="hidden"
//                   />
//                   <label
//                     htmlFor="image-upload"
//                     className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#024a47] transition-colors cursor-pointer block"
//                   >
//                     <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-600 mb-2">
//                       Click to upload or drag and drop
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       PNG, JPG up to 10MB (max 5 images)
//                     </p>
//                   </label>

//                   {/* Image Previews */}
//                   {imagePreviews.length > 0 && (
//                     <div className="grid grid-cols-5 gap-3 mt-4">
//                       {imagePreviews.map((preview, index) => (
//                         <div key={index} className="relative group">
//                           <img
//                             src={preview}
//                             alt={`Preview ${index + 1}`}
//                             className="w-full h-24 object-cover rounded-lg"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => removeImage(index)}
//                             className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                           >
//                             <X className="w-4 h-4" />
//                           </button>
//                           {index === 0 && (
//                             <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
//                               Primary
//                             </span>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Description & Publish */}
//             {step === 3 && (
//               <div className="space-y-4">
//                 <h2 className="text-xl font-bold text-[#024a47] mb-4">
//                   Description & Publish
//                 </h2>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Description * (Min 50 characters)
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     rows="6"
//                     placeholder="Describe the appliance, its features, and condition..."
//                     className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] resize-none"
//                   />
//                   <p className="text-sm text-gray-500 mt-1">
//                     {formData.description.length} / 2000 characters
//                   </p>
//                 </div>

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <h3 className="font-semibold text-blue-900 mb-2">
//                     Publishing Options
//                   </h3>
//                   <div className="space-y-2">
//                     <label className="flex items-center space-x-3 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         name="listAsActive"
//                         checked={formData.listAsActive}
//                         onChange={handleInputChange}
//                         className="w-5 h-5 text-[#024a47] rounded"
//                       />
//                       <span className="text-sm text-gray-700">
//                         List immediately as Active
//                       </span>
//                     </label>
//                     <label className="flex items-center space-x-3 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         name="publishToFeed"
//                         checked={formData.publishToFeed}
//                         onChange={handleInputChange}
//                         className="w-5 h-5 text-[#024a47] rounded"
//                       />
//                       <span className="text-sm text-gray-700">
//                         Post announcement to community feed
//                       </span>
//                     </label>
//                   </div>
//                 </div>

//                 {/* Summary */}
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Title:</span>
//                       <span className="font-semibold">{formData.title}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Category:</span>
//                       <span className="font-semibold capitalize">
//                         {formData.category}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Rent Price:</span>
//                       <span className="font-semibold text-green-600">
//                         ${formData.rentPrice}/mo
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Buy Price:</span>
//                       <span className="font-semibold text-blue-600">
//                         ${formData.buyPrice}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600">Images:</span>
//                       <span className="font-semibold">
//                         {imageFiles.length} uploaded
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Navigation Buttons */}
//             <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
//               {step > 1 && (
//                 <button
//                   onClick={() => setStep(step - 1)}
//                   disabled={loading}
//                   className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Back
//                 </button>
//               )}
//               {step < 3 ? (
//                 <button
//                   onClick={handleNext}
//                   className="ml-auto px-6 py-3 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-all"
//                 >
//                   Continue
//                 </button>
//               ) : (
//                 <button
//                   onClick={handleSubmit}
//                   disabled={loading}
//                   className="ml-auto px-6 py-3 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       <span>Creating...</span>
//                     </>
//                   ) : (
//                     <span>Publish Listing</span>
//                   )}
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default ListingCreationFlow;









import React, { useState } from "react";
import { X, Upload, Check, ExternalLink, CreditCard, AlertCircle } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../baseUrl";

// Stripe Onboarding Popup Component
const StripeOnboardingPopup = ({ isOpen, onClose, onboardingUrl, accountId }) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    window.location.href = onboardingUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Complete Your Stripe Setup First
          </h2>
          <p className="text-gray-600 mb-4">
            Before creating listings, you need to complete your Stripe account setup to receive payments. This will only take a few minutes.
          </p>
          
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3 text-left">
              <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">What you'll need:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Bank account details</li>
                  <li>Business or personal information</li>
                  <li>Tax ID (SSN or EIN)</li>
                </ul>
              </div>
            </div>
          </div>

          {accountId && (
            <p className="text-xs text-gray-500 mb-4">
              Account ID: {accountId}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            Continue to Stripe
            <ExternalLink className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            I'll do this later
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          🔒 Secured by Stripe. Your information is safe and encrypted.
        </p>
      </div>
    </div>
  );
};

function ListingCreationFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Stripe onboarding state
  const [showStripePopup, setShowStripePopup] = useState(false);
  const [stripeOnboardingData, setStripeOnboardingData] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    brand: '',
    condition: '',
    rentPrice: '',
    buyPrice: '',
    description: '',
    listAsActive: true,
    publishToFeed: false,
    location: {
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (imageFiles.length + files.length > 5) {
      toast.error('Maximum 5 images allowed', { containerId: 'listingPage' });
      return;
    }

    // Validate file size (10MB max)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 10MB per image`, { containerId: 'listingPage' });
        return false;
      }
      return true;
    });

    setImageFiles([...imageFiles, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Upload images to server/cloud
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    const uploadedImages = [];
    
    for (let file of imageFiles) {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post(`${BASE_URL}/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        uploadedImages.push({
          url: response.data.url,
          publicId: response.data.publicId,
          isPrimary: uploadedImages.length === 0
        });
      } catch (error) {
        console.error('Image upload error:', error);
        toast.error('Failed to upload image', { containerId: 'listingPage' });
      }
    }

    return uploadedImages;
  };

  // Check Stripe onboarding status
  const checkStripeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${BASE_URL}/generateStripeOnboardingLink`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;

      // If already connected, return true to continue
      if (data.alreadyConnected) {
        return true;
      }

      // If onboarding needed, show popup and return false
      if (data.onboardingUrl) {
        setStripeOnboardingData(data);
        setShowStripePopup(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking Stripe status:', error);
      
      // If error checking, show warning but allow to continue
      if (error?.response?.status === 404) {
        toast.error('Vendor not found', { containerId: 'listingPage' });
        return false;
      }
      
      // For other errors, show warning but don't block
      toast.warning('Could not verify payment setup. Please ensure Stripe is configured.', {
        containerId: 'listingPage'
      });
      return true;
    }
  };

  // Validate form data
  const validateStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter a listing title', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.category) {
        toast.error('Please select a category', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.brand.trim()) {
        toast.error('Please enter the brand', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.condition) {
        toast.error('Please select the condition', { containerId: 'listingPage' });
        return false;
      }
    }

    if (step === 2) {
      if (!formData.rentPrice || formData.rentPrice <= 0) {
        toast.error('Please enter a valid rent price', { containerId: 'listingPage' });
        return false;
      }
      if (!formData.buyPrice || formData.buyPrice <= 0) {
        toast.error('Please enter a valid buy price', { containerId: 'listingPage' });
        return false;
      }
      if (imageFiles.length === 0) {
        toast.error('Please upload at least one image', { containerId: 'listingPage' });
        return false;
      }
    }

    if (step === 3) {
      if (!formData.description.trim()) {
        toast.error('Please enter a description', { containerId: 'listingPage' });
        return false;
      }
      if (formData.description.length < 50) {
        toast.error('Description must be at least 50 characters', { containerId: 'listingPage' });
        return false;
      }
    }

    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  // Handle form submission with Stripe check
  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);

    try {
      // 🎯 CHECK STRIPE STATUS FIRST
      toast.info('Checking payment setup...', { containerId: 'listingPage' });
      const stripeReady = await checkStripeStatus();
      
      if (!stripeReady) {
        toast.dismiss();
        setLoading(false);
        return; // Stop submission if Stripe not ready
      }

      // Upload images
      toast.info('Uploading images...', { containerId: 'listingPage' });
      const images = await uploadImages();

      // Prepare listing data
      const listingData = {
        title: formData.title,
        category: formData.category,
        brand: formData.brand,
        condition: formData.condition,
        rentPrice: parseFloat(formData.rentPrice),
        buyPrice: parseFloat(formData.buyPrice),
        description: formData.description,
        images,
        listAsActive: formData.listAsActive,
        publishToFeed: formData.publishToFeed,
        location: formData.location
      };

      // Submit to API
      const response = await axios.post(
        `${BASE_URL}/listings`,
        listingData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.dismiss();
      toast.success(response.data.message || 'Listing created successfully!', {
        containerId: 'listingPage'
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/vendordashboard');
      }, 1500);

    } catch (error) {
      console.error('Create listing error:', error);
      toast.dismiss();
      
      if (error?.response?.data?.error) {
        toast.error(error.response.data.error, { containerId: 'listingPage' });
      } else {
        toast.error('Failed to create listing. Please try again.', {
          containerId: 'listingPage'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer containerId="listingPage" />
      
      {/* Stripe Onboarding Popup */}
      <StripeOnboardingPopup
        isOpen={showStripePopup}
        onClose={() => setShowStripePopup(false)}
        onboardingUrl={stripeOnboardingData?.onboardingUrl}
        accountId={stripeOnboardingData?.accountId}
      />
      
      <div className="min-h-screen pb-20 bg-[#f3f4e6]">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/vendordashboard')}
                className="text-gray-600 hover:text-[#024a47]"
              >
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-[#024a47]">Create New Listing</h1>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s ? 'bg-[#024a47] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step > s ? 'bg-[#024a47]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#024a47] mb-4">
                  Basic Information
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Samsung 5.0 Cu. Ft. Refrigerator"
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    >
                      <option value="">Select category</option>
                      <option value="refrigerator">Refrigerator</option>
                      <option value="washer">Washing Machine</option>
                      <option value="dryer">Dryer</option>
                      <option value="dishwasher">Dishwasher</option>
                      <option value="oven">Oven</option>
                      <option value="microwave">Microwave</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="e.g., Samsung"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Condition *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['New', 'Like New', 'Good'].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, condition: cond })
                        }
                        className={`py-3 rounded-lg font-semibold transition-all ${
                          formData.condition === cond
                            ? 'bg-[#024a47] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleInputChange}
                      placeholder="ZIP"
                      className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pricing & Images */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#024a47] mb-4">
                  Pricing & Images
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monthly Rent Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-600">$</span>
                      <input
                        type="number"
                        name="rentPrice"
                        value={formData.rentPrice}
                        onChange={handleInputChange}
                        placeholder="49.99"
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Buy Now Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-600">$</span>
                      <input
                        type="number"
                        name="buyPrice"
                        value={formData.buyPrice}
                        onChange={handleInputChange}
                        placeholder="599.99"
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Images * (Max 5 images, 10MB each)
                  </label>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#024a47] transition-colors cursor-pointer block"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG up to 10MB (max 5 images)
                    </p>
                  </label>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-3 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Description & Publish */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-[#024a47] mb-4">
                  Description & Publish
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description * (Min 50 characters)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Describe the appliance, its features, and condition..."
                    className="w-full px-4 py-3 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#024a47] resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length} / 2000 characters
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Publishing Options
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="listAsActive"
                        checked={formData.listAsActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-[#024a47] rounded"
                      />
                      <span className="text-sm text-gray-700">
                        List immediately as Active
                      </span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="publishToFeed"
                        checked={formData.publishToFeed}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-[#024a47] rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Post announcement to community feed
                      </span>
                    </label>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Title:</span>
                      <span className="font-semibold">{formData.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold capitalize">
                        {formData.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent Price:</span>
                      <span className="font-semibold text-green-600">
                        ${formData.rentPrice}/mo
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Buy Price:</span>
                      <span className="font-semibold text-blue-600">
                        ${formData.buyPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Images:</span>
                      <span className="font-semibold">
                        {imageFiles.length} uploaded
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="ml-auto px-6 py-3 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-all"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto px-6 py-3 bg-[#024a47] text-white rounded-lg font-semibold hover:bg-[#035d59] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Publish Listing</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ListingCreationFlow;