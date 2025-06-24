import express from 'express';
import {getUserInfo, } from '../controllers/auth.controller.js';

const router = express.Router();
router.get("/:id", getUserInfo);
router.get("/spotify-tracks");

export default router;