const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} = require("sequelize");

module.exports = (err, req, res, next) => {
  // Sequelize validation errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: "Validation error",
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Unique constraint
  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      message: "Duplicate value",
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Foreign key constraint
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      message: "Invalid reference (foreign key constraint)",
    });
  }

  // Not-found custom error (we will throw with statusCode)
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};
