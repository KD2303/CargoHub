const axios = require('axios');
async function test() {
  try {
    const olaRes = await axios.get('https://api.olamaps.io/routing/v1/distanceMatrix', {
      params: {
        origins: "19.0,72.0",
        destinations: "19.1,72.1",
        api_key: "bTH0uVWTz7KrZkkEK2tEnbFPgiyog61h72yAw0hE"
      }
    });
    console.log(JSON.stringify(olaRes.data, null, 2));
  } catch(e) {
    console.log("Error:", e.response?.data || e.message);
  }
}
test();
