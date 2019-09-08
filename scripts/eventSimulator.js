const request = require('request');
const sleep = require('sleep');

function simEvt(longitude, latitude) {
    request.post(`https://us-central1-safe-21981.cloudfunctions.net/events?latitude=${latitude}&longitude=${longitude}`)
}

const args = [
    [-75.1897061919539, 39.95414933875304],
    [-75.18962656865565, 39.95398095566317],
    [-75.18995692815894, 39.953947202632214],
    [-75.18958508237792, 39.95387945738511],
    [-75.18963976101864, 39.953939111316295]
]

// for (arg of args) {
//     simEvt(...arg);
// }
