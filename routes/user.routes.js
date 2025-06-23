import express from 'express';
import { authenticateToken } from '../controllers/auth.middleware.js';
// import { getUserSpotifyTracks } from '../controllers/auth.controller.js';

const router = express.Router();

// router.get('/user/spotify-tracks', authenticateToken, getUserSpotifyTracks);

export default router;