const express = require('express');
require('express-async-errors');
const {
  deletePost,
  getAllPostsByQuery,
  getPostsById,
  updatePost,
  uploadPost,
} = require('../controllers/postsDataController.js');

const router = express.Router();

router.get('/', getAllPostsByQuery);

router.get('/:id', getPostsById);

router.post('/', uploadPost);

router.put('/:id', updatePost);

router.delete('/:id', deletePost);

module.exports = router;
