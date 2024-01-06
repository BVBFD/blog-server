const express = require("express");
require("express-async-errors");
const {
  login,
  signUp,
  update,
  remove,
  logOut,
} = require("../controllers/loginDatasController.js");
const verifyToken = require("../middlewares/verifyToken.js");

const router = express.Router();

router.post("/refresh", async (req, res, next) => {});

router.post("/login", login);

router.post("/logout", verifyToken, logOut);

router.post("/signup", signUp);

router.put("/update", update);

router.delete("/delete", remove);

module.exports = router;
