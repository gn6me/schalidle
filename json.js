const form = document.querySelector(".form");
const input = form.querySelector("input");
const searchResults = document.querySelector(".search-results");
const searchIcon = document.querySelector(".searchIcon");

const searchStudents = async (query) => {
  const jsonFile = "student-list.json";
};

try {
  const response = await fetch(jsonFile);
  const data = await response.json();
  const students = data.results;

  searchResults.innerHTML = "";
  students.forEach((student) => {
    const { name, school, role } = student;

    const studentContainer = document.createElement("div");
    studentContainer.classList.add("student");

    studentContainer.innerHTML = `
          <div class="student-info">
              <h3>${name}</h3>
              <small>Released on ${school}</small>
              <span class="rating">${role}</span>
          </div>
        `;

    searchResults.appendChild(studentContainer);
  });
} catch (error) {
  console.error(error);
}

form.addEventListener("input", async (event) => {
  event.preventDefault();
  const query = input.value;
  searchStudents(query);
});
