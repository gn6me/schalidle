var students = $.getJSON("student-list.json", function () {
  console.log("success");
});

students.always(function () {
  console.log("second complete");
});
