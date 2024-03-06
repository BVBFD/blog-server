const {
  loginService,
  logOutService,
  signUpService,
  updateService,
  removeService,
} = require("../services/loginDataServices.js");

const login = async (req, res) => {
  const result = await loginService(req, res);
  return res.status(200).json(result);
};

const logOut = async (req, res) => {
  const { result, status } = await logOutService(req);
  return res.status(status).json(result);
};

const signUp = async (req, res) => {
  const { result, status } = await signUpService(req, res);
  return res.status(status).json(result);
};

const update = async (req, res) => {
  const { result, status } = await updateService(req);
  return res.status(status).json(result);
};

const remove = async (req, res) => {
  const { result, status } = await removeService(req);
  return res.status(status).json(result);
};

module.exports = { login, logOut, signUp, update, remove };
