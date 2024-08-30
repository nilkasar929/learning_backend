const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db'); // Assuming your Sequelize instance is exported from a db.js file

class Video extends Model {}

Video.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  teacher: {
    type: DataTypes.STRING,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false
  },
  video_length: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  img: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses', // Refers to table name
      key: 'id' // Primary key in the courses table
    }
  }
}, {
  sequelize, // Pass your Sequelize instance here
  modelName: 'Video',
  tableName: 'videos', // Name of the table in the database
  timestamps: false
});

// Assuming you have a Course model
const Course = require('./courses.model'); // Adjust the path as necessary

Video.belongsTo(Course, { foreignKey: 'courseId' });

module.exports = Video;
