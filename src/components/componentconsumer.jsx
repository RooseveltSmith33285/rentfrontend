import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import { toast, ToastContainer } from 'react-toastify';

export default function CommunityComposer() {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = async ({ body }) => {
    await api.post('/community/posts', { body, media: [], visibility: 'public' });
    reset(); 
    toast.success('Posted to community!',{containerId:"componentConsumer"});
  };
  return (
  <>
  <ToastContainer containerId={"componentConsumer"}/>
  <form onSubmit={handleSubmit(onSubmit)} className="composer">
      <textarea 
        placeholder="Share a promo, new stock, delivery windows…" 
        {...register('body', { required: true })} 
      />
      <button type="submit">Post</button>
    </form>
  </>
  );
}