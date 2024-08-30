const express = require('express');
const { CourseModel } = require('../models/courses.model');
const { UserModel } = require('../models/users.models');
const { VideoModel } = require('../models/video.model');
const { auth } = require('../middlewares/users.middleware');

const videoRoute = express.Router();

// Apply authentication middleware
videoRoute.use(auth);

// Get all videos
// Access: admin only
// EndPoint: /videos/
videoRoute.get('/', async (req, res) => {
    const { page, limit, user } = req.query;
    try {
        if (req.body.role === 'admin') {
            const videos = await VideoModel.findAll();
            res.status(200).json(videos);
        } else if (user) {
            const videos = await VideoModel.findAll({ where: { teacherId: user } });
            res.status(200).json(videos);
        } else {
            res.status(401).json({ error: "You don't have access to videos" });
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Something went wrong', error: err.message });
    }
});

// Get a single video
// Access: all
// EndPoint: /videos/:videoID
videoRoute.get('/:videoID', async (req, res) => {
    try {
        const videoID = req.params.videoID;
        const video = await VideoModel.findByPk(videoID);
        if (video) {
            res.status(200).json({ video });
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: 'Something went wrong', error: err.message });
    }
});

// Add a video
// Access: admin/teacher
// EndPoint: /videos/add/:courseId
videoRoute.post('/add/:courseId', async (req, res) => {
    try {
        if (req.body.role === 'admin' || req.body.role === 'teacher') {
            const { title, link, username, userId } = req.body;
            const courseId = req.params.courseId;

            const existingVideo = await VideoModel.findOne({ where: { title, link } });
            if (existingVideo) {
                return res.status(400).json({ error: 'Video already exists' });
            }

            const video = await VideoModel.create({
                ...req.body,
                courseId,
                teacher: username,
                teacherId: userId
            });

            await CourseModel.update(
                { videos: Sequelize.literal(`array_append(videos, ${video.id})`) }, 
                { where: { id: courseId } }
            );

            res.status(201).json({ message: 'Video added', video });
        } else {
            res.status(401).json({ error: "You don't have access to add videos" });
        }
    } catch (err) {
        res.status(400).json({ message: 'Something went wrong', error: err.message });
    }
});

// Get videos for a course
// Access: all
// EndPoint: /videos/courseVideos/:courseId
videoRoute.get('/courseVideos/:courseId', async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await CourseModel.findByPk(courseId, {
            include: [{
                model: VideoModel,
                as: 'videos' // Ensure 'videos' is the correct alias used in the association
            }]
        });

        if (course) {
            res.status(200).json({ course });
        } else {
            res.status(404).json({ message: 'Course not found' });
        }
    } catch (err) {
        res.status(400).json({ message: 'Something went wrong', error: err.message });
    }
});

module.exports = { videoRoute };
