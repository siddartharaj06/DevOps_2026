const express = require("express");
const errorHandler = require("./middleware/errorHandler");

const userRoutes = require("./routes/user.routes");
const courseRoutes = require("./routes/course.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Training Platform API running" }));

app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/enrollments", enrollmentRoutes);

// error handler should be last
app.use(errorHandler);

module.exports = app;
