import { Router } from "express";
import * as listingController from "../controllers/listingController";
import { authorize } from "../middleware/AuthMiddleware"

const router = Router();

router.post("/", authorize(["admin", "farmer"]), listingController.createListing);

router.get("/", authorize("admin"), listingController.getListings);

router.delete("/:id", authorize("admin"), listingController.deleteListing);

router.get("/user/:user_id", authorize("all"), listingController.getListingsByUserId);

router.put("/:id", authorize(["admin", "farmer"]), listingController.updateListing);

router.get("/verify", authorize("all"), listingController.getListingOfVerifyFamers);

export default router;