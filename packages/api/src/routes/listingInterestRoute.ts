import { Router } from "express";
import * as listingInterestController from "../controllers/listingInterestController";
import { authorize } from "../middleware/AuthMiddleware";

const router = Router();

router.post("/", authorize(["admin", "farmer"]), listingInterestController.createListingInterest);
router.get("/", authorize("admin"), listingInterestController.getListingInterests);
router.get("/:id", authorize(["admin", "farmer"]), listingInterestController.getListingInterestById);
router.get("/listing/:listing_id", authorize(["admin", "farmer"]), listingInterestController.getListingInterestsByListing);
router.get("/user/:user_id", authorize(["admin", "farmer"]), listingInterestController.getListingInterestsByUser);
router.get("/farmer/:user_id", authorize(["admin", "farmer"]),listingInterestController.getListingInterestsByFarmer);

export default router;