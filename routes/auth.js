const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    let newUser = null;

    // check if the user is registering with Google
    if (req.body.googleId) {
      // check if the Google ID already exists in the database
      const existingUser = await User.findOne({ googleId: req.body.googleId });
      if (existingUser) {
        return res.status(409).json("User already exists");
      }

      newUser = new User({
        username: req.body.username,
        email: req.body.email,
        googleId: req.body.googleId,
      });
    } else {
      // register a user with a local password
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.password, salt);
      newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
      });
    }

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password, googleId } = req.body;

    let user = null;

    if (googleId) {
      // user is logging in with Google
      user = await User.findOne({ googleId });
    } else {
      // user is logging in with local username and password
      user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json("Wrong credentials!");
      }

      const validated = await bcrypt.compare(password, user.password);
      if (!validated) {
        return res.status(400).json("Wrong credentials!");
      }
    }

    const { password: userPassword, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

const CLIENT_URL = "http://localhost:3000";

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      // cookies: req.cookies,
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "Login failed",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL);
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

module.exports = router;
