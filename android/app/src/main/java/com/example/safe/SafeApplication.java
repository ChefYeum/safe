package com.example.safe;

import android.app.Application;

import com.mapbox.mapboxsdk.Mapbox;
import com.pusher.pushnotifications.PushNotifications;

public class SafeApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        PushNotifications.start(getApplicationContext(), getString(R.string.pusher_instance_id));
        PushNotifications.addDeviceInterest("events");
        Mapbox.getInstance(getApplicationContext(), getString(R.string.mapbox_access_token));
    }
}
