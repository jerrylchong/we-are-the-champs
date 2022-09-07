const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ silent: true });

const controller = require("./controller");

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/teams", controller.getAllTeams);
app.get("/standings", controller.getGroupStandings);

app.post("/teams", controller.addTeam);

app.put("/match", controller.addMatch);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@jerryl-we-are-the-champ.xuvzrsr.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() =>
    app.listen(PORT, () => console.log(`Server is running on ${PORT}`))
  );
