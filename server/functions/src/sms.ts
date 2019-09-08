import * as twilio from 'twilio';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config()


const TWIL_ID = process.env.TWIL_ID;
const TWIL_AUTH_TOKEN = process.env.TWIL_AUTH_TOKEN; 
const TWIL_NUM = process.env.TWIL_NUM
// const MBX_TOKEN = process.env.MBX_TOKEN

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const geocodingClient = mbxGeocoding({accessToken: "pk.eyJ1IjoiemRyMjc4MCIsImEiOiJjazBhOWpib3QwaGM3M2RtcWk0N3pkbzVpIn0.56IaD0T14Auie8KHfI9bAw"}) 

export async function sendMsg(numberSent: string, latitude: number, longitude: number){
    const client = twilio(TWIL_ID, TWIL_AUTH_TOKEN);
    const output = await getGeoInfo(latitude, longitude)
        .then((address: any) =>{
            console.log(JSON.stringify(address))
            return client.messages.create({
                body: `Suspecious activity reported at ${ (address.features.length > 0) ? address.features[0]['place_name'] : `(${latitude}, ${longitude})`}`,
                to: numberSent,  // Text this number
                from: TWIL_NUM  // From a valid Twilio number
            })})
        .then((message: { sid: any; }) => console.log(message.sid))
    return output
}

function getGeoInfo(lat: number, long: number){
    return geocodingClient.reverseGeocode({
        query: [lat, long],
        limit: 1
    })
    .send()
    .then((response: { body: any; }) => response.body)
    .catch(console.error)
}