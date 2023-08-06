require("dotenv").config();
require("./src/db/connection");
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
const cors = require("cors");
const session = require("express-session");
// const MongoStore = require("connect-mongo")(session);

// var indexRouter = require('./routes/index');
var usersRouter = require("./src/routes/users");
var adminRouter = require("./src/routes/admin");

var app = express();

app.set("trust proxy", 1);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
// app.use(
//   session({
//     secret: "secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: true,
//       httpOnly: false,
//       sameSite: "none",
//       maxAge: 60 * 60 * 1000,
//     },
//     rolling: true,
//     store: new MongoStore({
//       url: process.env.MONGO_URI,
//       ttl: 60 * 60 * 1000,
//     }),
//   })
// );

app.use(
  cors({
    origin: "*",
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Crypto Vaulet" });
});

app.use("/", usersRouter);
app.use("/admin", adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
