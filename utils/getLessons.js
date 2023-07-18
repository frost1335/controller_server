const getStudentList = require("./getStudentList");

module.exports = (group, students) => {
  const currentMonth = group.attendance.find((m) => m.current);

  const isStudent = currentMonth?.studentList.length;

  if (isStudent) {
    const lessons = currentMonth.studentList[0]?.lessons.map((l) => ({
      weekDay: l.weekDay,
      date: l.date,
      status: null,
    }));

    const studentList = students.map((student) => {
      return {
        studentId: student,
        lessons,
      };
    });

    return studentList;
  } else {
    const studentList = getStudentList(students, group?.days);

    return studentList;
  }
};
