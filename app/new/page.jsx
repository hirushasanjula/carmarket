import Head from 'next/head';
import VehicleListingForm from '@/components/VehicleListingForm';

const CreateVehiclePage = () => {
  return (
    <div>
      <Head>
        <title>Create Vehicle Listing</title>
        <meta name="description" content="Create a new vehicle listing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <VehicleListingForm />
        </div>
      </main>
    </div>
  );
};

export default CreateVehiclePage;
