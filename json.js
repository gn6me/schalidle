var jsonFile = "student-list.json";
var studentList = JSON.parse(fs.readFileSync(jsonFile));
console.log(studentList);
