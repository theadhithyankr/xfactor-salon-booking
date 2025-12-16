# Database Setup Instructions

## Seeding Services Data

To populate your Supabase database with the services shown in the UI:

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the SQL Editor

2. **Run the Seed Script**
   - Open the file `seed_services.sql`
   - Copy all the SQL content
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute

3. **Verify the Data**
   - Go to the "Table Editor" in Supabase
   - Select the `services` table
   - You should see all 18 services populated

## What Changed

### ✅ ServicesSection Component
- Now fetches services from Supabase in real-time
- Displays actual prices and durations
- Service cards are clickable and navigate to booking
- Shows a loading spinner while fetching data

### ✅ BookingPage Component
- Receives the selected service from navigation
- Uses actual service price and duration
- Saves `service_id` and `total_price` to the database
- Redirects to dashboard after successful booking

### ✅ Database Integration
- All 18 services with realistic prices ($10-$80)
- Duration times (15-120 minutes)
- Categories (haircut, styling, coloring, treatment, other)
- High-quality Unsplash images

## Next Steps

After seeding the database:
1. Refresh your app
2. The services will load from Supabase
3. Click any service card to book it
4. The booking will save with the correct service and price

## Testing

1. **View Services**: Go to home page - services should load
2. **Click a Service**: Should navigate to `/book` with service details
3. **Complete Booking**: Should save with correct service_id and price
4. **Check Dashboard**: View your booking in the customer dashboard
