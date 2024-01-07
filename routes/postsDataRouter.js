const express = require("express");
require("express-async-errors");
const {
  deletePost,
  getAllPostsByQuery,
  getPostsById,
  updatePost,
  uploadPost,
} = require("../controllers/postsDataController.js");
const verifyToken = require("../middlewares/verifyToken.js");

const router = express.Router();

router.get("/", getAllPostsByQuery);

router.get("/:id", getPostsById);

router.post("/", verifyToken, uploadPost);

router.put("/:id", verifyToken, updatePost);

router.delete("/:id", verifyToken, deletePost);

module.exports = router;
