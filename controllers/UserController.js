const User = require("../models/User");
const Team = require("../models/Teams");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
// LOGIN USER
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } });
    if (!users) {
      res.status(404).json({
        msg: "no users found",
      });
    } else {
      res.status(200).json(users);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred",
      details: error.message,
    });
  }
};
exports.getTeamUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find all teams the user is a member of
    const userTeams = await Team.find({
      $or: [{ members: userId }, { createdBy: userId }],
    }).populate({
      path: "members",
      select: "_id name email",
      match: { _id: { $ne: userId } }, // Exclude current user
    });

    // 2. Create a map to store users with their teams
    const userTeamMap = new Map();

    // 3. Process each team and its members
    userTeams.forEach((team) => {
      team.members.forEach((member) => {
        if (!userTeamMap.has(member._id.toString())) {
          userTeamMap.set(member._id.toString(), {
            _id: member._id,
            name: member.name,
            email: member.email,
            teams: [team.name], // Initialize with first team
          });
        } else {
          // Add team to existing user's teams array if not already present
          const user = userTeamMap.get(member._id.toString());
          if (!user.teams.includes(team.name)) {
            user.teams.push(team.name);
          }
        }
      });
    });

    // 4. Convert to array and format response
    const response = Array.from(userTeamMap.values()).map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      team: user.teams.join(", "), // Combine multiple teams with comma
    }));

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shared team users",
      error: error.message,
    });
  }
};
exports.loginUser = async (req, res) => {
  try {
    // extract username and password from body
    const { email, password } = req.body;
    // Find the user in the database
    const user = await User.findOne({ email: email });
    // If user does not exists or password does not match
    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({
        error: "Invalid username or password",
      });
    }
    const payload = {
      id: user.id,
      email: user.email,
    };
    const token = generateToken(payload);
    //   return token
    res.json({ name: user.name, token });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while logging in",
      details: error.message,
    });
  }
};
// REGISTER USER
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }
    user = new User({ name, email, password });
    savedUser = await user.save();

    res.status(201).json({
      message: "user registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while registering user",
      details: error.message,
    });
  }
};

// exports.getAllUsers("/profile", jwtAuthMiddleware, async (req, res) => {
//   try {
//     const userData = req.user
//     console.log(userData);

//   }
// })
