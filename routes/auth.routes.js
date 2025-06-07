import express from 'express';
import { registerUser, loginUser, linkSpotify } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/link-spotify', linkSpotify);

export default router;
