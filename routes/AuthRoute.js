const { Router } = require("express");
const authController = require("../controllers/AuthController");
const rpfpController = require("../controllers/PassresetController");
const tauthController = require("../controllers/TravelerauthContoller");
const { checkRPtoken, requireAuth } = require("../middleware/Middleware");

const router = Router();

//User
//login+signup
router.post("/signup", authController.singup_post);
router.post("/login", authController.login_post);
router.post("/logout", requireAuth, authController.logout_post);

//forgot-password
router.post("/forgot-password", rpfpController.fp_post);
router.get("/reset-password/:id/:token", checkRPtoken, rpfpController.rp_get);
router.post("/reset-password/:id/:token", checkRPtoken, rpfpController.rp_post);

//Traveler
//login+signup
router.post("/travelersignup", tauthController.tsignup_post);

//Email Verification
router.get("/confirm-email/:id/:token", authController.confirmEmail_get);

module.exports = router;
