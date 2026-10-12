declare module 'react-native-config' {
  export interface NativeConfig {
    APP_ENV?: string;
    API_BASE_URL?: string;
    API_BASE_URL_ANDROID_EMULATOR?: string;
    OTA_CHANNEL?: string;
    OTA_UPDATE_URL?: string;
    SENTRY_DSN?: string;
    SENTRY_ENVIRONMENT?: string;
    GOOGLE_WEB_CLIENT_ID?: string;
    GOOGLE_IOS_CLIENT_ID?: string;
    DEEP_LINK_SCHEME?: string;
    UNIVERSAL_LINK_HOST?: string;
    LOG_LEVEL?: string;
  }
  export const Config: NativeConfig;
  export default Config;
}
