# Moodsync Backend

Moodsync is a backend service for a music web app that lets users generate and save playlists based on their mood. It uses AI to understand user input and fetches matching songs from Spotify. Users can register using email/password or Google, and upload playlist images.

##  Features

-  User registration & login (JWT)
-  Google OAuth integration
-  AI-generated playlist tracks using natural language description
-  Fetch real songs from Spotify (no user Spotify login needed)
- Upload playlist images
-  Secure routes with middleware
-  RESTful API for all major functionality

##  Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT (authentication)
- Google OAuth 2.0
- Multer (image upload)
- dotenv (env config)
- Axios (external requests)
- Spotify Web API

##  Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/moodsync-backend.git
cd moodsync-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root folder and add the following:

```env
PORT=5200
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5200/api/auth/google/callback

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

AI_API_KEY=your_gemini_or_openai_api_key
```

##  Start the Server

```bash
npm run dev
```

App will run at:  
**http://localhost:5200**



##  API Endpoints

### Auth

| Method | Endpoint                        | Description                      |
|--------|----------------------------------|----------------------------------|
| POST   | `/api/auth/register`            | Register with username/password |
| POST   | `/api/auth/login`               | Login with username/password    |
| GET    | `/api/auth/google`              | Start Google OAuth flow         |
| GET    | `/api/auth/google/callback`     | Google OAuth callback handler   |

### Playlists

| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| POST   | `/api/playlists/`                | Create a playlist (JWT required)   |
| GET    | `/api/playlists/user`            | Get playlists for logged-in user   |
| GET    | `/api/playlists/:id`             | Get a specific playlist            |
| PUT    | `/api/playlists/:id`             | Update playlist (JWT required)     |
| DELETE | `/api/playlists/:id`             | Delete playlist (JWT required)     |
| POST   | `/api/playlists/image/:id`       | Upload playlist image (JWT)        |

### AI Track Generator

| Method | Endpoint           | Description                                  |
|--------|--------------------|----------------------------------------------|
| POST   | `/api/test-ai`     | Generate  songs from AI based on description |



##  Folder Structure

```
moodsync-backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── uploads/            # Uploaded playlist images
├── .env
├── server.js
```



##  Static File Hosting

Uploaded images are accessible from:

```
http://localhost:5200/uploads/filename.jpg
```

Make sure to include:

```js
app.use('/uploads', express.static('uploads'));
```


##  Authentication

All protected routes require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <your_token>
```


##  Deployment (Render / Vercel / etc.)

- Add all required environment variables in the hosting dashboard
- Add build/start commands:
  - Build: `npm install`
  - Start: `npm run dev` or `node server.js`
- Enable static files if needed for `/uploads`



##  License

MIT License


## Authors

Dea Dumbadze
Nikoloz Ramishvili
Giorgi Maisuradze
Giorgi Muzashvili
