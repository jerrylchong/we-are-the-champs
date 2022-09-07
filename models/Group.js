const mongoose = require("mongoose");
const { TeamSchema } = require("./Team");

const GroupSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true,
  },
  teams: [TeamSchema],
});

const Group = mongoose.model("Group", GroupSchema);

module.exports = { Group };
