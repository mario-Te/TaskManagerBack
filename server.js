const express = require("express");
const mongoose = require("mongoose");
const app = express();
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { io } = require("./notifications");
require("dotenv").config();

// MIDDLEWARES
app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Added PATCH
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

// CONFIGURATIONS
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PASSWORD;

// DATABASE CONNECTION
// Construct MongoDB URI from env variables
const mongoDbPath = "mongodb://localhost:27017/task_manager";
mongoose.Promise = global.Promise;
mongoose
  .connect(mongoDbPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongoose Connected: Success  on " + mongoDbPath);
  });
app.use(express.json());
// ROUTES
const taskRoutes = require("./routes/TaskRoutes");
const userRoutes = require("./routes/userRoutes");
const teamRoutes = require("./routes/teamRoutes");
app.use("/task", taskRoutes);
app.use("/user", userRoutes);
app.use("/notification", userRoutes);
app.use("/teams", teamRoutes);
// Create HTTP server
const server = http.createServer(app);
io.attach(server, {
  cors: {
    origin: "http://localhost:5000",
    credentials: true,
  },
});
io.origin = "*";
/////////////////////////////////////////////////////////////
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
