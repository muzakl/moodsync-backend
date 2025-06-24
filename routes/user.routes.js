import express from 'express';
import {getUserInfo, getUserSpotifyTracks} from '../controllers/auth.controller.js';

const router = express.Router();
router.get("/:id", getUserInfo);
router.get("/spotify-tracks",  getUserSpotifyTracks);

export default router;