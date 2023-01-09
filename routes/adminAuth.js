const adminModel = require("../models/admin/admin");
const bcrypt = require("bcryptjs");
const router = require("express").Router();

router.post("/adminRegister", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (
      name &&
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword
    ) {
      // check admin exist or not
      let admin = await adminModel.findOne({ email: email });
      if (admin) {
        res.status(302).json({ message: "Already admin registered!" });
      } else {
        const saveAdmin = new adminModel(req.body);
        await saveAdmin.save();

        const token = await admin.generateAuthToken(email, password);
        // add to cookies
        if (token) {
          res.cookie("jwt_token", token, {
            httpOnly: true,
          });

          res.status(200).json({ message: "login successfully!" });
        } else {
          res.status(404).json({ message: "error for generating token!" });
        }

        res.status(201).json({ message: "admin registered successfully" });
      }
    } else {
      res.status(404).json({ message: "invalid credentials! " });
    }
  } catch (error) {
    res.status(404).json({ message: "registered server error occured!" });
  }
});

router.post("/adminLogin", async (req, res) => {
  try {
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");

    const { email, password } = req.body;
    if (email && password) {
      const admin = await adminModel.findOne({
        email: email,
      });
      const matchPassword = await bcrypt.compare(password, admin.password);
      if (matchPassword) {
        // generate token
        const token = await admin.generateAuthToken(email, password);
        // add to cookies
        if (token) {
          res.cookie("jwt_token", token, {
            httpOnly: true,
          });

          res.status(200).json({ message: "login successfully!" });
        } else {
          res.status(404).json({ message: "error for generating token!" });
        }
      } else {
        res.status(404).json({ message: "invalid credentials!" });
      }
    } else {
      res.status(404).json({ message: "admin not login!" });
    }
  } catch (error) {
    res.status(404).json({ message: "login error!" });
  }
});

module.exports = router;
