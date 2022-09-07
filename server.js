const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config({ silent: true });

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Successful response.");
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@jerryl-we-are-the-champ.xuvzrsr.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() =>
    app.listen(PORT, () => console.log(`Server is running on ${PORT}`))
  );
