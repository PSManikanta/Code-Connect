# Code Connect Backend

This is the Node.js/Express backend for "Code Connect", optimized for Vercel serverless deployment and using Neon PostgreSQL for the database.

## Prerequisites
- Node.js (v18 or higher recommended)
- A Neon PostgreSQL Database ([https://neon.tech/](https://neon.tech/))
- A Resend Account for Email Delivery ([https://resend.com/](https://resend.com/))
- Vercel CLI (Optional, for local testing and deployment)

## Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: A secure random string for JWT signing.
   - `RESEND_API_KEY`: Your Resend API key.

## Database Schema Setup

Before running the API, execute the following SQL in your Neon database SQL editor to create the required tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'archived'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proposal_interests (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER REFERENCES proposals(id) ON DELETE CASCADE,
    interested_name VARCHAR(255) NOT NULL,
    interested_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running Locally

To run the application locally:
```bash
npm install
npm run dev
```

Alternatively, if you have Vercel CLI installed, you can use:
```bash
vercel dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup`
  - Body: `{ "name": "...", "email": "...", "password": "..." }`
- `POST /api/auth/login`
  - Body: `{ "email": "...", "password": "..." }`

### Proposals
- `GET /api/proposals` (Optionally pass `?status=open`)
- `POST /api/proposals` (Requires `Authorization: Bearer <token>`)
  - Body: `{ "title": "...", "description": "..." }`

### Email Trigger
- `POST /api/email/interested`
  - Body: `{ "proposalId": 1, "interestedName": "...", "interestedEmail": "..." }`
  - *Note: This endpoint is rate-limited (5 requests per 15 minutes).*

## Deployment to Vercel

### Backend Deployment
1. Push your code to a GitHub repository.
2. Go to Vercel and import your repository. The `vercel.json` file is already configured.
3. In the environment variables section of Vercel, add `DATABASE_URL`, `JWT_SECRET`, and `RESEND_API_KEY`.
4. Deploy! Note the resulting backend URL (e.g., `https://your-backend.vercel.app/api`).

### Frontend Deployment
1. Go back to Vercel and import your repository *again*, but this time set the **Framework Preset** to `Vite`.
2. Set the **Root Directory** to `frontend`.
3. In the environment variables section, add `VITE_API_URL` and set it to your deployed backend URL.
4. Deploy! Your frontend is now live and communicating with your backend.
