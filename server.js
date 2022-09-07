const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ silent: true });

const TeamController = require("./controllers/TeamController");

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/teams", TeamController.getAllTeams);
app.get("/standings", TeamController.getGroupStandings);

app.post("/teams", TeamController.addTeam);

app.put("/match", TeamController.addMatch);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@jerryl-we-are-the-champ.xuvzrsr.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() =>
    app.listen(PORT, () => console.log(`Server is running on ${PORT}`))
  );
