# Hot Wheels Inventory

A mobile-friendly web app for tracking your Hot Wheels 1:64 die-cast collection. Take a photo
of a car to add it to your inventory, or take a photo at the store to check whether you
already own it (and whether you have other cars from the same collection).

## How it works

- **Add to Collection** (`/add`): photograph a car you own. Claude's vision model reads the
  car name, collection name, collection number (e.g. `21/250`), color, and whether it's a
  gold/Treasure Hunt variant. You can edit the result before saving it to Supabase.
- **Check at Store** (`/check`): photograph a car you're considering buying. The app identifies
  it and checks your inventory — telling you if you already own it, and listing any other cars
  you have from the same collection.
- **My Inventory** (`/inventory`): browse, search, and delete saved cars.

## Setup

1. **Supabase**: create a project at [supabase.com](https://supabase.com), then run
   `supabase/schema.sql` in the SQL editor. This creates the `hotwheels` table and a public
   `hotwheels-photos` storage bucket.
2. **Anthropic API key**: get one at [console.anthropic.com](https://console.anthropic.com).
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → service_role key)
   - `ANTHROPIC_API_KEY`
4. Install and run:

   ```bash
   npm install
   npm run dev
   ```

5. Open on your phone (same network, or deploy to Vercel) and use "Add to Home Screen" for an
   app-like experience.

## Notes

- The service role key is used server-side only (in API routes) and bypasses Row Level Security,
  since this is a single-user personal inventory app.
- Matching logic considers two cars the same item if the car name and collection number match
  exactly (case-insensitive).
