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
import { BrowserRouter,Route,Router,Routes } from 'react-router-dom'
import ApplianceRentalPage from './pages/ApplianceRentalPage.jsx'
import FreezerTroubleshooting from './pages/FreezerTroubleshooting.jsx'
import RefrigeratorTroubleshooting from './pages/RefrigeratorTroubleshooting.jsx'
import DryerTroubleshooting from './pages/DryerTroubleshooting.jsx'
import WasherTroubleshooting from './pages/WasherTroubleshooting.jsx'
import TVTroubleshooting from './pages/TVTroubleshooting.jsx'
import BillingDetailsForm from './pages/BillingDetailsForm.jsx'
import DeliveryAppointmentPage from './pages/DeliveryAppointmentPage.jsx'
import ConfirmSubmitPage from './pages/ConfirmSubmitPage.jsx'
import RentSimpleAccount from './pages/RentSimpleAccount.jsx'
const stripePromise = loadStripe('pk_test_51OwuO4LcfLzcwwOYdssgGfUSfOgWT1LwO6ewi3CEPewY7WEL9ATqH6WJm3oAcLDA3IgUvVYLVEBMIEu0d8fUwhlw009JwzEYmV');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Elements stripe={stripePromise}>

   
   <BrowserRouter>
   <Routes>
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
   </Routes>
   </BrowserRouter>
   </Elements>
  </StrictMode>,
)
