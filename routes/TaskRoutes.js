const express = require("express");
const router = express.Router();
const taskController = require("../controllers/TaskController");
const { jwtAuthMiddleware } = require("../jwt");

router.get("/", jwtAuthMiddleware, taskController.getAllTasks);

router.get("/unseen", jwtAuthMiddleware, taskController.getUnseenTasks);
router.post("/see-task", jwtAuthMiddleware, taskController.seeTask);
router.put("/:id", jwtAuthMiddleware, taskController.updateTask);

router.post("/", jwtAuthMiddleware, taskController.createTask);
router.delete("/:id", jwtAuthMiddleware, taskController.deleteTask);

// router.delete("/")

module.exports = router;
