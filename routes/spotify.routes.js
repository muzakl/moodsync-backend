import express from 'express';
import { searchSpotifyTracks } from '../controllers/spotify.controller.js';

const router = express.Router();

router.get('/search-tracks', searchSpotifyTracks); // GET /api/spotify/search-tracks?q=...

export default router;
