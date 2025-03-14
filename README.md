This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


export async function GET(request) {
  let connection;
  try {
    const session = await auth();
    const url = new URL(request.url);
    const showAll = url.searchParams.get("showAll") === "true";
    const searchQuery = url.searchParams.get("search")?.trim();
    const vehicleType = url.searchParams.get("vehicle_type")?.trim();
    const model = url.searchParams.get("model")?.trim();
    const year = url.searchParams.get("year")?.trim();
    const fuelType = url.searchParams.get("fuelType")?.trim();
    const minPrice = url.searchParams.get("minPrice")?.trim();
    const maxPrice = url.searchParams.get("maxPrice")?.trim();

    connection = await connectToDatabase();

    let query = { status: "Active" };

    if (session && session.user && !showAll) {
      const userEmail = session.user.email;
      if (!userEmail) {
        return NextResponse.json({ error: "User email not found in session" }, { status: 400 });
      }
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return NextResponse.json({ error: "User not found in database" }, { status: 404 });
      }
      query = { user: user._id, status: { $in: ["Pending", "Active"] } };
    }

    // Apply filters
    if (searchQuery) {
      query.$or = [{ model: { $regex: searchQuery, $options: "i" } }];
      const numericQuery = Number(searchQuery);
      const isValidYear = !isNaN(numericQuery) && Number.isInteger(numericQuery) && numericQuery >= 1900 && numericQuery <= new Date().getFullYear();
      if (isValidYear) {
        query.$or.push({ year: numericQuery });
      }
    }

    if (vehicleType) {
      query.vehicle_type = { $regex: vehicleType, $options: "i" };
    }

    if (model) {
      query.model = { $regex: model, $options: "i" };
    }

    if (year) {
      const numericYear = Number(year);
      if (!isNaN(numericYear) && Number.isInteger(numericYear) && numericYear >= 1900 && numericYear <= new Date().getFullYear()) {
        query.year = numericYear;
      }
    }

    if (fuelType) {
      query.fuelType = { $regex: fuelType, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        const min = Number(minPrice);
        if (!isNaN(min)) query.price.$gte = min;
      }
      if (maxPrice) {
        const max = Number(maxPrice);
        if (!isNaN(max)) query.price.$lte = max;
      }
    }

    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .exec();

    console.log("Vehicles fetched:", vehicles.length, "Filters:", { searchQuery, vehicleType, model, year, fuelType, minPrice, maxPrice });
    const vehicleData = vehicles.map((v) => v.toObject());

    return NextResponse.json(vehicleData, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles", details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection && typeof connection.close === "function") {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
}