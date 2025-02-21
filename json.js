async function search() {
  const jsonFile = "student-list.json";
  try {
    const response = await fetch(jsonFile);
    const data = await response.json();
    const students = data.results;
    return students;
  } catch (error) {
    console.error(error);
  }
}
console.log(search());
