const { Sequelize } = require('sequelize');
const dotenv = require('dotenv'); // Adjust the path as needed

dotenv.config();
const uri = "postgresql://fullstack_7t5t_user:V2BrzP44b0KbE7mJJ8qYiQtJhNeGMZOz@dpg-cr2rm7qj1k6c73ecpjmg-a.oregon-postgres.render.com/fullstack_7t5t";
const db = new Sequelize(uri, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // This may be necessary depending on your Render configuration
    },
  },
});

db.authenticate()
  .then(() => {
    console.log("Database is connected");
  })
  .catch((error) => {
    console.log("Error connecting to database:", error);
  });

db.sync()
  .then(() => {
    console.log("Database is synchronized");
  })
  .catch((error) => {
    console.log("Error in synchronizing the database:", error);
  });

module.exports = db;
