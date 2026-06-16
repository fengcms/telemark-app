package com.haigetelemark.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.haigetelemark.app.plugins.CallLogPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CallLogPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
