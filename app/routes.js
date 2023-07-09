module.exports = (app) => {
    const lidsRoutes = require("../routes/lids.routes");
    const studentsRoutes = require("../routes/students.routes");
    const teachersRoutes = require("../routes/teachers.routes");
    const groupsRoutes = require("../routes/groups.routes");
    const attendanceRoutes = require("../routes/groups.routes");
    const coursesRoutes = require("../routes/courses.routes");
  
    app.use("/api/lids", lidsRoutes);
    app.use("/api/students", studentsRoutes);
    app.use("/api/teachers", teachersRoutes);
    app.use("/api/groups", groupsRoutes);
    app.use("/api/courses", coursesRoutes);
    app.use("/api/attendance", attendanceRoutes);
  };
  