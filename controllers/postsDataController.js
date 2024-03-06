const PostDatasModel = require("../models/postDatasModel.js");
const {
  getAllPostsByQueryService,
  getPostsByIdService,
  uploadPostService,
  updatePostService,
  deletePostService,
} = require("../services/postsDataServices.js");

const getAllPostsByQuery = async (req, res) => {
  // prettier-ignore
  const { foundPosts, totalPostsCount } = await getAllPostsByQueryService(req, res);

  if (!totalPostsCount) {
    return res.status(400).json({ message: "Wrong TotalPostsCount!" });
  }

  return res.status(200).json({ posts: foundPosts, totalPostsCount });
};

const getPostsById = async (req, res) => {
  const foundPost = await getPostsByIdService(req, res);
  return res.status(200).json(foundPost);
};

const uploadPost = async (req, res) => {
  const { result, status } = await uploadPostService(req);
  return res.status(status).json(result);
};

const updatePost = async (req, res) => {
  const { result, status } = await updatePostService(req);
  return res.status(status).json(result);
};

const deletePost = async (req, res) => {
  const { result, status } = await deletePostService(req);
  return res.status(status).json(result);
};

module.exports = {
  getAllPostsByQuery,
  getPostsById,
  uploadPost,
  updatePost,
  deletePost,
};
