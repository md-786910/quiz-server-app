const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  option: {
    type: Array,
  },
  answer: {
    type: Array,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "admin",
  },
});

const quizModel = mongoose.model("quiz", quizSchema);
module.exports = quizModel;
