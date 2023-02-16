// Require
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const { response } = require("express");
const path = require("path");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const categoryRoute = require("./routes/categories");
const passport = require("passport");
const cookieSession = require("cookie-session");

//Use
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));

app.use(
  cookieSession({
    name: "session",
    keys: ["riderblog"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3002",
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("Connected to Mongo"))
  .catch((err) => console.log(err));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  res.status(200).json("File successfully uploaded");
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/categories", categoryRoute);

// Error Handling

// Listeners
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
