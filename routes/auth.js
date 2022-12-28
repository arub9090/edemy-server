import express from "express";

const router = express.Router();

import { requireSignin } from "../middleware";

// controllers
const {registerUser, loginUser, logoutUser, sendTestEmail, forgotPassword, resetPassword} = require("../controllers/auth")
import {currentUser} from "../controllers/auth"




router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout',logoutUser );
router.get('/current-user', requireSignin, currentUser);
router.get('/send-email', sendTestEmail);
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)


module.exports= router;