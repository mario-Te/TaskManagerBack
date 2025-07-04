const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { jwtAuthMiddleware } = require("../jwt");

router
  .route("/")
  .post(jwtAuthMiddleware, teamController.createTeam)
  .get(jwtAuthMiddleware, teamController.getTeams);
router
  .route("/:id")
  .patch(jwtAuthMiddleware, teamController.updateTeam)
  .delete(jwtAuthMiddleware, teamController.deleteTeam);

router.route("/members").post(jwtAuthMiddleware, teamController.addTeamMember);

router
  .route("/:id/members/:memberId")
  .delete(jwtAuthMiddleware, teamController.removeTeamMember);

module.exports = router;
