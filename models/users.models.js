const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db');  // Assuming your Sequelize instance is exported from a db.js file

class User extends Model {}

User.init({
  name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
  },
  city: {
    type: DataTypes.STRING,
  },
  job: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  },
  image: {
    type: DataTypes.STRING,
  },
  isPromotion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize, // pass your Sequelize instance here
  modelName: 'User',
  tableName: 'users', // Name of the table in the database
  timestamps: false
});

// Assuming you have a Course model
const Course = require('./courses.model'); // Adjust the path as necessary

User.hasMany(Course, { foreignKey: 'userId' }); // Or, change this to belongsToMany if needed.

module.exports = User;
