const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const User = require("./user")(sequelize, DataTypes);
const Course = require("./course")(sequelize, DataTypes);
const Enrollment = require("./enrollment")(sequelize, DataTypes);

// Many-to-many: Users <-> Courses through Enrollments
User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: "userId",
  otherKey: "courseId",
});

Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: "courseId",
  otherKey: "userId",
});

// Optional direct relations
Enrollment.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Enrollment.belongsTo(Course, { foreignKey: "courseId", onDelete: "CASCADE" });
User.hasMany(Enrollment, { foreignKey: "userId" });
Course.hasMany(Enrollment, { foreignKey: "courseId" });

module.exports = { sequelize, User, Course, Enrollment };
