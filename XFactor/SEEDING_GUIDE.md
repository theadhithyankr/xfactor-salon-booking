# 🗄️ Database Seeding Guide

## Step-by-Step Instructions

### **Step 1: Open Supabase Dashboard**
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your XFactor project

### **Step 2: Navigate to SQL Editor**
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** button

### **Step 3: Run the Seed Script**
1. Open the file: `seed_database.sql` (in your project root)
2. **Copy ALL the content** from the file
3. **Paste** it into the Supabase SQL Editor
4. Click the **"Run"** button (or press Ctrl/Cmd + Enter)

### **Step 4: Verify the Data**
After running the script, you should see results showing:

```
✅ 3 Salons inserted
✅ 18 Services inserted
```

The verification queries at the bottom will show:
- Total salons count
- Services grouped by category
- All services with prices

### **Step 5: Check Your App**
1. Go back to your running app (`http://localhost:5173`)
2. **Refresh the page** (F5 or Ctrl+R)
3. Scroll to the **Services section**
4. You should now see **18 service cards** with real data!

---

## 📊 What Gets Seeded

### **Salons (3 locations):**
- **XFactor Downtown** - Main Street, NYC (9 AM - 9 PM)
- **XFactor Uptown** - Park Avenue, NYC (10 AM - 8 PM)  
- **XFactor Brooklyn** - Bedford Ave, Brooklyn (9 AM - 10 PM)

### **Services (18 total):**

| Category | Services | Price Range |
|----------|----------|-------------|
| **Haircut** | Hair Cutting, Hair Cutting + Shaving, Baby Hair Cutting | $15 - $35 |
| **Styling** | Shaving, Beard Designing, Hair Straightening | $15 - $80 |
| **Coloring** | Hair Colouring, Henna, Highlight Colouring | $30 - $65 |
| **Treatment** | Face Massage, Head Massage, Hair Wash, Hair Spa, Bleach, Clean Up, Facial, Scrub Massage | $12 - $45 |
| **Other** | Threading | $10 |

---

## 🎯 What Happens Next

Once seeded, your app will:

1. ✅ **Home Page** - Display all 18 services with real prices
2. ✅ **Salons Page** - Show 3 salon locations with details
3. ✅ **Booking Flow** - Use actual service data (price, duration)
4. ✅ **My Bookings** - Show service names and prices
5. ✅ **Admin Dashboard** - Display real counts

---

## 🔧 Troubleshooting

### **Services not showing?**
- Check browser console for errors
- Verify Supabase connection in `.env`
- Check RLS policies allow reading services

### **SQL Error?**
- Make sure you copied the ENTIRE file
- Check if tables exist (they should from your schema)
- Try running sections separately if needed

### **Need to reset?**
```sql
-- Delete all data (run this first if you need to re-seed)
DELETE FROM appointments;
DELETE FROM services;
DELETE FROM salons;
```

---

## ✅ Success Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Copied and pasted `seed_database.sql`
- [ ] Clicked "Run" button
- [ ] Saw success messages
- [ ] Refreshed the app
- [ ] Services are displaying on home page
- [ ] Salons page shows 3 locations
- [ ] Can click a service and see correct price in booking

---

## 🚀 After Seeding

Your app is now ready with real data! You can:
- Book appointments with actual services
- See real prices and durations
- Browse salon locations
- Test the complete booking flow

**Next:** We can add worker profiles, appointment management, or any other features you want!
