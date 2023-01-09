const jwt = require("jsonwebtoken");
const admin = require("../models/admin/admin");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt_token;
    const decode = await jwt.verify(token, process.env.admin_jwt);
    const user = await admin.findOne({
      _id: decode._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("error in admin auth");
    }
    user.isVerified = true;
    await user.save();
    req.user = user;
    req.admin = user;
    req.token = token;
    req.AdminId = user._id;
    next();
  } catch (error) {
    res.status(404).json({ message: "Admin not authorized to login!" + error });
  }
};
module.exports = auth;
