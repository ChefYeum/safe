import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendWarningToDevices } from './push-notification'
import { sendMessage } from './sms'

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

export const events = functions.https.onRequest((req, res) => {
    switch (req.method){
        case "GET":
            db.collection("events").get()
                .then(snapshot => {
                    const points: Object[] = [];
                    snapshot.forEach(doc => {
                        points.push(doc.data());
                    });
                    res.send({"points": points}); 
                }).catch(err => {
                    console.log('Error getting documents', err);
                });
            break;
        case "POST":
            db.collection("events").add({
                "location":{"_latitude":req.query.latitude,"_longitude":req.query.longitude},
                "time": (new Date()).getTime()
            }).then(ref => {
                console.log('Added document with ID: ', ref.id);
                res.send({});
                return sendWarningToDevices();
            }).catch(err => {
                console.log('Error getting documents', err);
            });
            break;
        default:
            console.error("No such method");
            break;
            
    }
});

export const paths = functions.https.onRequest((req, res) => {
    db.collection("events").get()
        .then(snapshot => {
            const points: Object[] = [];
            snapshot.forEach(doc => {
                points.push(doc.data());
            });
            return points as Array<{
                "location": {
                    "_latitude": string,
                    "_longitude": string
                },
                "time": number}>;
        }).then(points => {
            return points.sort((a, b) => {
                return a.time < b.time ? -1 : (b.time > a.time ? 1 : 0)
            })
        }).then(points => {
            return res.send({
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": points.map(point => [Number.parseFloat(point.location._longitude), Number.parseFloat(point.location._latitude)])
                }
            })
        }).catch(err => {
            console.error(err);
        });
});

export const sms = functions.https.onRequest((req, res) => {
    console.log(`== sender: ${JSON.stringify(req.query)}`)
    switch (req.method){
        case "GET":
            sendMessage(req.query.num, req.query.latitude, req.query.longitude)
            .catch(console.error)
            res.send({})
            break;
        default:
            console.error("No such method supported");
            
    }
})


// export const events_test = functions.https.onRequest((req, res) => {
//     switch (req.method){
//         case "GET":
//             db.collection("events").get()
//                 .then(snapshot => {
//                     console.log(req.headers["radius"])
//                     let points: any[] = [];
//                     snapshot.forEach(doc => {
//                         points.push(doc.data());
//                     });
//                     //filter radius
//                     if (req.params.radius){
//                         console.log(`Parameter radius=${req.params.radius} detected`)
//                         // points.forEach(({location}) => {
//                         //     points.push({text: `${location._latitude}, ${location._longitude}`}) 
//                         // })
//                     }
//                     res.send({"points": points}); 
//                 }).catch(err => {
//                     console.log('Error getting documents', err);
//                 });
//             break;
//     }
// })

// const geoInfoTest = functions.https.onRequest(async (req,res) => {
//     res.send(await getGeoInfo())
// });
