# CampusEvents — Client

CampusEvents is a campus event management platform where students can discover events, register, access QR tickets, and receive participation certificates. Organizers manage events and attendance, while administrators manage user roles.

## Project Links

- Client Repository: https://github.com/Asraful666/campus-events-client
- Server Repository: https://github.com/Asraful666/campus-events-server
- Live Website: TODO — Add deployed frontend URL
- Live API: TODO — Add deployed backend URL

## Technology Stack

- Next.js App Router
- React
- JavaScript
- Tailwind CSS
- DaisyUI
- Better Auth client with JWT plugin
- qrcode
- html5-qrcode

## Features

- Email/password registration, login, and logout
- Student, Organizer, and Admin dashboards
- Event search, category filtering, and pagination
- Event details and student registration
- Event creation, editing, and cancellation
- Participant lists with attendance filters
- QR tickets and attendance scanning
- Participation certificates with Print / Save PDF
- Favorite events
- Event reviews and ratings
- In-app notifications and reminders
- Event and attendance statistics
- Personalized event recommendations
- Admin user search and role management

## User Roles

| Role | Main Features |
| --- | --- |
| Student | Register for events, view tickets, save favorites, access eligible certificates, and submit reviews |
| Organizer | Create and manage owned events, view participants, and record attendance |
| Admin | Manage events, attendance, users, and roles |

Authorization is enforced by the backend.

## Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/Asraful666/campus-events-client.git
cd campus-events-client
```

### 2. Install dependencies

Use a Node.js version compatible with the installed Next.js version.

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Start the backend

Run the CampusEvents server on port 8000 before testing API-dependent features.

### 5. Start the frontend

```bash
npm run dev
```

Open http://localhost:3000.

The frontend origin must match the backend's `CLIENT_URL`.

## Production Build

```bash
npm run build
npm run start
```

Stop any development server using port 3000 before running the production server.

## Main Routes

| Route | Description |
| --- | --- |
| `/` | Homepage and event discovery |
| `/events/[id]` | Event details, registration, favorites, and reviews |
| `/login` | Login |
| `/register` | Account registration |
| `/dashboard` | Role-specific dashboard |
| `/dashboard/my-registrations` | Registrations and QR tickets |
| `/dashboard/favorites` | Favorite events |
| `/dashboard/create-event` | Create an event |
| `/dashboard/my-events` | Manage events |
| `/dashboard/edit-event/[id]` | Edit an event |
| `/dashboard/participants/[id]` | View event participants |
| `/dashboard/attendance` | QR attendance scanner |
| `/dashboard/certificate/[id]` | Participation certificate |
| `/dashboard/users` | Admin user management |
| `/dashboard/notifications` | In-app notifications |
| `/dashboard/recommendations` | Recommended events |

## Project Structure

```text
src/
  app/                 Pages, layout, and global styles
  components/          Shared UI components
  lib/
    auth-client.js     Better Auth client configuration
    api.js             Authenticated API requests
```

Dynamic pages using `useParams()` use a parent `Suspense` boundary for prerendering.

## Important Behavior

- Student registration depends on event capacity and registration deadlines.
- Attendance check-in is allowed from one hour before the event starts until it ends.
- Certificates require recorded attendance and a completed, published event.
- Reviews require attendance at a completed event.
- Certificates can be printed or saved as PDF through the browser print dialog.
- Camera scanning requires camera permission and HTTPS or localhost.
- Notifications are in-app; email and SMS delivery are not included.
- Event fees are displayed, but online payment processing is not implemented.

## Event Recommendations

The backend uses content-based TF-IDF vectors and cosine similarity to recommend events based on registered and favorite events.

When there is insufficient matching history, upcoming events are shown.

This feature does not use a generative AI service or an external AI API key.

## Manual Testing

1. Register and log in as a student.
2. Register for an available event and open its QR ticket.
3. Add and remove favorite events.
4. Create and edit an event as an organizer.
5. View participants and scan a ticket during the check-in window.
6. Confirm duplicate check-in is rejected.
7. Open a certificate and submit a review after attending a completed event.
8. Change another user's role as an administrator.
9. Check notifications and recommendations.

## Deployment

1. Set `NEXT_PUBLIC_API_URL` to the deployed backend origin before building.
2. Set the backend's `CLIENT_URL` to the deployed frontend origin.
3. Verify authentication cookies and credentialed requests on the final domains.
4. Run the production build.
5. Test authentication, registration, attendance, and certificates.
6. Update the live links in this README.

Never commit `.env.local`, passwords, or service secrets.

## Author

**Md Asraful Islam**

GitHub: https://github.com/Asraful666