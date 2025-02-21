fetch("student-list.json")
  .then((res) => res.json())
  .then((json) => {
    var studentList = json;
    return json;
  });
console.log(studentList);
