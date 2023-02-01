const mongoose = require('mongoose');

const LoginDatasSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    profilePic: {
      type: String,
      required: false,
      default: '',
    },
    editable: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginDatas', LoginDatasSchema);
