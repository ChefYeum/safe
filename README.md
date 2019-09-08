# safe
PennApps XX team

## Inspiration

### There have been 289 mass shootings in the US so far in 2019.
### 313 deaths and 1209 injuries have occurred from mass shootings alone since January.

__Source: Gun Violence Archive__

This is insane. What is more insane, is that is nearly impossible to protect yourself against an active shooter. They are arguably more unpredictable than natural disasters.

There is no quick way for the civilians or even the police to find out about these shootings and track the criminal's location in real-time. Twitter is not accurate enough, calls are inefficient, the TV is barely watched.

That is why we built Safe. It provides crowd-sourced defence against active shooters in real-time.

## What it does

**Safe**, an Android app, allows users to report and receive updates of the last-seen location of an active shooter in an emergency.

Users can report the approximate location of a shooter or a shooting event by simply dragging and dropping a pin on a map.

All reports and updates are received via push notifications and text messages in real-time.

In the app, the civilians and the police can see all of the recent reports in their locale and track the shooter's movement.

We created our own ML algorithm (featuring Principal Component Analysis) to estimate what direction the shooter was headed in the past and to model a prediction for their next steps. The ML is great because:

- our algorithm "smoothes" over inaccurate user reports and lets you see the shooter's general trajectory
- it is time-bound rather than location-bound, so it allows to track and predict the shooter's movement in real-time

## How we built it

Frontend: Android.
Backend: Firebase, Node.js.
ML: Node.js, python (scikit-learn).
Mapbox for mapping.
Twilio to send texts to local authorities

## Challenges we ran into

Android is a heavy duty platform for a weekend, can be difficult to find documentation.
Integrating Android, a Firebase backend, ML functions, Mapbox, Twilio was time-consuming to debug.

## Accomplishments that we're proud of

Everything was built from scratch. No frameworks. Our project is still one of the most polished hackathon projects we personally have ever done. The ML works really well. Again, no third party services and just one borrowed node module.

## Team says

- Ben: "This was the biggest hackathon project I have ever done. I learned a lot."
- Elena: "I have never dreamt of writing even vanilla ML in js. Mindblowing that it works."
- Yoel: "I wasn't sleeping, I swear. Just debugging in my head"
- Dee: "좋았어"

## What is next

This service should be included in more popular social platforms such as Facebook or Google Maps, to speed up 

We need a logo, good design, yadda yadda.

# Technology used
 - Native Android Material UI with Kotlin
 - NodeJS backend on Firebased (powered by Google Cloud Platform)
 - MapBox

# Team
 - Ben ([bnelo12](https://github.com/bnelo12))
 - Dee ([ChefYeum](https://github.com/ChefYeum))
 - Elena ([elenalape](https://github.com/elenalape))
 - Yoel ([Yoelio](https://github.com/Yoelio))
