package com.haigetelemark.calllog;

import android.Manifest;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.CallLog;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

@CapacitorPlugin(
    name = "CallLog",
    permissions = {
        @Permission(strings = { Manifest.permission.READ_CALL_LOG }, alias = "callLog")
    }
)
public class CallLogPlugin extends Plugin {
    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (hasCallLogPermission()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }

        requestPermissionForAlias("callLog", call, "callLogPermissionCallback");
    }

    @PermissionCallback
    private void callLogPermissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", hasCallLogPermission());
        call.resolve(result);
    }

    @PluginMethod
    public void getLatestForNumber(PluginCall call) {
        if (!hasCallLogPermission()) {
            call.reject("READ_CALL_LOG permission is not granted");
            return;
        }

        String phone = normalize(call.getString("phone", ""));
        String since = call.getString("since", null);
        long sinceMillis = 0L;

        if (since != null && !since.isEmpty()) {
            sinceMillis = Math.max(0L, parseIso(since) - 30000L);
        }

        Uri uri = CallLog.Calls.CONTENT_URI;
        String[] projection = {
            CallLog.Calls.NUMBER,
            CallLog.Calls.DATE,
            CallLog.Calls.DURATION,
            CallLog.Calls.TYPE
        };
        String selection = sinceMillis > 0 ? CallLog.Calls.DATE + ">=?" : null;
        String[] args = sinceMillis > 0 ? new String[] { String.valueOf(sinceMillis) } : null;
        String sort = CallLog.Calls.DATE + " DESC";

        try (
            Cursor cursor = getContext()
                .getContentResolver()
                .query(uri, projection, selection, args, sort)
        ) {
            JSObject result = new JSObject();

            if (cursor == null) {
                result.put("entry", JSONObject.NULL);
                call.resolve(result);
                return;
            }

            while (cursor.moveToNext()) {
                String number = cursor.getString(0);
                String normalizedNumber = normalize(number);

                if (!isLikelySameNumber(phone, normalizedNumber)) {
                    continue;
                }

                long startedAtMillis = cursor.getLong(1);
                int duration = cursor.getInt(2);
                int type = cursor.getInt(3);
                long endedAtMillis = startedAtMillis + duration * 1000L;

                JSObject entry = new JSObject();
                entry.put("number", number);
                entry.put("duration", Math.max(duration, 0));
                entry.put("startedAt", iso(startedAtMillis));
                entry.put("endedAt", iso(endedAtMillis));
                entry.put("type", type);
                result.put("entry", entry);
                call.resolve(result);
                return;
            }

            result.put("entry", JSONObject.NULL);
            call.resolve(result);
        } catch (Exception exception) {
            call.reject("Failed to read call log", exception);
        }
    }

    private boolean hasCallLogPermission() {
        return ContextCompat.checkSelfPermission(getContext(), Manifest.permission.READ_CALL_LOG)
            == PackageManager.PERMISSION_GRANTED;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return value.replaceAll("[^0-9]", "");
    }

    private boolean isLikelySameNumber(String expected, String actual) {
        if (expected.isEmpty() || actual.isEmpty()) {
            return false;
        }

        if (expected.equals(actual)) {
            return true;
        }

        int minLength = Math.min(Math.min(expected.length(), actual.length()), 11);
        if (minLength < 7) {
            return false;
        }

        return expected.substring(expected.length() - minLength)
            .equals(actual.substring(actual.length() - minLength));
    }

    private String iso(long millis) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
        formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
        return formatter.format(new Date(millis));
    }

    private long parseIso(String value) {
        try {
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
            formatter.setTimeZone(TimeZone.getTimeZone("UTC"));
            Date date = formatter.parse(value);
            return date == null ? 0L : date.getTime();
        } catch (Exception ignored) {
            return 0L;
        }
    }
}
