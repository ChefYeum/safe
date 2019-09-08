import * as twilio from 'twilio';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config()


const TWIL_ID = process.env.TWIL_ID;
const TWIL_AUTH_TOKEN = process.env.TWIL_AUTH_TOKEN; 
const TWIL_NUM = process.env.TWIL_NUM
// const MBX_TOKEN = process.env.MBX_TOKEN

export async function sendMessage(toNum: String, latitude: number, longitude: number, fromNum=TWIL_NUM){
    const client = twilio(TWIL_ID, TWIL_AUTH_TOKEN);
    const address = await getGeoInfo(latitude, longitude)
    console.log(`= address: ${address}`);
    const feature = address.features[1]["place_name"];
    console.log(`= feature: ${feature}`);
    console.log(`=== ${toNum}`);
    console.log(`=== ${fromNum}`);
    client.messages.create({
        body: `A gun holder reported at ${feature}`,
        to: '+447475232777',  // Text this number
        from: fromNum  // From a valid Twilio number
    })
    .then(message => (message.sid))
    .catch(err => {
        console.log(`error: ${err}`)
    })
}

export function sendTest(){
    const client = twilio(TWIL_ID, TWIL_AUTH_TOKEN);
    client.messages.create({
        body: 'Hello from Node',
        to: '+447475232777',  // Text this number
        from: '+441143032335' // From a valid Twilio number
    })
    .then((message) => console.log(message.sid));
}

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocodingClient = mbxGeocoding({accessToken: "pk.eyJ1IjoiemRyMjc4MCIsImEiOiJjazBhOWpib3QwaGM3M2RtcWk0N3pkbzVpIn0.56IaD0T14Auie8KHfI9bAw"}) 

export function getGeoInfo(lat: number, long: number){
    return geocodingClient.reverseGeocode({
    query: [lat, long],
    })
    .send()
    .then((response: { body: any; }) => response.body)
    .catch(console.error)
}