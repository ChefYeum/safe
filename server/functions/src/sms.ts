import * as twilio from 'twilio';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config()

const accountSid = process.env.TWIL_ID;
const authToken = process.env.TWIL_AUTH_TOKEN; 
const senderNum = process.env.TWIL_NUM


export function sendMessage(to: string, from=senderNum){
    const client = twilio(accountSid, authToken);
    client.messages.create({
        body: `A gun holder reported at Null`,
        to: to,  // Text this number
        from: from  // From a valid Twilio number
    })
    .then(message => (console.log(message.sid)))
    .catch(err => {
        console.log(`error: ${err}`)
    })
}



// geocodingClient.reverseGeocode({
//   query: [-95.4431142, 33.6875431],
//   limit: 2
// })
//   .send()
//   .then(response => {
//     // GeoJSON document with geocoding matches
//     const match = response.body;
//   });

//   npm install @mapbox/mapbox-sdk