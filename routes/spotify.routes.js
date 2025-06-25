import express from 'express';
import { searchSpotifyTracks } from '../controllers/spotify.controller.js';

const router = express.Router();

router.get('/search-tracks', searchSpotifyTracks);

export default router;
