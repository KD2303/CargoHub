import axios from 'axios';
async function testOla() {
  try {
    const origin = `26.199406,78.149246`;
    const destination = `26.224334,78.173559`;
    const olaRes = await axios.get('https://api.olamaps.io/routing/v1/distanceMatrix', {
      params: { origins: origin, destinations: destination, api_key: 'bTH0uVWTz7KrZkkEK2tEnbFPgiyog61h72yAw0hE' }
    });
    console.log(JSON.stringify(olaRes.data, null, 2));
  } catch(e: any) {
    console.log(e.response ? e.response.data : e.message);
  }
}
testOla();
