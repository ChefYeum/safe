import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { sendWarningToDevices } from './push-notification'
import { sendMsg } from './sms'
import {getPathPoints} from './pca-analysis';

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
        getPathPoints(5000).then(points => {
            console.log(points)
            return res.send({
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "LineString",
                    "coordinates": points
                }
            });
        }).catch(err => {
            console.error(err);
        });
});

export const sms = functions.https.onRequest((req, res) => {
    switch (req.method){
        case "GET":
            sendMsg(req.query.num, Number.parseFloat(req.query.latitude), Number.parseFloat(req.query.longitude))
            .catch(console.error)
            res.send({})
            break;
        default:
            console.error("No such method supported");
    }
})