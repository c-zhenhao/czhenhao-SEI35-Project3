const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../middleware/auth");
const Users = require("../models/Users");

const usernameOrPasswordError = {
  title: "error",
  message: "username or password error",
};

const dbError = {
  title: "error",
  message: "unable to complete request",
};

router.get("/logout", auth, async (req, res) => {
  try {
    req.session.destroy(() => {
      res.json({ title: "OK", message: `logout successful` });
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ title: "error", message: `unable to logout` });
  }
});

router.patch("/", auth, async (req, res) => {
  try {
    res.json(await Users.findById(req.session.userId, { _id: 0, passwordHash: 0 }));
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.get("/", auth, async (req, res) => {
  try {
    res.json(await Users.findById(req.session.userId, { _id: 0, passwordHash: 0 }));
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    res.json(await Users.findById(req.params.id, { _id: 0, passwordHash: 0 }));
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.post("/:id/rate", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.session.userId, { _id: 0, passwordHash: 0 });
    const userInteracted = user.userInteracted.map((d, i) => {
      if (d.targetUsername === req.body.targetUsername) d.targetRating = req.body.targetRating;
      return d;
    });
    await Users.findByIdAndUpdate(req.session.userId, { userInteracted });
    res.json({ title: "OK", message: `rating successful` });
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const user = await Users.findById(req.session.userId);
    console.log(req.body.password, user.username, user._id);
    const result = await bcrypt.compare(req.body.password, user.passwordHash);
    if (result) {
      const done = await Users.deleteOne({ _id: user._id });
      console.log(done);
      if (done.deletedCount === 1) {
        res.json({ title: "OK", message: `profile deleted` });
      } else {
        res.json({ title: "error", message: `unable to delete profile` });
      }
    } else {
      res.status(401).json(usernameOrPasswordError);
    }
  } catch (err) {
    console.error(err);
    res.status(400).json(dbError);
  }
});

module.exports = router;
