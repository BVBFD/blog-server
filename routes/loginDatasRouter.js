const express = require("express");
require("express-async-errors");
const {
  login,
  signUp,
  update,
  remove,
  logOut,
} = require("../controllers/loginDatasController.js");

const router = express.Router();

router.post("/login", login);

router.post("/logout", logOut);

router.post("/signup", signUp);

router.put("/update", update);

router.delete("/delete", remove);

module.exports = router;
