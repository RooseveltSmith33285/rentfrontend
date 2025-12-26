import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ListingCard } from './ListingCard';
import { toast, ToastContainer } from 'react-toastify';

export default function Feed() {
  const { data } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => (await api.get('/listings/feed')).data
  });

  async function handleBoost(listingId) {
    await api.post('/boosts', { listingId, plan: 'DAILY', amountCents: 500 });
    toast.success('Boost activated for 24h',{containerId:"vendorFeedPage"});
  }

  return (
  <>
  <ToastContainer containerId={"vendorFeedPage"}/>
  

  <div className="grid">
      {data?.listings?.map((l) => (
        <ListingCard key={l.id} listing={l} onBoost={handleBoost} />
      ))}
    </div>
  </>
  );
}