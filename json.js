fetch("student-list.json")
  .then((res) => res.json())
  .then((json) => console.log(json));
