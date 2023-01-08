const quizModel = require("../models/admin/quiz");
const router = require("express").Router();
const auth = require("../middlewares/auth");
const userAuth = require("../middlewares/userAuth");
const crypto = require("crypto");
const adminModel = require("../models/admin/admin");
const axios = require("axios");
router.post("/createQuestion", auth, async (req, res) => {
  try {
    let data = req.body;
    const { title, level, option, answer } = req.body;
    const quizSave = new quizModel({
      title: title,
      level: level,
      option: [option.op1, option.op2, option.op3, option.op4],
      answer: [answer.ans1, answer.ans2, answer.ans3, answer.ans4],
      owner: req.AdminId,
    });
    const s = await quizSave.save();
    res.status(201).json({ message: "successfully create", data: data });
  } catch (error) {
    res.status(404).json({ message: "server error" });
  }
});

router.get("/getQuestion", auth, async (req, res) => {
  try {
    // const data = await quizModel.find({}).sort({ _id: 1 });
    const adminQues = await adminModel.findById(req.user._id);
    await adminQues.populate("tasks");
    res
      .status(200)
      .json({ message: "updated successfully", data: adminQues.tasks });
  } catch (error) {
    res.status(404).json({ message: "question not found!" });
  }
});
router.delete("/deleteQuestion", auth, async (req, res) => {
  try {
    const id = req.body;
    await quizModel.findByIdAndDelete({ _id: id.id });
    const data = await quizModel.find({}).sort({ _id: 1 });
    res.status(200).json({ message: "deleted successfully", data: data });
  } catch (error) {
    res.status(404).json({ message: "Admin not login ! please login" });
  }
});

// create test link
router.get("/createTest", auth, async (req, res) => {
  try {
    const rand = crypto.randomBytes(10).toString("hex");
    const examUrl = `http://localhost:3000/user/testPage?id=${rand}`;
    req.admin.questionToken = req.admin.questionToken.concat({ token: rand });
    await req.admin.save();
    res.cookie("id", req.AdminId);
    res.status(200).json({
      message: "exam link create successfully",
      link: examUrl,
      id: req.AdminId,
    });
  } catch (error) {
    res.status(404).json({ message: "error occured!" + error.message });
  }
});

router.get("/createTestLink", userAuth, async (req, res) => {
  try {
    const { id } = req.query;
    const adminId = req.cookies.id;
    const user = await adminModel.findById(adminId);
    await user.populate("tasks");
    res.status(200).json({ admin: user, message: user.tasks });
  } catch (error) {
    res.status(404).json({ message: "error occured!" + error.message });
  }
});

module.exports = router;
