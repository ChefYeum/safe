import * as twilio from 'twilio';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config()


const TWIL_ID = process.env.TWIL_ID;
const TWIL_AUTH_TOKEN = process.env.TWIL_AUTH_TOKEN; 
const TWIL_NUM = process.env.TWIL_NUM
// const MBX_TOKEN = process.env.MBX_TOKEN

export async function sendMessage(to: string, latitude: number, longitude: number, from=TWIL_NUM){
    const client = twilio(TWIL_ID, TWIL_AUTH_TOKEN);
    const address = await getGeoInfo(latitude, longitude)
    console.log(`= address: ${address}`)
    const feature = address.features[1]["place_name"];
    console.log(`= feature: ${feature}`)
    client.messages.create({
        body: `A gun holder reported at ${feature}`,
        to: to,  // Text this number
        from: from  // From a valid Twilio number
    })
    .then(message => (message.sid))
    .catch(err => {
        console.log(`error: ${err}`)
    })
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