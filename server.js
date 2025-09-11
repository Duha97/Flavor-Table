require("dotenv").config();

const express = require("express");
const axios = require ("axios");
const cors = require("cors");
const path = require('path');

const app = express();
app.use(cors());

const homeRoutes = require("./routes/home");
const recipeRoutes = require("./routes/recipes")

app.use("/", homeRoutes);
app.use("/recipes", recipeRoutes);
app.use(express.static("public"));

app.use((req,res)=>{
  res.status(404).send("Page not found <a href='/'>Go Home</a>")
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port http://localhost:${port}`)
})