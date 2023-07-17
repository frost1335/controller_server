const { weekdays } = require("./constants");
const getMonth = require("./getMonth");
const { CalendarDate } = require("calendar-date");

module.exports = (students, days) => {
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const monthDays = getMonth(year, month);

  const filteredDays = weekdays
    .map((day, index) =>
      days?.includes(day.short) ? { day: day.name, index } : false
    )
    .filter((day) => day);

  let lessons = monthDays
    .filter((day) => filteredDays.find((d) => d.index === day.weekDay))
    .map((lesson) => ({
      weekDay: weekdays[lesson.weekDay].short,
      date: new CalendarDate(
        lesson.year,
        lesson.month + 1,
        lesson.day
      ).toFormat("yyyy-MM-dd"),
      status: null,
    }));

  return students.map((student) => {
    return {
      studentId: student,
      lessons,
    };
  });
};
