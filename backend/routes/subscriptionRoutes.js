import {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscriptionController.js";
import auth from "../middleware/auth.js";

import express from "express";

const router = express.Router();

router.use(auth);

router.post("/", createSubscription);
router.get("/", getSubscriptions);
router.put("/:id", updateSubscription);
router.delete("/:id", deleteSubscription);

export default router;
