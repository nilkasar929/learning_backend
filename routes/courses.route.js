const express = require("express");
const { Course } = require("../models/courses.model"); // Import Sequelize model
const { auth } = require("../middlewares/users.middleware");
const { UserModel } = require("../models/users.models.js");

const courseRoute = express.Router();

courseRoute.get("/all", async (req, res) => {
  try {
    let { q, sortBy, sortOrder, page, limit } = req.query;
    let filter = {};
    if (q) {
      filter.title = {
        [Op.iLike]: `%${q}%` // Use Sequelize's iLike for case-insensitive search
      };
    }
    const sort = [];
    if (sortBy) {
      sort.push([sortBy, sortOrder === "desc" ? 'DESC' : 'ASC']);
    }
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    
    const courses = await Course.findAll({
      where: filter,
      order: sort,
      offset: (page - 1) * limit,
      limit: limit
    });
    res.status(200).json({ courses });
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", error: err.message });
  }
});

courseRoute.use(auth); // Apply authentication middleware

courseRoute.get("/", async (req, res) => {
  try {
    let { q, sortBy, sortOrder, page, limit } = req.query;
    let filter = {};
    if (q) {
      filter.title = {
        [Op.iLike]: `%${q}%` // Use Sequelize's iLike for case-insensitive search
      };
    }
    const sort = [];
    if (sortBy) {
      sort.push([sortBy, sortOrder === "desc" ? 'DESC' : 'ASC']);
    }
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    const courses = await Course.findAll({
      where: filter,
      order: sort,
      offset: (page - 1) * limit,
      limit: limit
    });
    res.status(200).json({ courses });
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", error: err.message });
  }
});

courseRoute.get("/TeacherCourses", async (req, res) => {
  try {
    let { userId, q, sortBy, sortOrder, page, limit } = req.query;
    let filter = {};
    if (q) {
      filter.title = {
        [Op.iLike]: `%${q}%` // Use Sequelize's iLike for case-insensitive search
      };
    }
    if (userId) {
      filter.teacherId = userId;
    }
    const sort = [];
    if (sortBy) {
      sort.push([sortBy, sortOrder === "desc" ? 'DESC' : 'ASC']);
    }
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    const courses = await Course.findAll({
      where: filter,
      order: sort,
      offset: (page - 1) * limit,
      limit: limit
    });
    res.status(200).json({ courses });
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", error: err.message });
  }
});

courseRoute.get("/:courseID", async (req, res) => {
  try {
    const courseID = req.params.courseID;
    const course = await Course.findByPk(courseID); // Use findByPk for primary key lookup
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ course });
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", error: err.message });
  }
});

courseRoute.post("/add", async (req, res) => {
  try {
    if (req.body.role === "admin" || req.body.role === "teacher") {
      const { title, teacher } = req.body;
      const existingCourse = await Course.findOne({ 
        where: { title, teacher }
      });
      if (existingCourse) {
        return res.status(403).json({ message: "Course Already Present" });
      } else {
        const newCourse = await Course.create({
          ...req.body,
          teacher: req.body.username,
          teacherId: req.body.userId
        });
        res.status(201).json({ message: "Course Added", data: newCourse });
      }
    } else {
      res.status(401).json({ error: "You don't have access to add course" });
    }
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", error: err.message });
  }
});

courseRoute.patch("/update/:courseID", async (req, res) => {
  try {
    if (req.body.role === "admin" || req.body.role === "teacher") {
      const courseID = req.params.courseID;
      const [updated] = await Course.update(req.body, {
        where: { id: courseID }
      });
      if (updated) {
        const updatedCourse = await Course.findByPk(courseID);
        res.status(202).json({ message: "Course updated", course: updatedCourse });
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } else {
      res.status(401).json({ error: "You don't have access to update course" });
    }
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", error: err.message });
  }
});

courseRoute.delete("/delete/:courseID", async (req, res) => {
  try {
    if (req.body.role === "admin" || req.body.role === "teacher") {
      const courseID = req.params.courseID;
      const deleted = await Course.destroy({
        where: { id: courseID }
      });
      if (deleted) {
        res.status(200).json({ message: "Course deleted" });
      } else {
        res.status(404).json({ message: "Course not found" });
      }
    } else {
      res.status(401).json({ error: "You don't have access to delete the course" });
    }
  } catch (err) {
    res.status(400).json({ message: "Something Went Wrong", error: err.message });
  }
});

module.exports = { courseRoute };
