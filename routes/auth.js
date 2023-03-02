const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const passport = require("passport");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json("Wrong credentials!");

    const validated = await bcrypt.compare(req.body.password, user.password);
    if (!validated) return res.status(400).json("Wrong credentials!");

    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
//Oauth
// router.get("/login/success", (req, res) => {
//   if (req.user) {
//     res.status(200).json({
//       error: false,
//       message: "Successfully Loged In",
//       user: req.user,
//     });
//   } else { //     res.status(403).json({ error: true, message: "Not Authorized" });
//   }
// });

// router.get("/login/failed", (req, res) => {
//   res.status(401).json({
//     error: true,
//     message: "Log in failure",
//   });
// });

// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// router.get(
//   "/google/callback",
//   passport.authenticate("google", {
//     successRedirect: process.env.CLIENT_URL,
//     failureRedirect: "/login/failed",
//   })
// );

// router.get("/logout", (req, res) => {
//   req.logout();
//   res.redirect(process.env.CLIENT_URL);
// });
