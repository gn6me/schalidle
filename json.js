fetch("student-list.json")
  .then((res) => res.json())
  .then((json) => {
    return json;
  });
var studentList = json;
