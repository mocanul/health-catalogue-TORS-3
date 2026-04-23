# TORS – Health Equipment Ordering Catalogue

## Overview Part 1
Web-based health equipment ordering catalogue including the following:

- **Clear display of the equipment, divided into categories, including quantities**
- **Page to allow staff to add, remove and edit catalogue items**
- **Booking feature**
    - **Users can:**
    - **choose a date and time for their booking**
    - **choose a room**
    - **add and remove equipment**
    - **upload files including a "required" section**
    - **An "Other" option, free input text box for things that aren't in stock**
- **Staff can approve or deny a booking**

Further features linked to the catalogue:
- **Show if equipment booking has been submitted/ reviewed/ actioned**
- **Two way communication**
- **Flag if equipment has been booked out on specific day**
- **Display time tables to avoid confusion regarding times/dates/lesson titles**
- **Allow multiple users to contribute to equipment bookings**
- **Academic feedback**
- **Audit for booking, showing date created on, changes, reviewed, last used, etc.**
- **Ability to group items into procedure packs or kits**

The list above includes functional and non-functional requirements for the catalogue. Changes to be made in the future based on progress and client discussions. Part 2, 3 and 4 to be included and discussed in the future as well.

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

## Setup

### Prerequisites
- Node.js
- Git

### Dependencies
- ```npm install```

### Environment
- Create a .env file in the project root

### Database

- Generate prisma client
```npx prisma generate```

- Run prisma studio to view database
```npx prisma studio```

### Run program
```npm run dev```


## Readme
This is not the final version of the readme