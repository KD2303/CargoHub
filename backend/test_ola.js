const fetch = require('node-fetch');
async function test() {
  const res = await fetch("https://api.olamaps.io/places/v1/autocomplete?input=Mumbai&api_key=bTH0uVWTz7KrZkkEK2tEnbFPgiyog61h72yAw0hE");
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
