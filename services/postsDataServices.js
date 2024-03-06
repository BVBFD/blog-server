const PostDatasModel = require("../models/postDatasModel.js");

const getAllPostsByQueryService = async (req, res) => {
  const catName = req.query.cat ? decodeURIComponent(req.query.cat) : null;
  const text = req.query.text ? decodeURIComponent(req.query.text) : null;
  const page = req.query.page;

  // 한페이지당 나오는 포스트 갯수
  const pageSize = 4;
  // 클릭한 page 숫자에 따라 계산할 예정
  let skipAmount = 0;
  // db에 있는 포스트 역순으로 재배치
  const sortOptions = { createdAt: -1 };

  let query = {};

  let totalPostsCount;

  if (catName) {
    query.catName = catName;
  }

  if (text) {
    // 정규표현식 대소문자 없이 구분없이 검색
    query.title = { $regex: new RegExp(text, "i") };
  }

  if (page) {
    // 클릭한 페이지 숫자에 따라 skipAmount 결정
    skipAmount = (page - 1) * pageSize;
  }

  // 해당 쿼리에 맞는 포스트를 찾음
  let foundPosts = await PostDatasModel.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize)
    .select("imgUrl title createdAt");

  if (foundPosts.length === 0) {
    return res.status(404).json({ message: "Not Found Posts!" });
  }

  totalPostsCount = await PostDatasModel.countDocuments(query);

  return {
    foundPosts,
    totalPostsCount,
  };
};

const getPostsByIdService = async (req, res) => {
  const paramId = req.params.id;
  const meta = req.query.meta;
  const foundPost = await PostDatasModel.findById(paramId);

  if (!foundPost) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (meta) {
    // prettier-ignore
    const { text, catName, author, createdAt, updatedAt, ...others } = foundPost.toObject();
    return others;
  } else {
    return foundPost;
  }
};

const uploadPostService = async (req) => {
  try {
    const newPost = new PostDatasModel({
      imgUrl: req.body.imgUrl,
      title: req.body.title,
      text: req.body.text,
      catName: req.body.catName,
      author: req.body.author,
    });
    const savedNewPost = await newPost.save();

    return { result: { savedNewPost }, status: 201 };
  } catch (err) {
    return { result: { message: "Failed to Upload Post!" }, status: 401 };
  }
};

const updatePostService = async (req) => {
  const paramId = req.params.id;
  const foundPost = await PostDatasModel.findById(paramId);

  if (!foundPost) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (req.body.author === foundPost.author) {
    const updatedPost = await PostDatasModel.findByIdAndUpdate(
      paramId,
      req.body,
      { returnOriginal: false }
    );

    return { result: { updatedPost }, status: 201 };
  } else {
    return {
      result: { message: "You can update and delete your own posts!" },
      status: 401,
    };
  }
};

const deletePostService = async (req) => {
  const paramId = req.params.id;
  const foundPost = await PostDatasModel.findById(paramId);

  if (!foundPost) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (req.body.author === foundPost.author) {
    await foundPost.remove();
    return { result: { message: "The Post has been deleted!" }, status: 204 };
  } else {
    return {
      result: { message: "You can update and delete your own posts!" },
      status: 404,
    };
  }
};

module.exports = {
  getAllPostsByQueryService,
  getPostsByIdService,
  uploadPostService,
  updatePostService,
  deletePostService,
};
