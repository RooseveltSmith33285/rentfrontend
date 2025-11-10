import { useState } from 'react';
import { useForm } from 'react-hook-form';


export default function CreateListingForm() {
  const { register, handleSubmit } = useForm();
  const [uploading, setUploading] = useState(false);

  async function uploadImages(files) {
    const urls = [];
    for (const f of files) {
    //   const { data } = await api.post('/uploads/presign', { fileName: f.name, contentType: f.type });
    //   await fetch(data.uploadUrl, { method: 'PUT', headers: { 'Content-Type': f.type }, body: f });
    //   urls.push({ url: data.publicUrl, type: f.type.startsWith('video') ? 'video' : 'image' });
    }
    return urls;
  }

  const onSubmit = async (vals) => {
    setUploading(true);
    // const { data: i } = await api.post('/items', {
    //   title: vals.title, 
    //   brand: vals.brand, 
    //   model: vals.model, 
    //   condition: vals.condition,
    //   attributes: {}
    // });
    // const media = await uploadImages(vals.images || []);
    // await api.post(`/items/${i.item.id}/media`, { files: media });
    // await api.post(`/items/${i.item.id}/pricing`, {
    //   plans: [{ 
    //     cadence: 'MONTHLY', 
    //     amountCents: Math.round(vals.priceMonthly * 100), 
    //     depositCents: Math.round(vals.deposit * 100), 
    //     minTermDays: vals.minTermDays 
    //   }]
    // });
    // await api.post('/listings', { itemId: i.item.id });
    // setUploading(false);
    // alert('Listing published!');
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