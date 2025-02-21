async function search() {
  const jsonFile = "student-list.json";
  const response = await fetch(jsonFile).catch((e) => console.error(error));
  const data = await response.json().catch((e) => console.error(error));
  const students = data.results;
  return students;
}
console.log(search());
