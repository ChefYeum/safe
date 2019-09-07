package com.example.safe

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.mapbox.mapboxsdk.Mapbox
import com.mapbox.mapboxsdk.maps.MapView
import com.mapbox.mapboxsdk.maps.Style


import android.annotation.SuppressLint
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import com.google.firebase.Timestamp
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.GeoPoint

import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback

import com.mapbox.android.core.permissions.PermissionsListener
import com.mapbox.android.core.permissions.PermissionsManager
import com.mapbox.mapboxsdk.geometry.LatLng
import com.mapbox.mapboxsdk.location.LocationComponentActivationOptions
import com.mapbox.mapboxsdk.location.LocationComponentOptions
import com.mapbox.mapboxsdk.location.modes.CameraMode
import com.mapbox.mapboxsdk.location.modes.RenderMode
import com.tapadoo.alerter.Alerter
import org.json.JSONObject

class MainActivity : AppCompatActivity(), OnMapReadyCallback, PermissionsListener {

    private var mapView: MapView? = null
    private var hoveringPicker: ImageView? = null
    private var permissionsManager: PermissionsManager = PermissionsManager(this)
    private var reportButton: Button? = null
    private lateinit var mapboxMap: MapboxMap
    private  var db: FirebaseFirestore = FirebaseFirestore.getInstance()
    private var collection: CollectionReference = db.collection("events")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        Mapbox.getInstance(this, getString(R.string.mapbox_access_token))

        setContentView(R.layout.activity_main)

        mapView = findViewById<MapView>(R.id.mapView)
        mapView?.onCreate(savedInstanceState)
        mapView?.getMapAsync(this)
        reportButton = findViewById(R.id.view_collected_coinz_button)
    }

    override fun onMapReady(mapboxMap: MapboxMap) {
        this.mapboxMap = mapboxMap
        mapboxMap.setStyle(Style.TRAFFIC_DAY) { enableLocationComponent(it)}
        hoveringPicker = ImageView(this)
        val picker = hoveringPicker
        picker?.setImageResource(R.drawable.mapbox_markerview_icon_default)
        var params: FrameLayout.LayoutParams  = FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            Gravity.CENTER)
        picker?.layoutParams = params
        mapView?.addView(picker)

        this.getEventData(Response.Listener { response: JSONObject -> Log.d("Events", response.toString()) })

        reportButton?.setOnClickListener(
            View.OnClickListener {
                    var mapTargetLatLng: LatLng = mapboxMap.cameraPosition.target
                    var geoPoint: GeoPoint = GeoPoint(mapTargetLatLng.latitude, mapTargetLatLng.longitude)
                    var timeStamp: Timestamp = Timestamp.now()
                    val docData = hashMapOf(
                        "location" to geoPoint,
                        "time" to timeStamp
                    )
                    collection.document().set(docData)
                        .addOnSuccessListener { Log.d("nice", "success") }
                        .addOnFailureListener {e -> Log.w("oof", "failure", e)}
                    Alerter.create(this)
                        .setTitle("The event has been logged.")
                        .setText("Thank you for keeping others safe. Make sure you are in a safe location and move away from current dangers.")
                        .setBackgroundColorRes(R.color.success)
                        .show()
            }
        )
    }

    @SuppressLint("MissingPermission")
    private fun enableLocationComponent(loadedMapStyle: Style) {

        // Check if permissions are enabled and if not request
        if (PermissionsManager.areLocationPermissionsGranted(this)) {
            // Create and customize the LocationComponent's options
            val customLocationComponentOptions = LocationComponentOptions.builder(this)
                .trackingGesturesManagement(true)
                .accuracyColor(ContextCompat.getColor(this, R.color.red))
                .build()
            val locationComponentActivationOptions = LocationComponentActivationOptions.builder(this, loadedMapStyle)
                .locationComponentOptions(customLocationComponentOptions)
                .build()

            // Get an instance of the LocationComponent and then adjust its settings
            mapboxMap.locationComponent.apply {

                // Activate the LocationComponent with options
                activateLocationComponent(locationComponentActivationOptions)

                // Enable to make the LocationComponent visible
                isLocationComponentEnabled = true

                // Set the LocationComponent's camera mode
                cameraMode = CameraMode.TRACKING

                // Set the LocationComponent's render mode
                renderMode = RenderMode.COMPASS
            }
        } else {
            permissionsManager = PermissionsManager(this)
            permissionsManager.requestLocationPermissions(this)
        }
    }

    private fun getEventData(onSuccessListener: Response.Listener<JSONObject>) {
        val url = "https://us-central1-safe-21981.cloudfunctions.net/events"
        val getDataRequest = JsonObjectRequest(Request.Method.GET, url, null, onSuccessListener,  Response.ErrorListener { error ->
            Log.e("Events", error.localizedMessage)
        })
        Volley.newRequestQueue(this.applicationContext).add(getDataRequest)
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        permissionsManager.onRequestPermissionsResult(requestCode, permissions, grantResults)
    }

    override fun onExplanationNeeded(permissionsToExplain: MutableList<String>?) {
        Toast.makeText(this, R.string.user_location_permission_explanation, Toast.LENGTH_LONG).show()
    }

    override fun onPermissionResult(granted: Boolean) {
        if (granted) {
            enableLocationComponent(mapboxMap.style!!)
        } else {
            Toast.makeText(this, R.string.user_location_permission_not_granted, Toast.LENGTH_LONG).show()
            finish()
        }
    }

    public override fun onStart() {
        super.onStart()
        mapView?.onStart()

    }

    public override fun onResume() {
        super.onResume()
        mapView?.onResume()
    }

    public override fun onPause() {
        super.onPause()
        mapView?.onPause()
    }

    public override fun onStop() {
        super.onStop()
        mapView?.onStop()

    }

    public override fun onLowMemory() {
        super.onLowMemory()
        mapView?.onLowMemory()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        mapView?.onSaveInstanceState(outState)
    }

    public override fun onDestroy() {
        super.onDestroy()
        mapView?.onDestroy()
    }

}
