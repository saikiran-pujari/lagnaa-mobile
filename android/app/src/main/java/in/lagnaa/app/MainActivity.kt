package `in`.lagnaa.app

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

  /** The main component registered from JavaScript (see app.json). */
  override fun getMainComponentName(): String = "Lagnaa"

  override fun onCreate(savedInstanceState: Bundle?) {
    // Native splash stays until JS calls BootSplash.hide() after the first screen renders.
    RNBootSplash.init(this, R.style.BootTheme)
    // react-native-screens: pass null so Android does not restore fragment state across process death.
    super.onCreate(null)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
