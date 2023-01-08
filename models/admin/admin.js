const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminSchema = new mongoose.Schema({
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
  questionToken: [
    {
      token: String,
    },
  ],
  tokens: [
    {
      token: String,
    },
  ],
});

adminSchema.virtual("tasks", {
  ref: "quiz",
  localField: "_id",
  foreignField: "owner",
});

// userSchema.methods.toJSON = function () {
//   const user = this.toObject();
//   delete user.password;
//   delete user.tokens;
//   return user;
// };
adminSchema.pre("save", async function (next) {
  const admin = this;
  if (admin.isModified("password")) {
    admin.password = await bcrypt.hash(admin.password, 8);
  }
  next();
});

adminSchema.methods.generateAuthToken = async function () {
  const admin = this;
  const token = await jwt.sign(
    { _id: admin._id.toString() },
    "thisismynewcourse"
  );
  admin.tokens = admin.tokens.concat({ token });
  await admin.save();
  return token;
};
adminSchema.statics.findByCredentials = async (email, password) => {
  try {
    const user = await Users.findOne({ email });
    if (!user) throw new Error();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error();
    return user;
  } catch (e) {
    return "Unable to login";
  }
};

// userSchema.pre("remove", async function (next) {
//   const user = this;
//   await Tasks.remove({ owner: require.user._id });
//   next();
// });

const adminModel = mongoose.model("admin", adminSchema);
module.exports = adminModel;
