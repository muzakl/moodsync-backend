import express from 'express';
import {
    registerUser,
    loginUser,
    googleCallback,
    googleLogin,
    getUserInfo,
    updateUserProfile

} from '../controllers/auth.controller.js';
import {authenticateUser} from "../middlwear/auth.js";

const router = express.Router();
console.log("✅ auth.routes.js file loaded");

router.post('/register', (req, res, next) => {
    console.log("🔥 /api/auth/register hit");
    next();
}, registerUser);

router.post('/login', loginUser);
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/user/:id', getUserInfo);
router.put('/user/update', authenticateUser, updateUserProfile);


export default router;
