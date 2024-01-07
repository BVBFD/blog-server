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

const login = async (req, res, next) => {
  try {
    const foundLoginData = await LoginDatasModel.findOne({
      userId: req.body.userId,
    });

    if (!foundLoginData) {
      return res.status(401).json("Invalid Id and Pwd!");
    }

    const checkedPwd = await bcrypt.compare(
      req.body.password,
      foundLoginData.password
    );

    if (!checkedPwd) {
      return res.status(401).json("Invalid Id and Pwd!");
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

    return res.status(200).json({ sendLoginData });
  } catch (err) {
    return res.status(500).json("server errors!");
  }
};

const logOut = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const foundTokenData = await TokenDatasModel.findOneAndDelete({
      userId,
    });
    return res.status(200).json(foundTokenData);
  } catch (error) {
    return res.status(500).json("server errors!");
  }
};

const signUp = async (req, res, next) => {
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

    return res.status(201).json({ data });
  } catch (err) {
    return res.status(409).json({ message: "This Id already existed!" });
  }
};

const update = async (req, res, next) => {
  if (req.body.password !== undefined) {
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(req.body.password, salt);
    const foundOriginData = await LoginDatasModel.findOne({
      userId: req.body.userId,
    });

    if (!foundOriginData) {
      return res.status(401).send("You can only set your own data!");
    }

    try {
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
      return res.status(201).json({ sendUpdatedLoginData });
    } catch (err) {
      return res.status(401).send(err);
    }
  } else {
    const foundOriginData = await LoginDatasModel.findOne({
      userId: req.body.userId,
    });

    if (!foundOriginData) {
      return res.status(401).send("You can only set your own data!");
    }

    try {
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
      return res.status(201).json({ sendUpdatedLoginData });
    } catch (err) {
      return res.status(401).send(err);
    }
  }
};

const remove = async (req, res, next) => {
  try {
    const foundUserData = await LoginDatasModel.findOne({
      userId: req.body.userId,
    });

    if (!foundUserData) {
      return res.status(400).json("Bad request!");
    }

    if (req.body.userId === foundUserData.userId) {
      foundUserData.delete();
      return res.status(204).json("UserData has been deleted!");
    } else {
      return res.status(401).json("You can delete own your login data!");
    }
  } catch (err) {
    return res.status(401).json(err);
  }
};

module.exports = { login, logOut, signUp, update, remove };
