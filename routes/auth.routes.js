import express from 'express';
import {
    registerUser,
    loginUser,
    spotifyCallback,
    spotifyLogin,
    googleCallback, googleLogin
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/spotify/login', spotifyLogin);
router.get('/spotify/callback', spotifyCallback);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);


export default router;
