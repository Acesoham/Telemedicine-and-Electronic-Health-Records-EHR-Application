# MediVault - Enterprise Telemedicine & EHR Platform

MediVault is a comprehensive Electronic Health Records (EHR) and Telemedicine platform designed to securely connect patients and doctors. It provides HD video consultations, encrypted health records, smart scheduling, and digital prescriptions.

## Features
- **HD Video Consultations:** Real-time, crystal-clear WebRTC-powered video calls.
- **Encrypted Health Records:** Medical data protected with military-grade AES-256 encryption.
- **Smart Scheduling:** Effortless appointment booking and management.
- **Digital Prescriptions:** Instant digital prescriptions with PDF generation and QR code support.
- **HIPAA-Aligned Privacy:** Privacy-first architecture ensuring data security.

## Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Material UI (MUI), Socket.io-client
- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.io, PDFKit
- **Deployment:** Docker & Docker Compose

## Project Structure
```text
.
├── backend/               # Node.js Express backend
│   ├── src/               # Application source code
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend (Vite)
│   ├── src/               # Frontend source code
│   └── package.json       # Frontend dependencies
├── docker-compose.yml     # Docker orchestration
└── .env.example           # Example environment variables
```

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- [Docker](https://www.docker.com/) (Optional, for containerized deployment)

### 1. Environment Setup
1. Copy the example environment file in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the required values:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET` & `JWT_REFRESH_SECRET`: Secure random strings for authentication.
   - `AES_ENCRYPTION_KEY`: A 64-character hex string (32 bytes) for encrypting EHR data.

### 2. Local Development (Without Docker)

#### Backend Setup
Open a new terminal and navigate to the `backend` directory:
```bash
cd backend
npm install
npm run dev
```
The backend server will start on `http://localhost:5000`.

#### Frontend Setup
Open a second terminal and navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
The frontend Vite server will start and you can view it in your browser.

### 3. Docker Deployment (Optional)
If you prefer running the application using Docker, ensure Docker Desktop is running, then execute from the project root:

```bash
docker-compose up --build
```

This will spin up:
- **Backend API:** accessible on port `5000`
- **Frontend App (Nginx):** accessible on port `80`

To stop the containers:
```bash
docker-compose down
```

## Available Scripts

### Backend (`/backend`)
- `npm run dev`: Starts the development server using `ts-node-dev`.
- `npm run build`: Compiles TypeScript to JavaScript.
- `npm start`: Runs the compiled production server.
- `npm run lint`: Lints the source code.
- `npm test`: Runs the test suite using Jest.

### Frontend (`/frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Lints the frontend source code.

## License
MIT License.
