import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Head from 'next/head';
import VehicleListingForm from '@/components/VehicleListingForm';

export default async function CreateVehiclePage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/sign-in?callbackUrl=/new');
  }

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
}