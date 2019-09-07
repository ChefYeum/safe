import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {sendWarningToDevices} from './push-notification';

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export const hw = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

export const events = functions.https.onRequest((req, res) => {
    switch (req.method){
        case "GET":
            db.collection("events").get()
                .then(snapshot => {
                    let points: Object[] = [];
                    snapshot.forEach(doc => {
                        points.push(doc.data());
                    });
                    res.send({"points": points}); 
                }).catch(err => {
                    console.log('Error getting documents', err);
                });
            break;
    }
})


// postOne function
// compatible with GeoJSON
