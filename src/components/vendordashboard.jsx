import CreateListingForm from './CreateListingForm';
import Feed from './Feed';

export default function VendorDashboard() {
  return (
    <div className="wrap">
      <section>
        <h2>Quick Actions</h2>
        <ul className="tiles">
          <li>Create Listing</li>
          <li>Set Delivery Zone</li>
          <li>Post to Community</li>
        </ul>
      </section>
      <section>
        <h3>Create Listing</h3>
        <CreateListingForm />
      </section>
      <section>
        <h3>Marketplace Feed (nearby)</h3>
        <Feed />
      </section>
    </div>
  );
}