const { User } = require("../models");

exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};

exports.getUsers = async (req, res) => {
  const users = await User.findAll({ order: [["createdAt", "DESC"]] });
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    const e = new Error("User not found");
    e.statusCode = 404;
    throw e;
  }
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    const e = new Error("User not found");
    e.statusCode = 404;
    throw e;
  }
  await user.update(req.body);
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  const deleted = await User.destroy({ where: { id: req.params.id } });
  if (!deleted) {
    const e = new Error("User not found");
    e.statusCode = 404;
    throw e;
  }
  res.json({ message: "User deleted" });
};
