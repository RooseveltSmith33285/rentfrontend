// import React from 'react'
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
// import {loadStripe} from '@stripe/stripe-js';
// import {
//   PaymentElement,
//   Elements,
//   ElementsConsumer,
// } from '@stripe/react-stripe-js';
// import { BrowserRouter,Route,Router,Routes } from 'react-router-dom'
// import ApplianceRentalPage from './pages/ApplianceRentalPage.jsx'
// import FreezerTroubleshooting from './pages/FreezerTroubleshooting.jsx'
// import RefrigeratorTroubleshooting from './pages/RefrigeratorTroubleshooting.jsx'
// import DryerTroubleshooting from './pages/DryerTroubleshooting.jsx'
// import WasherTroubleshooting from './pages/WasherTroubleshooting.jsx'
// import TVTroubleshooting from './pages/TVTroubleshooting.jsx'
// import BillingDetailsForm from './pages/BillingDetailsForm.jsx'
// import DeliveryAppointmentPage from './pages/DeliveryAppointmentPage.jsx'
// import ConfirmSubmitPage from './pages/ConfirmSubmitPage.jsx'
// import RentSimpleAccount from './pages/RentSimpleAccount.jsx'
// const stripePromise = loadStripe('pk_test_51OwuO4LcfLzcwwOYdssgGfUSfOgWT1LwO6ewi3CEPewY7WEL9ATqH6WJm3oAcLDA3IgUvVYLVEBMIEu0d8fUwhlw009JwzEYmV');

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Elements stripe={stripePromise}>

   
//    <BrowserRouter>
//    <Routes>
//    <Route path="/" element={<App />} />
//         <Route path="/appliance" element={<ApplianceRentalPage />} />
//         <Route path="/freezer" element={<FreezerTroubleshooting />} />
//         <Route path="/refrigerator" element={<RefrigeratorTroubleshooting />} />
//         <Route path="/dryer" element={<DryerTroubleshooting />} />
//         <Route path="/washer" element={<WasherTroubleshooting />} />
//         <Route path="/tv" element={<TVTroubleshooting />} />
//         <Route path="/billing" element={<BillingDetailsForm/>} />
//         <Route path="/delivery" element={<DeliveryAppointmentPage />} />
//         <Route path="/confirm" element={<ConfirmSubmitPage />} /> 
//         <Route path='/dashboard' element={<RentSimpleAccount/>}/>
//    </Routes>
//    </BrowserRouter>
//    </Elements>
//   </StrictMode>,
// )


import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {loadStripe} from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  ElementsConsumer,
} from '@stripe/react-stripe-js';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'

// User-side imports
import ApplianceRentalPage from './pages/ApplianceRentalPage.jsx'
import FreezerTroubleshooting from './pages/FreezerTroubleshooting.jsx'
import RefrigeratorTroubleshooting from './pages/RefrigeratorTroubleshooting.jsx'
import DryerTroubleshooting from './pages/DryerTroubleshooting.jsx'
import WasherTroubleshooting from './pages/WasherTroubleshooting.jsx'
import TVTroubleshooting from './pages/TVTroubleshooting.jsx'
import BillingDetailsForm from './pages/BillingDetailsForm.jsx'
import DeliveryAppointmentPage from './pages/DeliveryAppointmentPage.jsx'
import ConfirmSubmitPage from './pages/ConfirmSubmitPage.jsx'
import ContactSupport from './pages/Contactsupport.jsx'
import RentSimpleAccount from './pages/RentSimpleAccount.jsx'

// Admin-side imports
import AdminApp from './adminpages/AdminApp.jsx' // We'll create this wrapper component
import AdminDashboard from './adminpages/Dashboard.jsx'
import AdminUserManagement from './adminpages/Usermanagement.jsx'
import AdminSubscriptionManagement from './adminpages/Subscriptionmanagement.jsx'
import AdminInventoryManagement from './adminpages/Inventorymanagement.jsx'
import AdminAnalytics from './adminpages/Analytics.jsx'
import AdminNotifications from './adminpages/Notifications.jsx'
import Resetpassword from './pages/Resetpassword.jsx'
import OrderConfirmation from './pages/Orderconfirmation.jsx'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_SECRET);
// const stripePromise = loadStripe('pk_live_51S9u6U3HVCo3dsX7aXyHuFn9FW8K5HU3re2Bm8GrhjgD2cmUlZC4QVpikr4q0l7Hr8v5W0Dniixb1rr6XEwYNDrQ009SkMpPse');



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <Routes>
          {/* User-side routes */}
          <Route path="/" element={<App />} />
          <Route path="/appliance" element={<ApplianceRentalPage />} />
          <Route path="/freezer" element={<FreezerTroubleshooting />} />
          <Route path="/refrigerator" element={<RefrigeratorTroubleshooting />} />
          <Route path="/dryer" element={<DryerTroubleshooting />} />
          <Route path="/washer" element={<WasherTroubleshooting />} />
          <Route path="/tv" element={<TVTroubleshooting />} />
          <Route path="/billing" element={<BillingDetailsForm/>} />
          <Route path="/delivery" element={<DeliveryAppointmentPage />} />
          <Route path="/confirm" element={<ConfirmSubmitPage />} /> 
          <Route path='/dashboard' element={<RentSimpleAccount/>}/>
<Route path='/reset-password' element={<Resetpassword/>}></Route>
<Route path='/confirmation' element={<OrderConfirmation/>}/>
        <Route path='/contact' element={<ContactSupport/>}/>
          <Route path="/admin/*" element={<AdminApp />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="subscriptions" element={<AdminSubscriptionManagement />} />
            <Route path="inventory" element={<AdminInventoryManagement />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Elements>
  </StrictMode>,
)