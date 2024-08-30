const express = require("express");
const bcrypt = require("bcrypt");
const  User  = require("../models/users.models");
const jwt = require("jsonwebtoken");
const { auth } = require("../middlewares/users.middleware");
const { BlackListModel } = require("../models/blacklist");

const userRouter = express.Router();

// List all users
// Access: admin
// EndPoint: /users/
userRouter.get("/", async (req, res) => {
  try {
    if (req.body.role === "admin") {
      const users = await User.findAll();
      res.status(200).json({ users });
    } else {
      res.status(401).json({ error: "You don't have access to users" });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong", error: err.message });
  }
});

// Registration
// Access: all
// EndPoint: /user/register
userRouter.post("/register", async (req, res) => {
  const { name, email, password, age, city, job, image } = req.body;
  try {
    const registeredUser = await User.findOne({ where: { email } });

    if (registeredUser) {
      return res.status(409).json({ msg: "User already exists. Please Login!" });
    }

    const hash = await bcrypt.hash(password, 5);
    const user = await User.create({
      name,
      email,
      password: hash,
      age,
      city,
      job,
      image,
      role:"admin"
    });

    res.status(201).json({ msg: "User created successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
// Access: all
// EndPoint: /users/login
userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        const token = jwt.sign(
          { userId: user.id, user: user.name, role: user.role },
          "SRM",
          { expiresIn: "7d" }
        );
        const rToken = jwt.sign(
          { userId: user.id, user: user.name },
          "SRM",
          { expiresIn: "24d" }
        );
        res.status(202).json({ msg: "User login success", token, rToken, user });
      } else {
        res.status(401).json({ msg: "Invalid credentials" });
      }
    } else {
      res.status(404).json({ msg: "User does not exist. Signup first!" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user
// Access: all
// EndPoint: /users/update/:userId
userRouter.patch("/update/:userId", async (req, res) => {
  const { userId } = req.params;
  const payload = req.body;

  try {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 2);
    }

    await User.update(payload, { where: { id: userId } });
    const user = await User.findByPk(userId);

    res.status(200).json({ msg: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

// Delete user
// Access: admin
// EndPoint: /users/delete/:userId
userRouter.delete("/delete/:userId", auth, async (req, res) => {
  try {
    if (req.body.role === "admin") {
      const { userId } = req.params;
      const deletedUser = await User.findByPk(userId);
      if (deletedUser) {
        await User.destroy({ where: { id: userId } });
        res.status(200).json({ msg: "User has been deleted", deletedUser });
      } else {
        res.status(404).json({ msg: "User not found" });
      }
    } else {
      res.status(401).json({ error: "You don't have access to delete users" });
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

// Logout
// Access: all
// EndPoint: /users/logout
userRouter.post("/logout", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      BlackListModel.create({ token });
    }
    res.status(200).json({ msg: "The user has logged out" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
});

// List courses user purchased
// Access: all
// EndPoint: /users/userCourse/:userId
userRouter.get("/userCourse/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId, {
      include: ['courses'] // Assuming 'courses' is the association name
    });
    res.status(200).json({ course: user.courses });
  } catch (err) {
    res.status(400).json({ message: "Something went wrong", error: err.message });
  }
});

// Add courseId to user course array
// Access: all
// EndPoint: /users/addCourse/:courseId
userRouter.post("/addCourse/:courseId", auth, async (req, res) => {
  try {
    const userId = req.body.userId;
    const courseId = req.params.courseId;

    const user = await User.findByPk(userId);
    if (user && !user.courses.includes(courseId)) {
      user.courses.push(courseId);
      await user.save();
      res.status(201).json({ message: "You have subscribed to the course", user });
    } else {
      res.status(400).json({ error: "You already have subscribed to the course" });
    }
  } catch (err) {
    res.status(400).json({ message: "Something went wrong", error: err.message });
  }
});

// Update user role to teacher
// Access: admin
// EndPoint: /users/Teachme/:userId
userRouter.get("/Teachme/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = "teacher";
    await user.save();

    res.status(200).json({ message: "User role updated to teacher" });
  } catch (err) {
    res.status(400).json({ message: "Something went wrong", error: err.message });
  }
});

module.exports = {
  userRouter,
};
