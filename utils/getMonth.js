const Calendar = require("calendar-base").Calendar;
const cal = new Calendar();

module.exports = (year, month) => {
  let monthCalendar = cal.getCalendar(year, month);

  return monthCalendar.filter((m) => m);
};
