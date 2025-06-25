import express from 'express';
import {
    registerUser,
    loginUser,
    googleCallback,
    googleLogin,
    getUserInfo
} from '../controllers/auth.controller.js';

const router = express.Router();
console.log("✅ auth.routes.js file loaded");

router.post('/register', (req, res, next) => {
    console.log("🔥 /api/auth/register hit");
    next();
}, registerUser); // ✅ keep this one

router.post('/login', loginUser);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/user/:id', getUserInfo);

export default router;
