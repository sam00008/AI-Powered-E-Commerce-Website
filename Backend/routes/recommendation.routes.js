import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";

import {
    getFrequentlyBoughtTogether,
    getPersonalizedRecommendations,
    getSimilarProduct
} from "../controller/recommendation.controller.js";

const router = Router();

// Personalized (login required)
router.get("/personalized", verifyjwt, getPersonalizedRecommendations);

// Frequently bought together
router.get("/frequently/:productId", getFrequentlyBoughtTogether);

// Similar products
router.get("/similar/:productId", getSimilarProduct);

export default router;