import { useState } from 'react';
import { api } from '../lib/api';

export default function SubscribeVendor() {
  const [pm, setPm] = useState('pm_mock_visa'); // replace with Stripe Elements on prod
  const priceId = 'price_123_vendor_monthly';    // configure in Stripe Dashboard

  async function subscribe() {
    await api.post('/billing/subscribe', { priceId, paymentMethodId: pm });
    alert('Subscription active');
  }

  return (
    <div className="card">
      <h4>Vendor Platform Subscription</h4>
      <p>$29/mo to access vendor tools & analytics</p>
      <button onClick={subscribe}>Activate</button>
    </div>
  );
}