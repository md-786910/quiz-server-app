const express = require("express");
const cors = require("cors");
const consola = require("consola");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const lodash = require("lodash");
const port = process.env.PORT || 5000;
const app = express();

const quizRouter = require("./routes/quiz");
const adminAuthRouter = require("./routes/adminAuth");
const userAuthRouter = require("./routes/userRoutesAuth");
const userAuth = require("./middlewares/userAuth");
const auth = require("./middlewares/auth");
const quizModel = require("./models/admin/quiz");
const adminModel = require("./models/admin/admin");

const corsOptions = {
  origin: true, //included origin as true
  credentials: true, //included credentials as true
};

// middleware
dotenv.config({});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Routes

// admin routing
app.get("/", (req, res) => {
  res.status(200).json({ message: "server fine" });
});
app.get("/check_auth_admin", auth, async (req, res) => {
  const user = lodash.pick(req.user, ["name", "email", "isVerified"]);
  res.status(200).json({ message: user });
});
app.get("/admin_logout", auth, async (req, res) => {
  req.user.tokens = [];
  res.clearCookie("jwt_token");
  req.user.isVerified = false;
  await req.user.save();
  res.status(200).json({ message: "admin logout successfully!" });
});
app.use(quizRouter);
app.use(adminAuthRouter);

// user routing
app.get("/check_auth_user", userAuth, async (req, res) => {
  const user = lodash.pick(req.user, [
    "name",
    "email",
    "isVerified",
    "isCompleted",
  ]);
  res.status(200).json({ message: user });
});

app.get("/user_logout", userAuth, async (req, res) => {
  req.user.tokens = [];
  res.clearCookie("jwt_token_user");
  req.user.isVerified = false;
  await req.user.save();
  res.status(200).json({ message: "user logout successfully!" });
});

app.use(userAuthRouter);

const runDb = async () => {
  try {
    const DB = process.env.DB_URI;
    mongoose.set("strictQuery", false);
    await mongoose.connect(DB, { useUnifiedTopology: false });
    consola.success("connected to MongoDB");

    app.listen(port, async () => {
      consola.success("app is running on port " + port);
    });
  } catch (error) {
    console.log("connection error" + error.message);
  }
};
runDb();

// module.exports = ;
