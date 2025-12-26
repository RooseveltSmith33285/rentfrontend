import { useState } from 'react';
import { useForm } from 'react-hook-form';


export default function CreateListingForm() {
  const { register, handleSubmit } = useForm();
  const [uploading, setUploading] = useState(false);

  async function uploadImages(files) {
    const urls = [];
    for (const f of files) {
  
  }
    return urls;
  }

  const onSubmit = async (vals) => {
    setUploading(true);
   
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="stack">
      <input placeholder="Title" {...register('title', { required: true })} />
      <input placeholder="Brand" {...register('brand')} />
      <input placeholder="Model" {...register('model')} />
      <select {...register('condition', { required: true })}>
        <option>Like New</option>
        <option>Good</option>
        <option>Fair</option>
      </select>
      <input 
        type="number" 
        step="0.01" 
        placeholder="Monthly Price (USD)" 
        {...register('priceMonthly', { valueAsNumber: true })} 
      />
      <input 
        type="number" 
        step="0.01" 
        placeholder="Deposit (USD)" 
        {...register('deposit', { valueAsNumber: true })} 
      />
      <input 
        type="number" 
        placeholder="Min Term Days" 
        {...register('minTermDays', { valueAsNumber: true })} 
      />
      <input 
        type="file" 
        multiple 
        accept="image/*,video/*" 
        {...register('images')} 
      />
      <button disabled={uploading} type="submit">
        {uploading ? 'Uploading…' : 'Publish Listing'}
      </button>
    </form>
  );
}