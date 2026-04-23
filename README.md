# TORS – Health Equipment Ordering Catalogue

The Tors Health Equipment Ordering Catalogue is a web-based project that allows users to book a room for a specified date and time, as well as request equipment from a catalogue. Staff users can edit the catalogue, adding, removing and editing items. Once a booking is made, a staff user will either deny it, sending it back for the booker to fix, or approve it.

## Tech Stack

### Frontend
- **Next.js** (App Router)
- **TSX**

The App Router is used to enable server components, route-based layouts, and improved data-fetching patterns.

### Backend
- **Next.js App Router** (Server Actions / API Routes)
- **TypeScript**

Backend logic is handled within Next.js, reducing architectural complexity while maintaining separation of concerns.

### Database
- **PostgreSQL**

### Cloud Database Hosting
- **Neon**

Online hosting for PostgreSQL, easy to access and use throughout the development.

### APIs

- **Claudeinary**
For uploading and downloading files

- **TalkJS**
For 2-Way text chats

## Hosting

- **Hosted via Vercel**