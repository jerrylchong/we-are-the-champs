const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config({ silent: true });

const TeamController = require("./controllers/TeamController");
const GroupController = require("./controllers/GroupController");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.get("/teams", TeamController.getAllTeams);
app.get("/groups", GroupController.getGroups);

app.post("/teams", TeamController.addTeams);

app.put("/match", TeamController.addMatches);

app.delete("", async (req, res) => {
  await TeamController.clearTeams();
  await GroupController.clearGroups();
  return res.status(200).json("Groups and teams deleted");
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@jerryl-we-are-the-champ.xuvzrsr.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() =>
    app.listen(PORT, () => console.log(`Server is running on ${PORT}`))
  );
