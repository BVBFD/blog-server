const express = require('express');
require('express-async-errors');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const cloudinary = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cookieParser = require('cookie-parser');

const postsDataRouter = require('./routes/postsDataRouter.js');
const loginDatasRouter = require('./routes/loginDatasRouter.js');
const ContactDatasModel = require('./models/contactDatasModel.js');

dotenv.config();

const app = express();
app.use(express.json());

const cspOptions = {
  directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),

    'img-src': ["'self'", 'data:', `*`],
    'media-src': [
      "'self'",
      'data:',
      `https://res.cloudinary.com https://www.youtube.com/embed/`,
    ],
    'child-src': [
      "'self'",
      'data:',
      `https://res.cloudinary.com https://www.youtube.com/embed/`,
    ],
    'frame-src': ["'self'", 'data:', `https://www.youtube.com/embed/`],
  },
};

app.use(
  helmet({
    contentSecurityPolicy: cspOptions,
  })
);

app.use(
  cors({
    origin: [
      `http://localhost:3000`,
      `https://www.lsevina126.asia`,
      'https://lsevina126.netlify.app',
      'https://9671-113-131-240-155.jp.ngrok.io',
    ],
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(morgan('tiny'));
app.use(cookieParser());

app.get('/lee', (req, res, next) => {
  console.log('Hey this is initial test code!');
  return res.status(200).send(console.log('Success!'));
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'myportfolioblogproject',
    format: async (req, file) => 'gif',
    public_id: (req, file) => req.filename,
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'myportfolioblogproject/video',
    resource_type: 'video',
    format: async (req, file) => 'mp4',
    public_id: (req, file) => req.filename,
    chunk_size: 8000000,
  },
});

const upload = multer({ storage: storage });
const videoUpload = multer({ storage: videoStorage });

app.post('/pic/upload', upload.single('file'), (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.status(200).json(req.file.path);
});

app.post('/video/upload', videoUpload.single('file'), (req, res, next) => {
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.status(200).json(req.file.path);
});

app.use('/posts', postsDataRouter);
app.use('/loginDatas', loginDatasRouter);
app.post('/contacts', async (req, res, next) => {
  try {
    const newContact = new ContactDatasModel({
      customerName: req.body.customerName,
      email: req.body.email,
      number: req.body.number,
      message: req.body.message,
    });
    !newContact && res.status(400).json('Bad Request!');
    const savedNewContact = await newContact.save();
    console.log(savedNewContact);
    res.status(201).json({ savedNewContact });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.use((req, res, next) => {
  res.sendStatus(404);
});

app.use((error, req, res, next) => {
  console.log(error);
  res.sendStatus(500);
});

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => console.log('Mongo DB Start!'))
  .catch((err) => console.error(err));

app.listen(process.env.PORT || 8800, () => {
  console.log('Backend is running check!');
});
