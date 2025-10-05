import express from 'express';
import { getDashboardData } from '../controllers/dashboard.js';
import { verifyAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get('/dashboard', verifyAuth, getDashboardData);

export default router;