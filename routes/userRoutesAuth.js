const bcrypt = require("bcryptjs");
const userAuth = require("../middlewares/userAuth");
const userModel = require("../models/client/user");
const router = require("express").Router();
const lodash = require("lodash");
router.post("/userRegister", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (
      name &&
      email &&
      password &&
      confirmPassword &&
      password === confirmPassword
    ) {
      // check user exist or not
      let user = await userModel.findOne({ email: email });
      if (user) {
        res.status(302).json({ message: "Already user registered!" });
      } else {
        const saveuser = new userModel(req.body);
        await saveuser.save();
        res.status(201).json({ message: "user registered successfully" });
      }
    } else {
      res.status(404).json({ message: "invalid credentials! " });
    }
  } catch (error) {
    res.status(404).json({ message: "registered server error occured!" });
  }
});

router.post("/userLogin", async (req, res) => {
  try {
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");

    const { email, password } = req.body;
    if (email && password) {
      const user = await userModel.findOne({
        email: email,
      });
      const matchPassword = await bcrypt.compare(password, user.password);
      if (matchPassword) {
        // generate token
        const token = await user.generateAuthToken(email, password);
        // add to cookies

        res.cookie("jwt_token_user", token, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });

        res.status(200).json({ message: "login successfully!" });
      } else {
        res.status(404).json({ message: "invalid credentials!" });
      }
    } else {
      res.status(404).json({ message: "user not login!" });
    }
  } catch (error) {
    res.status(404).json({ message: "login error!" });
  }
});

router.post("/sendResult", userAuth, async (req, res) => {
  try {
    const { title, opt, ans } = req.body.result;
    const id = req.id;
    const findAns = opt.map((o) => true && ans.includes(o));
    let checkAns = true;
    for (let i = 0; i < findAns.length; i++) {
      checkAns = checkAns && findAns[i];
    }
    const points = checkAns ? 5 : -2;
    const findUser = await userModel.findById(id);
    findUser.result.push({ title: title, answer: points });
    await findUser.save();
    res.status(200).json({ message: "result success!" });
  } catch (error) {
    res.status(404).json({ message: "submit resullt error!" });
  }
});

router.get("/submitTest", userAuth, async (req, res) => {
  try {
    const id = req.id;
    const findUser = await userModel.findById(id);
    const userRes = await findUser.testCompleted();
    res.status(200).json({
      message: "submit successfully!",
      data: userRes,
    });
  } catch (error) {
    res.status(404).json({ message: "submit resullt error!" });
  }
});

router.get("/getUserResult", userAuth, async (req, res) => {
  try {
    const id = req.id;
    const findUser = await userModel.findById(id);

    const userRes = lodash.pick(findUser, ["name", "isCompleted", "result"]);

    let correctCount = 0;

    findUser.result.forEach((a) => {
      if (a.answer === 5) {
        correctCount++;
      }
    });

    res.status(200).json({
      message: "submit successfully!",
      data: userRes,
      correct: correctCount,
    });
  } catch (error) {
    res.status(404).json({ message: "forbidded" });
  }
});

module.exports = router;
