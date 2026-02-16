module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: { isEmail: { msg: "Invalid email address" } },
      },
    },
    { tableName: "users", timestamps: true }
  );

  return User;
};
