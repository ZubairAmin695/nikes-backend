const mongoose = require("mongoose")

// connection to database

mongoose
  .connect(
    "mongodb://localhost:27017/nikes"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err.message))
