const Team = require("../models/Teams");
// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  const { name, description, members } = req.body;
  if (!name) {
    res.status(400);
    throw new Error("Team name is required");
  }

  const team = await Team.create({
    name,
    description,
    members: members.map((m) => m._id),
    createdBy: req.user.id, // Assuming you have user auth middleware
  });

  res.status(201).json(team);
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res) => {
  const userId = req.user.id;
  const teams = await Team.find({
    $or: [{ members: userId }, { createdBy: userId }],
  })
    .populate("createdBy", "name email")
    .populate("members", "name email");

  res.json(teams);
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Only team creator or admin)
const updateTeam = async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Check if user is the creator or admin
  if (team.createdBy.toString() !== req.user.id.toString()) {
    res.status(401);
    throw new Error("Not authorized to update this team");
  }

  const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("members.userId", "name email");

  res.json(updatedTeam);
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Only team creator or admin)
const deleteTeam = async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Check if user is the creator or admin
  if (team.createdBy.toString() !== req.user.id.toString()) {
    res.status(401);
    throw new Error("Not authorized to delete this team");
  }

  await team.deleteOne({ _id: req.params._id });
  res.json({ message: "Team removed" });
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private (Only team creator or admin)
const addTeamMember = async (req, res) => {
  try {
    const { userIds, teamId } = req.body; // Changed from userId to userIds (array)

    // Validate input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required and must not be empty",
      });
    }

    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: "Team ID is required",
      });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check for existing members
    const existingMembers = team.members.map((member) => member.toString());
    const newMembers = userIds.filter(
      (userId) => !existingMembers.includes(userId.toString())
    );

    if (newMembers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All users are already team members",
      });
    }

    // Add new members to team
    team.members.push(...newMembers);
    await team.save();

    // Optionally populate the member details
    const updatedTeam = await Team.findById(teamId).populate(
      "members",
      "name email"
    );

    return res.status(201).json({
      success: true,
      addedCount: newMembers.length,
      data: updatedTeam,
    });
  } catch (error) {
    console.error("Error adding team members:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:memberId
// @access  Private (Only team creator or admin)
const removeTeamMember = async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Check if member exists
  const memberIndex = team.members.findIndex(
    (member) => member._id.toString() === req.params.memberId
  );

  if (memberIndex === -1) {
    res.status(404);
    throw new Error("Member not found in this team");
  }

  team.members.splice(memberIndex, 1);
  await team.save();

  res.json(team);
};

module.exports = {
  createTeam,
  getTeams,
  updateTeam,

  deleteTeam,
  addTeamMember,
  removeTeamMember,
};
