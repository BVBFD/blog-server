const LoginDatasModel = require("../models/loginDatasModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TokenDatasModel = require("../models/tokenDatasModel.js");

const generateAccessToken = (userInfo) => {
  return jwt.sign(userInfo, `${process.env.JWT_SECRET_KEY}`, {
    expiresIn: "3h",
  });
};

const generateRefreshToken = (userInfo) => {
  return jwt.sign(userInfo, `${process.env.JWT_SECRET_KEY}`, {
    expiresIn: "1d",
  });
};

const loginService = async (req, res) => {
  const foundLoginData = await LoginDatasModel.findOne({
    userId: req.body.userId,
  });

  if (!foundLoginData) {
    return res.status(401).json({ message: "Invalid Id and Pwd!" });
  }

  const checkedPwd = await bcrypt.compare(
    req.body.password,
    foundLoginData.password
  );

  if (!checkedPwd) {
    return res.status(401).json({ message: "Invalid Id and Pwd!" });
  }

  const { password, ...sendLoginData } = foundLoginData._doc;

  const accessToken = generateAccessToken({
    userId: sendLoginData.userId,
    editable: sendLoginData.editable,
  });
  const refreshToken = generateRefreshToken({
    userId: sendLoginData.userId,
    editable: sendLoginData.editable,
  });

  const newTokenData = new TokenDatasModel({
    userId: sendLoginData.userId,
    editable: sendLoginData.editable,
    accessToken,
    refreshToken,
  });
  await newTokenData.save();

  res.cookie("accessToken", accessToken, {
    // 3시간동안 유효
    maxAge: 10800000,
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.cookie("refreshToken", refreshToken, {
    // 하루동안 유효
    maxAge: 259200000,
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  return { sendLoginData };
};

const logOutService = async (req) => {
  const { userId } = req.body;

  if (!userId) {
    return { result: { message: "Bad Request!" }, status: 400 };
  }

  const foundTokenData = await TokenDatasModel.findOneAndDelete({
    userId,
  });

  if (!foundTokenData) {
    return { result: { message: "Not Found!" }, status: 404 };
  }

  return { result: foundTokenData, status: 200 };
};

const signUpService = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(req.body.password, salt);
    const newLoginData = new LoginDatasModel({
      userId: req.body.userId,
      password: hashedPwd,
      email: req.body.email,
      profilePic: req.body.profilePic,
      editable: req.body.editable,
    });
    const savedNewLoginData = await newLoginData.save();
    const { password, ...data } = savedNewLoginData._doc;

    const accessToken = generateAccessToken({
      userId: data.userId,
      editable: data.editable,
    });
    const refreshToken = generateRefreshToken({
      userId: data.userId,
      editable: data.editable,
    });

    const newTokenData = new TokenDatasModel({
      userId: data.userId,
      editable: data.editable,
      accessToken,
      refreshToken,
    });

    await newTokenData.save();

    res.cookie("accessToken", accessToken, {
      // 3시간동안 유효
      maxAge: 10800000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.cookie("refreshToken", refreshToken, {
      // 하루동안 유효
      maxAge: 259200000,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return { result: { data }, status: 201 };
  } catch (err) {
    return { result: { message: "This Id already existed!" }, status: 409 };
  }
};

const updateService = async (req) => {
  if (req.body.password !== undefined) {
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(req.body.password, salt);
    const foundOriginData = await LoginDatasModel.findOne({
      userId: req.body.userId,
    });

    if (!foundOriginData) {
      return {
        result: { message: "You can only set your own data!" },
        status: 401,
      };
    }

    const updatedLoginData = await LoginDatasModel.findByIdAndUpdate(
      foundOriginData.id,
      {
        userId: req.body.updatedId,
        password: hashedPwd,
        email: req.body.email,
        profilePic: req.body.profilePic,
      },
      { returnOriginal: false }
    );
    const { password, ...sendUpdatedLoginData } = updatedLoginData._doc;
    return { result: { sendUpdatedLoginData }, status: 201 };
  } else {
    const foundOriginData = await LoginDatasModel.findOne({
      userId: req.body.userId,
    });

    if (!foundOriginData) {
      return {
        result: { message: "You can only set your own data!" },
        status: 401,
      };
    }

    const updatedLoginData = await LoginDatasModel.findByIdAndUpdate(
      foundOriginData.id,
      {
        userId: req.body.updatedId,
        email: req.body.email,
        profilePic: req.body.profilePic,
      },
      { returnOriginal: false }
    );
    const { password, ...sendUpdatedLoginData } = updatedLoginData._doc;
    return { result: { sendUpdatedLoginData }, status: 201 };
  }
};

const removeService = async (req) => {
  const foundUserData = await LoginDatasModel.findOne({
    userId: `${req.query.userId}`,
  });

  if (!foundUserData) {
    return {
      result: { message: "Bad request!" },
      status: 400,
    };
  }

  if (req.query.userId === foundUserData.userId) {
    await foundUserData.delete();
    return { result: { message: "UserData has been deleted!" }, status: 204 };
  } else {
    return {
      result: { message: "You can delete own your login data!" },
      status: 401,
    };
  }
};

module.exports = {
  loginService,
  logOutService,
  signUpService,
  updateService,
  removeService,
};
