const fetch = require('node-fetch');
async function test() {
  const res = await fetch("http://localhost:5000/api/fare/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pickupLat: 19.0,
      pickupLng: 72.0,
      dropLat: 19.1,
      dropLng: 72.1,
      vehicleType: "TATA_ACE",
      loadType: "BOXES_CARTONS",
      helpersRequested: 0,
      weight: 100,
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
