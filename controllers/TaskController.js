const Task = require("../models/Task");

const { Socket, socketEvents } = require("../notifications");

// GET FUNCTIONS
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Task.find({ userId });
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

// POST FUNCTIONS
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;

    const userId = assignedTo ? assignedTo : req.user.id;
    // create new task
    const newTask = new Task({
      userId,
      title,
      description,
      status,
      priority,
    });
    Socket.emit("new-notification", newTask, userId);

    const savedTask = await newTask.save();
    res.status(201).json({
      response: savedTask,
      msg: "task created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred",
      details: error.message,
    });
  }
};
exports.getUnseenTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await Task.find({ userId, seen: false });
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};
// PUT FUNCTIONS
exports.seeTask = async (req, res) => {
  try {
    console.log("Seening");
    const taskId = req.body.notificationId;
    const userId = req.user.id;

    const response = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      { seen: true },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!response) {
      return res.status(404).json({ error: "task not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred",
      details: error.message,
    });
  }
};
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTaskData = req.body;
    const userId = req.user.id;

    const response = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      updatedTaskData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!response) {
      return res.status(404).json({ error: "task not found" });
    }
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred",
      details: error.message,
    });
  }
};
// DELETE FUNCTIONS
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const userId = req.user.id;

    const response = await Task.findOneAndDelete({ _id: taskId, userId });
    if (!response) {
      return res.status(404).json({ error: "task not found" });
    }
    res.status(200).json({
      response: response,
      message: "task deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred",
      details: error.message,
    });
  }
};
exports.deleteAllTasks = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred",
      details: error.message,
    });
  }
};
