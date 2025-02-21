var request = new XMLHttpRequest();
request.open("GET", "student-list.json", false);
request.send(null);
var studentList = JSON.parse(request.responseText);
console.log(studentList);
