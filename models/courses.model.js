const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');  // Assuming your Sequelize instance is exported from a db.js file

class Course extends Model {}

Course.init({
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  teacher: {
    type: DataTypes.STRING,
    allowNull: false
  },
  teacherId: {
    type: DataTypes.INTEGER,  // Assuming you'll reference another table
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  img: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize, // pass your Sequelize instance here
  modelName: 'Course',
  tableName: 'courses', // Name of the table in the database
  timestamps: false
});

module.exports = Course;
