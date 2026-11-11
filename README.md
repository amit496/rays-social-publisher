# RAYS Social Publisher

A social media publishing dashboard built with React and Vite, with an Express API backed by MongoDB and Cloudinary.

## Features

- Dashboard pages for posts, calendar, media library, analytics, and settings
- Create, list, update, and delete post records
- Upload images and videos to Cloudinary
- Store post details in MongoDB

## Requirements

- Node.js and npm
- MongoDB connection string
- Cloudinary account credentials

## Setup

### 1. Configure the API

Create `server/.env` with your own credentials:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Install dependencies and start the API:

```bash
cd server
npm install
npm run dev
```

The API starts at `http://localhost:5000` after it connects to MongoDB.

### 2. Start the client

In another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite. The client currently sends API requests to `http://localhost:5000/api`.

## API routes

| Method | Route | Description |
| --- | --- | --- |
| GET | `/` | API health check |
| GET | `/api/posts` | List posts |
| POST | `/api/posts` | Create a post |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |
| POST | `/api/upload` | Upload one image or video as multipart field `media` |

Supported media types are JPG, PNG, WEBP, GIF, MP4, and MOV; uploads are limited to 100 MB.

## Production build

```bash
cd client
npm run build
```
