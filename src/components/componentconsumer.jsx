import { useForm } from 'react-hook-form';
import { api } from '../lib/api';

export default function CommunityComposer() {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = async ({ body }) => {
    await api.post('/community/posts', { body, media: [], visibility: 'public' });
    reset(); 
    alert('Posted to community!');
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="composer">
      <textarea 
        placeholder="Share a promo, new stock, delivery windows…" 
        {...register('body', { required: true })} 
      />
      <button type="submit">Post</button>
    </form>
  );
}