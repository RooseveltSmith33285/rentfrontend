import { useState } from 'react';
import { api } from '../lib/api';
import { toast, ToastContainer } from 'react-toastify';

export default function SubscribeVendor() {
  const [pm, setPm] = useState('pm_mock_visa'); 
  const priceId = 'price_123_vendor_monthly';   

  async function subscribe() {
    await api.post('/billing/subscribe', { priceId, paymentMethodId: pm });
   toast.success('Subscription active',{containerId:"billingSubscribe"});
  }

  return (
  <>
  <ToastContainer containerId={"billingSubscribe"}/>
  

  <div className="card">
      <h4>Vendor Platform Subscription</h4>
      <p>$29/mo to access vendor tools & analytics</p>
      <button onClick={subscribe}>Activate</button>
    </div>
  </>
  );
}