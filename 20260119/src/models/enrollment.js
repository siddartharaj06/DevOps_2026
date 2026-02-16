module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define(
    "Enrollment",
    {
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      enrolledAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: { args: [0], msg: "Progress must be >= 0" },
          max: { args: [100], msg: "Progress must be <= 100" },
        },
      },
    },
    {
      tableName: "enrollments",
      timestamps: true,
      indexes: [{ unique: true, fields: ["courseId", "userId"] }], // prevents duplicates
    }
  );

  return Enrollment;
};
