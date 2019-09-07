package com.example.safe

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.mapbox.mapboxsdk.Mapbox
import com.mapbox.mapboxsdk.maps.MapView
import com.mapbox.mapboxsdk.maps.Style


import android.annotation.SuppressLint
import android.util.Log
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.Toast
import androidx.core.content.ContextCompat
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.*

import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback

import com.mapbox.android.core.permissions.PermissionsListener
import com.mapbox.android.core.permissions.PermissionsManager
import com.mapbox.mapboxsdk.annotations.MarkerOptions
import com.mapbox.mapboxsdk.geometry.LatLng
import com.mapbox.mapboxsdk.location.LocationComponentActivationOptions
import com.mapbox.mapboxsdk.location.LocationComponentOptions
import com.mapbox.mapboxsdk.location.modes.CameraMode
import com.mapbox.mapboxsdk.location.modes.RenderMode
import com.tapadoo.alerter.Alerter
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : AppCompatActivity(), OnMapReadyCallback, PermissionsListener {

    private class BackgroundRunnable(val context: MainActivity): Runnable {
        override fun run() {
            while(true) {
                Thread.sleep(500)
                val result = context.getEventData()
                Volley.newRequestQueue(context).add(result)
            }
        }
    }
    private var mapView: MapView? = null
    private var hoveringPicker: ImageView? = null
    private var permissionsManager: PermissionsManager = PermissionsManager(this)
    private var reportButton: Button? = null
    private lateinit var mapboxMap: MapboxMap

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
        var backgroundRunnable = BackgroundRunnable(this)
        Thread(backgroundRunnable).start()
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

        reportButton?.setOnClickListener {
                    var mapTargetLatLng: LatLng = mapboxMap.cameraPosition.target
                    postNewEvent(mapTargetLatLng.latitude, mapTargetLatLng.longitude)
                    postNewEvent(mapTargetLatLng.latitude, mapTargetLatLng.longitude)
                    Alerter.create(this)
                        .setTitle("The event has been logged.")
                        .setText("Thank you for keeping others safe. Make sure you are in a safe location and move away from current dangers.")
                        .setBackgroundColorRes(R.color.success)
                        .show()
            }
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

    private fun getEventData() :JsonObjectRequest{
        val url = "https://us-central1-safe-21981.cloudfunctions.net/events"

        val getDataRequest = JsonObjectRequest(Request.Method.GET, url, null,
            Response.Listener<JSONObject> { response ->
                val jsonArray = response.getJSONArray("points")
                handleJSONArray(jsonArray)
            },
            Response.ErrorListener { error ->
                Log.e("Events", error.localizedMessage)
            })
        return getDataRequest
    }

    private fun handleJSONArray(values : JSONArray) {
        for(i in 0 until values.length()) {
            val jsonObject = values.getJSONObject(i)
            val location = jsonObject.getJSONObject("location")
            val latitude = location.getDouble("_latitude")
            val longitude = location.getDouble("_longitude")
            var markerOptions = MarkerOptions()
            var latLng = LatLng(latitude, longitude)
            markerOptions.position = latLng
            mapboxMap.addMarker(markerOptions)
        }
    }

    private fun postNewEvent(latitude: Double, longitude: Double) {
        val url = "https://us-central1-safe-21981.cloudfunctions.net/events?latitude=" + latitude + "&longitude=" + longitude
        val postDataRequest = JsonObjectRequest(Request.Method.POST, url, null, Response.Listener { a -> Log.d("Events", "Success") },  Response.ErrorListener { error ->
            Log.e("Events", error.localizedMessage)
        })
        Volley.newRequestQueue(this).add(postDataRequest)
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
