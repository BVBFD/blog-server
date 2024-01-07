const mongoose = require("mongoose");

const TokenDatasSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    editable: {
      type: Boolean,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TokenDatas", TokenDatasSchema);
