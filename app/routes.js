module.exports = (app) => {
  const customersRoutes = require("../routes/customers.routes");
  const studentsRoutes = require("../routes/students.routes");
  const teachersRoutes = require("../routes/teachers.routes");
  const groupsRoutes = require("../routes/groups.routes");
  const attendanceRoutes = require("../routes/attendance.routes");
  const coursesRoutes = require("../routes/courses.routes");
  const authRoutes = require("../routes/auth.routes");

  app.use("/api/customers", customersRoutes);
  app.use("/api/students", studentsRoutes);
  app.use("/api/teachers", teachersRoutes);
  app.use("/api/groups", groupsRoutes);
  app.use("/api/courses", coursesRoutes);
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/auth", authRoutes);
};
