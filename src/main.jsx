// main.jsx - FIXED ROUTING
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
import { BrowserRouter, Route, Routes } from 'react-router-dom'

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
import Resetpassword from './pages/Resetpassword.jsx'
import OrderConfirmation from './pages/Orderconfirmation.jsx'

// Admin-side imports
import AdminLogin from './adminpages/Login.jsx'
import AdminApp from './adminpages/AdminApp.jsx'
import AdminDashboard from './adminpages/Dashboard.jsx'
import AdminUserManagement from './adminpages/Usermanagement.jsx'
import AdminSubscriptionManagement from './adminpages/Subscriptionmanagement.jsx'
import AdminInventoryManagement from './adminpages/Inventorymanagement.jsx'
import AdminAnalytics from './adminpages/Analytics.jsx'
import AdminNotifications from './adminpages/Notifications.jsx'
import Middleware from './adminpages/Middleware.jsx'
import AdminReset from './adminpages/Reset.jsx'
import VendorDashboard from './pages/Vendordashboard.jsx'
import SubscriptionComponent from './pages/SubscriptionComponent.jsx'
import FeedDisplay from './pages/FeedDisplay.jsx'
import BoostingInterface from './pages/Boostinginterface.jsx'
import CommunityComposer from './pages/CommunityComposer.jsx'
import ListingCreationFlow from './pages/Listeningcreation.jsx'
import VendorLogin from './vendor/vendorlogin.jsx'
import VendorSignup from './vendor/vendorsignup.jsx'
import VendorResetPassword from './vendor/vendorresetpassword.jsx'
import CommunityPostPage from './vendor/communitypage.jsx'
import VendorFeed from './vendor/vendorfeed.jsx'
import UpdateListing from './vendor/updatelistening.jsx'
import BoostListingPage from './vendor/boost.jsx'
import ChatPage from './vendor/chat.jsx'
import VendorCommunityFeed from './vendor/feed.jsx'
import IndividualPostPage from './vendor/indivisualpost.jsx'
import UnitPurchasePage from './pages/renterconfirmationpage.jsx'
import UserChatPage from './pages/chat.jsx'
import SocketProvider from './context/socketContext.jsx'
import VendorRequestsListPage from './vendor/vendorrequestlist.jsx'
import RenterDashboard from './pages/renterdashboard.jsx'
import AdminRegister from './adminpages/Register.jsx'
import VendorManagement from './adminpages/vendormanagement.jsx'
import RentalsManagement from './adminpages/rentals.jsx'
import AdminChatPage from './adminpages/chat.jsx'
import VendorSupportChatWidget from './vendor/vendoradminchat.jsx'
import AdminSocketProvider from './context/adminSocketContext.jsx'
import ProtectedRoute from './components/UserMiddleware.jsx'
import VendorProtectedRoute from './components/vendorMiddleware.jsx'
import VendorProfile from './vendor/vendorprofile.jsx'
import UserProfile from './pages/userprofile.jsx'
import ActiveRentals from './vendor/activeRentals.jsx'

const stripePromise = loadStripe("pk_test_51OwuO4LcfLzcwwOYdssgGfUSfOgWT1LwO6ewi3CEPewY7WEL9ATqH6WJm3oAcLDA3IgUvVYLVEBMIEu0d8fUwhlw009JwzEYmV");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Elements stripe={stripePromise}>
    <SocketProvider>
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
        <Route element={<ProtectedRoute/>}>
        <Route path='/renterDashboard' element={<RenterDashboard/>}/>
        <Route path='/profile' element={<UserProfile/>}/>
        <Route path="/appliance" element={<ApplianceRentalPage />} />
        <Route path='/userchat' element={<UserChatPage/>}/>
        <Route path='/renterconfirmation' element={<UnitPurchasePage/>}/>
        </Route>
        <Route element={<VendorProtectedRoute/>}>
        <Route path='/activerentals' element={<ActiveRentals/>}/>
        <Route path='/vendorprofile' element={<VendorProfile/>}/>
        <Route path='/vendordashboard' element={<VendorDashboard/>}/>
        <Route path='/chat' element={<ChatPage/>}/>
        <Route path='/feeddisplay' element={<FeedDisplay/>}/>
        </Route>
          <Route path="/freezer" element={<FreezerTroubleshooting />} />
          <Route path="/refrigerator" element={<RefrigeratorTroubleshooting />} />
          <Route path="/dryer" element={<DryerTroubleshooting />} />
        
          <Route path="/washer" element={<WasherTroubleshooting />} />
          <Route path='/requestlist' element={<VendorRequestsListPage/>}/>
          <Route path='/listening' element={<ListingCreationFlow/>}/>
          <Route path='/listings/edit/:id' element={<UpdateListing/>}/>
          <Route path="/tv" element={<TVTroubleshooting />} />
          <Route path="/billing" element={<BillingDetailsForm/>} />
          <Route path="/delivery" element={<DeliveryAppointmentPage />} />
          <Route path="/confirm" element={<ConfirmSubmitPage />} />
      
         
          <Route path="/reset-password" element={<Resetpassword/>} />
          <Route path="/confirmation" element={<OrderConfirmation/>} />
          <Route path="/contact" element={<ContactSupport/>} />
          
          <Route path='/vendoradminchat' element={<VendorSupportChatWidget/>}/>
          <Route path='/community/:id' element={<IndividualPostPage/>}/>
     
          <Route path='/subscription' element={<SubscriptionComponent/>}/>
          {/* Admin Login Route (Public) */}
          <Route path="/adminlogin" element={<AdminLogin/>} />
          <Route path="/adminreset" element={<AdminReset/>} />
          <Route path='/adminregister' element={<AdminRegister/>}/>
          <Route path='/boostinginterface' element={<BoostingInterface/>}/>
          <Route path='/community' element={<CommunityPostPage/>  }/>
          <Route path='/mylistenings' element={<VendorFeed/>}/>
          <Route path='/feed' element={<VendorCommunityFeed/>}/>
          
<Route path='/boost' element={<BoostListingPage/>}/>
            <Route path='/vendorlogin' element={<VendorLogin/>}/>
            <Route path='/vendorregister' element={<VendorSignup/>}/>
            <Route path='/vendorreset' element={<VendorResetPassword/>}/>
          {/* Admin Routes (Protected) */}
          <Route element={<Middleware />}>
            <Route path="/admin" element={<AdminApp />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="rentals" element={<RentalsManagement />} />
              <Route path='vendors' element={<VendorManagement/>}/>
              <Route path="subscriptions" element={<AdminSubscriptionManagement />} />
              <Route path="inventory" element={<AdminInventoryManagement />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route 
  path="chat" 
  element={
    <AdminSocketProvider>
      <AdminChatPage />
    </AdminSocketProvider>
  }
/>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </SocketProvider>
    </Elements>
  </StrictMode>,
)