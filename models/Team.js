const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  registrationDate: {
    type: Date,
    required: true,
  },
  groupNo: {
    type: Number,
    required: true,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  draws: {
    type: Number,
    default: 0,
  },
  goals: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  alternatePoints: {
    type: Number,
    default: 0,
  },
});

const Team = mongoose.model("Team", TeamSchema);

module.exports = Team;
