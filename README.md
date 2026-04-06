
  # OnoiPark

  This is a code bundle for OnoiPark. The original project is available at https://www.figma.com/design/yiMivVu6cC9ytZOpgL8kjD/OnoiPark.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Building an Android APK

1. Install Android Studio (with Android SDK + platform tools) and Java 17.
2. Run `npm install` once to pull web + Capacitor dependencies.
3. Generate web assets via `npm run build`.
4. Sync the native project with `npm run android` (runs `npx cap sync android`).
5. Open the generated `android` folder in Android Studio with `npm run android:open`, choose a device, and build or run from there.

### Command-line builds

If you prefer the CLI, switch into the native project and run the Gradle wrappers:

```bash
cd android
.\gradlew assembleDebug        # Windows
./gradlew assembleDebug        # macOS/Linux
```

Replace `assembleDebug` with `assembleRelease` to produce a release-ready APK. For Play Store distribution you must configure a signing key inside `android/app/build.gradle` (release section) and rerun the release build.
  