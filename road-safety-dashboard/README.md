# 🚦 Road Safety AI Dashboard

A full-stack dashboard for visualizing road accident severity predictions using deep learning models (TabNet & MLP) based on the UK accident dataset.

## Tech Stack
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Frontend**: Vanilla JS + Chart.js
- **Models Featured**: TabNet (97.21%), MLP (96.15%), Random Forest (85.94%), CNN (84%)

## Prerequisites
- Node.js v18+
- MongoDB running locally on `mongodb://localhost:27017`

## Authentication
The dashboard now requires login.

Configure credentials in `.env`:

```env
SESSION_SECRET=change-me-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Open `/login`, sign in, and use the top-right Logout button to end the session.

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
copy .env.example .env

# 3. Seed the database with demo data
npm run seed

# 4. Start the server
npm start
# → http://localhost:3000
```

For development with auto-reload:
```bash
npm run dev
```

If you are using macOS or Linux, replace `copy` with `cp`.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/login` | Login with username/password |
| POST | `/auth/logout` | Destroy current session |
| GET | `/auth/me` | Session status and current user |
| GET | `/api/stats` | Overview KPIs |
| GET | `/api/accidents-by-month` | Monthly trend data |
| GET | `/api/accidents-by-road-type` | Road type breakdown |
| GET | `/api/accidents-by-junction` | Junction control data |
| GET | `/api/accidents-by-weather` | Weather impact |
| GET | `/api/accidents-by-pedestrian-control` | Pedestrian control breakdown |
| GET | `/api/severity-by-speed` | Speed limit analysis |
| GET | `/api/model-metrics` | ML model performance |
| GET | `/api/prediction-accuracy-by-model` | Per-model accuracy |
| GET | `/api/accidents?page=1&limit=12` | Paginated records |
| POST | `/api/accidents` | Add new accident record |

## Dashboard Sections
- **Overview** — KPIs, trend line, severity donut, junction & weather charts
- **Analytics** — Road type, pedestrian control, key insights
- **ML Models** — Model comparison cards, accuracy bar chart, TabNet epoch curve
- **Records** — Filterable, paginated accident table with predictions

## Dataset
Based on the UK road accident dataset (data.gov.uk), covering 2000–2018 with 1.8M+ accidents.
Paper: *"Advancing Road Safety: Road Accident Severity Prediction Using Deep Learning Models"* — Shawon & Azim, IEEE ITSC 2024.

