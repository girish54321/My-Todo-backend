'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize("postgres://postgres_girish:0H0OPEe2zC3L4I7NuUfxgqD5cPLbbmhf@dpg-cndj5juv3ddc73cbrv1g-a.singapore-postgres.render.com/database_todo_4q7q?sslmode=require");
} else {
  // console.log("config.database, config.username, config.password, config", config.database, config.username, config.password, config);
  // sequelize = new Sequelize(config.database, config.username, config.password, config);
  sequelize = new Sequelize("postgres://postgres_girish:0H0OPEe2zC3L4I7NuUfxgqD5cPLbbmhf@dpg-cndj5juv3ddc73cbrv1g-a.singapore-postgres.render.com/database_todo_4q7q?sslmode=require");
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
