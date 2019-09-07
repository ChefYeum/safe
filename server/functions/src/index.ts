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

export const events_test = functions.https.onRequest((req, res) => {
    switch (req.method){
        case "GET":
            db.collection("events").get()
                .then(snapshot => {
                    console.log(req.headers["radius"])
                    let points: any[] = [];
                    snapshot.forEach(doc => {
                        points.push(doc.data());
                    });
                    //filter radius
                    if (req.params.radius){
                        console.log(`Parameter radius=${req.params.radius} detected`)
                        // points.forEach(({location}) => {
                        //     points.push({text: `${location._latitude}, ${location._longitude}`}) 
                        // })
                    }
                    res.send({"points": points}); 
                }).catch(err => {
                    console.log('Error getting documents', err);
                });
            break;
    }
})
