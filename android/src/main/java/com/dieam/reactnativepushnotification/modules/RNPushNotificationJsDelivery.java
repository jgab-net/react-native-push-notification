package com.dieam.reactnativepushnotification.modules;

import android.os.Build;
import android.os.Bundle;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Set;

/**
 * Created by lambert on 2016/10/09.
 */

public class RNPushNotificationJsDelivery {
    private ReactApplicationContext mReactContext;

    public RNPushNotificationJsDelivery(ReactApplicationContext reactContext) {
        mReactContext = reactContext;
    }

    void sendEvent(String eventName, Object params) {
        if (mReactContext.hasActiveCatalystInstance()) {
            mReactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        }
    }

    void notifyRemoteFetch(Bundle bundle) {
        String bundleString = convertJSON(bundle);
        WritableMap params = Arguments.createMap();
        params.putString("dataJSON", bundleString);
        sendEvent("remoteFetch", params);
    }

    void notifyNotification(Bundle bundle) {
        String bundleString = convertJSON(bundle);

        WritableMap params = Arguments.createMap();
        params.putString("dataJSON", bundleString);

        sendEvent("remoteNotificationReceived", params);
    }

    void notifyNotificationAction(Bundle bundle) {
        String bundleString = convertJSON(bundle);

        WritableMap params = Arguments.createMap();
        params.putString("dataJSON", bundleString);

        sendEvent("notificationActionReceived", params);
    }

    String convertJSON(Bundle bundle) {
        return bundleToJson(bundle).toString();
    }

    private JSONObject bundleToJson(Bundle bundle) {
        JSONObject json = new JSONObject();
        Set<String> keys = bundle.keySet();
        for (String key : keys) {
            try {
                if (String.class.isInstance(bundle.get(key))) {
                    try {
                        setJSONObjectProperty(json, key, new JSONObject(bundle.get(key).toString()));
                    } catch (JSONException ignored) {
                        setJSONObjectProperty(json, key, bundle.get(key));
                    }
                } else if (Bundle.class.isInstance(bundle.get(key))) {
                    json.put(key, convertJSON((Bundle) bundle.get(key)));
                } else {
                    setJSONObjectProperty(json, key, bundle.get(key));
                }
            } catch (JSONException e) {
                return null;
            }
        }
        return json;
    }

    private JSONObject setJSONObjectProperty(JSONObject json, String key, Object value) throws JSONException {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            json.put(key, JSONObject.wrap(value));
        } else {
            json.put(key, value);
        }
        return json;
    }

}
