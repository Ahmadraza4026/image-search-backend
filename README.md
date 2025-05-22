# Image & Video Search Backend

This is the backend API for the full-stack Image & Video Search app. It provides authentication, image and video search endpoints, favorites management, trending keywords, and email verification.

## Features

- User authentication with JWT, email verification, password reset
- Favorite images and videos management per user
- Image search via Unsplash API integration
- Video search via Pexels API integration
- Trending keyword endpoints
- Email notifications using Nodemailer
- Secure routes with middleware protection

## Tech Stack

- Node.js, Express.js
- MongoDB with Mongoose
- JWT authentication
- Nodemailer for emails
- External APIs: Unsplash, Pexels

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB instance (local or cloud)

### Installation

1. Clone this repository:

git clone https://github.com/Ahmadraza4026/image-search-backend.git

2. Install dependencies:

cd image-search-backend
npm install

3. Set up environment variables in a .env file:

PORT=your_port
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PEXELS_API_KEY=your_pexels_api_key

4. Run the server:

npm start

