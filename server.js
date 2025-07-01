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
    origin: "https://task-manager-front-delta.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(bodyParser.json());

// CONFIGURATIONS
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PASSWORD;

// DATABASE CONNECTION
// Construct MongoDB URI from env variables
const mongoDbPath = `mongodb+srv://${
  process.env.MONGO_DB_USERNAME
}:${encodeURIComponent(process.env.MONGO_DB_PASSWORD)}@${
  process.env.MONGO_DB_HOST
}/${
  process.env.MONGO_DB_NAME
}?retryWrites=true&w=majority&appName=MongoCluster`;
mongoose.Promise = global.Promise;
mongoose
  .connect(mongoDbPath, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongoose Connected: Success  on " + mongoDbPath);
  });

// ROUTES
const taskRoutes = require("./routes/TaskRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/task", taskRoutes);
app.use("/user", userRoutes);
app.use("/notification", userRoutes);
// Create HTTP server
const server = http.createServer(app);
io.attach(server, {
  cors: {
    origin: "https://task-manager-front-delta.vercel.app",
    credentials: true,
  },
});
io.origin = "*";
/////////////////////////////////////////////////////////////
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
