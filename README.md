# TORS – Health Equipment Ordering Catalogue

### Overview

The Tors Health Equipment Ordering Catalogue is a web-based project that allows users to book a room for a specified date and time, as well as request equipment from a catalogue. Technician users can edit the catalogue, adding, removing and editing items. Once a booking is made, a staff user will either deny it, sending it back for the booker to fix, or approve it. When an approved booking is due, a technician user will assign the booking to either themselves or someone else before taking the booked equipment to the correct room.

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

#### Claudeinary
For uploading and downloading files

- **https://cloudinary.com/**

- **https://github.com/cloudinary**

#### TalkJS
For 2-Way text chats

- **https://talkjs.com/**

- **https://github.com/talkjs**

## Hosting

- **Hosted via Vercel**

https://tors-3-health-catalogue.vercel.app