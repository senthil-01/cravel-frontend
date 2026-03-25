// test.mjs
const GOOGLE_API_KEY = "AIzaSyDt5cQJLXiNH7AhIiJou8SyRdAH7yQPgXE";

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`
);
const data = await response.json();
console.log(data.models.map(m => m.name));