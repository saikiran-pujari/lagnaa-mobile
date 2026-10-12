# React Native + Hermes keep rules are supplied by the RN Gradle plugin.
# Keep react-native-config generated BuildConfig fields readable by the native module.
-keep class in.lagnaa.app.BuildConfig { *; }
# Keychain / MMKV / Nitro
-keep class com.margelo.nitro.** { *; }
# Firebase messaging
-keep class com.google.firebase.** { *; }
