const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const lodash = require("lodash");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  questionToken: {
    type: Array,
    required: false,
  },
  tokens: [
    {
      token: String,
    },
  ],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  result: {
    type: Array,
    required: false,
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = await jwt.sign(
    { _id: user._id.toString() },
    "mynameisuser"
    // process.env.user_jwt
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};
userSchema.methods.testCompleted = async function (next) {
  const user = this;
  user.isCompleted = true;
  const userResultVerified = lodash.pick(user, [
    "name",
    "email",
    "isCompleted",
    "result",
  ]);
  await user.save();
  return userResultVerified;
};

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
