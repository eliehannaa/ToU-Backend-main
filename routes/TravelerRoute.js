const { Router } = require("express");

const travController = require("../controllers/TravelerController");
const ticketController = require("../controllers/TicketController");
const {
  checkTraveler,
  checkToken_mb,
  requireAuth,
} = require("../middleware/Middleware");

const router = Router();

router.get(
  "/traveler/home/pendingorders",
  requireAuth,
  travController.getPendingTrav_get
);
router.get(
  "/traveler/home/activeorders",
  requireAuth,
  travController.getActiveTrav_get
);
router.get("/checktokenmobile", requireAuth, travController.splashScreen_get);
router.get("/profile", requireAuth, travController.getProfile);
router.get("/hasTicket", requireAuth, travController.hasTicket);
router.post("/profile/edit", requireAuth, travController.editProfile);
router.post("/cancelflight", requireAuth, travController.cancel_flight);
router.post("/providePickup", requireAuth, travController.providePickup_post);
router.post(
  "/traveler/home/uploadTicket",
  requireAuth,
  ticketController.uploadTicket_post
);
router.post(
  "/traveler/home/neworders/:orderid/accept",
  requireAuth,
  travController.accept_order
);
router.post(
  "/traveler/home/neworders/:orderid/reject",
  requireAuth,
  travController.reject_order
);
router.post(
  "/traveler/home/activeorders/:orderid/uploadproof",
  requireAuth,
  travController.uploadProof_post
);
router.post(
  "/traveler/home/activeorders/:orderid/markassent",
  requireAuth,
  travController.markshipped
);
router.post(
  "/traveler/home/activeorders/:orderid/markarrived",
  requireAuth,
  travController.markarrived
);

module.exports = router;
