const mongoose = require("mongoose")

// connection to database

mongoose
  .connect(
    "mongodb+srv://Mohiodin:mohiodin@cluster0.sossjpd.mongodb.net/express-auth"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err.message))
