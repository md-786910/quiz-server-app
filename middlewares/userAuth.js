const jwt = require("jsonwebtoken");
const userModel = require("../models/client/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt_token_user;
    const decode = await jwt.verify(token, process.env.user_jwt);
    const user = await userModel.findOne({
      _id: decode._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("error in user auth");
    }
    user.isVerified = true;
    await user.save();
    req.user = user;
    req.userQues = user;
    req.token = token;
    req.id = user._id;
    next();
  } catch (error) {
    res.status(404).json({ message: "user not authorized to login!" });
  }
};
module.exports = userAuth;
