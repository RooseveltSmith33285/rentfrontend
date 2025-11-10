export function ListingCard({ listing, onBoost }) {
    const media = listing.item.media?.[0]?.url;
    const price = listing.item.pricePlans?.find((p) => p.cadence === 'MONTHLY')?.amountCents;
    
    return (
      <div className="card">
        {media && <img src={media} alt={listing.item.title} style={{ width: 220, height: 160, objectFit: 'cover' }} />}
        <div className="content">
          <h4>{listing.item.title}</h4>
          <p>${(price/100).toFixed(2)}/mo • {listing.item.condition}</p>
          <small>{listing.item.vendor.legalName}</small>
        </div>
        <div className="actions">
          <button onClick={() => onBoost?.(listing.id)}>Boost</button>
        </div>
      </div>
    );
  }