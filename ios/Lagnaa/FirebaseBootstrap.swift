import Foundation
import FirebaseCore

/// Configures Firebase only when a GoogleService-Info.plist made it into the bundle.
/// The "Copy Firebase config" build phase copies ios/Firebase/<Env>/GoogleService-Info.plist when present.
enum FirebaseBootstrap {
  static func configureIfAvailable() {
    guard Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else {
      NSLog("lagnaa: GoogleService-Info.plist not bundled; Firebase disabled for this build")
      return
    }
    if FirebaseApp.app() == nil {
      FirebaseApp.configure()
    }
  }
}
