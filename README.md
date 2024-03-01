![React Native Map Link](https://lowcdn.com/2x/8f2/3ab63c0fe3f9-00fb302c20/banner.svg)

[![GitHub release](https://img.shields.io/npm/v/react-native-map-link.svg)](https://www.npmjs.com/package/react-native-map-link)
[![npm](https://img.shields.io/npm/dm/react-native-map-link.svg)](https://www.npmjs.com/package/react-native-map-link)
[![GitHub license](https://img.shields.io/github/license/flexible-agency/react-native-map-link.svg)](https://github.com/flexible-agency/react-native-map-link/blob/master/LICENSE)

---

An easy way to open a location in a map app of the user's choice, based on the apps they have installed
on their device. The app supports Apple Maps, Google Maps, Citymapper, Uber, and a dozen other apps.

<details>
<summary>Full list of supported apps</summary>

- Apple Maps – `apple-maps`
- Google Maps – `google-maps`
- Citymapper – `citymapper`
- Uber – `uber`
- Lyft – `lyft`
- The Transit App – `transit`
- TruckMap – `truckmap`
- Waze – `waze`
- Yandex.Navi – `yandex`
- Moovit – `moovit`
- Yandex Taxi – `yandex-taxi`
- Yandex Maps – `yandex-maps`
- Kakao Map – `kakaomap`
- TMAP - `tmap`
- Mapy.cz – `mapycz`
- Maps.me – `maps-me`
- OsmAnd - `osmand`
- Gett - `gett`
- Naver Map - `navermap`
- 2GIS - `dgis`
- Liftago - `liftago`
- Petal Maps - `petalmaps` (Android only)

</details>

## Installation

### 1. Install the package

```shell
npm i -S react-native-map-link         # or yarn add react-native-map-link
```

### 2. Post-install steps

Based on the platforms your app supports, you also need to:

<details id="iOSPostInstall">
<summary><strong>iOS – Update Info.plist</strong></summary>

To allow your app to detect if any of the directions apps are installed, an extra step is required on iOS. Your app needs to provide the `LSApplicationQueriesSchemes` key inside `ios/{my-project}/Info.plist` to specify the URL schemes with which the app can interact.

Just add this in your `Info.plist` depending on which apps you'd like to support. Omitting these might mean that the library can't detect some of the maps apps installed by the user.

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>comgooglemaps</string>
    <string>citymapper</string>
    <string>uber</string>
    <string>lyft</string>
    <string>transit</string>
    <string>truckmap</string>
    <string>waze</string>
    <string>yandexnavi</string>
    <string>moovit</string>
    <string>yandextaxi</string>
    <string>yandexmaps</string>
    <string>kakaomap</string>
    <string>tmap</string>
    <string>szn-mapy</string>
    <string>mapsme</string>
    <string>osmandmaps</string>
    <string>gett</string>
    <string>nmap</string>
    <string>dgis</string>
    <string>lftgpas</string>
</array>
```

Using Expo? [Read the instructions](docs/expo.md) to make it work on iOS.

</details>

<details id="androidPostInstall">
<summary><strong>Android – Update AndroidManifest.xml</strong></summary>

When switching to Android 11/Android SDK 30 (i.e. using Expo SDK 41), this library doesn't work out of the box anymore. The reason is the new [Package Visibilty](https://developer.android.com/training/package-visibility) security feature. We'll have to update our `AndroidManifest.xml` to explicitly allow querying for other apps.

You can do so by coping the `<queries>` statement below, and pasting it in the top level of your AndroidManifest (i.e. within the `<manifest> ... </manifest>`).

```xml
<queries>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="http"/>
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="https"/>
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="geo" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="google.navigation" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="applemaps" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="citymapper" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="uber" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="lyft" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="transit" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="truckmap" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="waze" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="yandexnavi" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="moovit" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="yandexmaps://maps.yandex." />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="yandextaxi" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="kakaomap" />
  </intent>
    <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="tmap" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="mapycz" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="mapsme" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="osmand.geo" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="gett" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="nmap" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="dgis" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="lftgpas" />
  </intent>
  <intent>
    <action android:name="android.intent.action.VIEW" />
    <data android:scheme="petalmaps" />
  </intent>
</queries>
```

If you're running into a 'unexpected element `<queries>` found in `<manifest>`' error, make sure you have an updated version of Gradle in your `android/build.gradle` file:

```java
classpath("com.android.tools.build:gradle:3.5.4")
```

More info [here](https://stackoverflow.com/a/67383641/1129689).

</details>

<details>
<summary><strong>Expo – Update app.json</strong></summary>

[Read the instructions here](docs/expo.md)

</details>

## Usage

Using the `showLocation` function will shown an action sheet on iOS and an alert on Android, without any custom styling:

```js
import {showLocation} from 'react-native-map-link';

showLocation({
  latitude: 38.8976763,
  longitude: -77.0387185,
  sourceLatitude: -8.0870631, // optionally specify starting location for directions
  sourceLongitude: -34.8941619, // required if sourceLatitude is specified
  address: '', // optional but can replace latitude and longitude if needed
  title: 'The White House', // optional 
  googleForceLatLon: false, // optionally force GoogleMaps to use the latlon for the query instead of the title
  googlePlaceId: 'ChIJGVtI4by3t4kRr51d_Qm_x58', // optionally specify the google-place-id
  alwaysIncludeGoogle: true, // optional, true will always add Google Maps to iOS and open in Safari, even if app is not installed (default: false)
  dialogTitle: 'This is the dialog Title', // optional (default: 'Open in Maps')
  dialogMessage: 'This is the amazing dialog Message', // optional (default: 'What app would you like to use?')
  cancelText: 'This is the cancel button text', // optional (default: 'Cancel')
  appsWhiteList: ['google-maps'], // optionally you can set which apps to show (default: will show all supported apps installed on device)
  naverCallerName: 'com.example.myapp', // to link into Naver Map You should provide your appname which is the bundle ID in iOS and applicationId in android.
  appTitles: { 'google-maps': 'My custom Google Maps title' }, // optionally you can override default app titles
  app: 'uber',  // optionally specify specific app to use
  directionsMode: 'walk', // optional, accepted values are 'car', 'walk', 'public-transport' or 'bike'
});
```

Alternatively you can specify the `address` field and leave the latitude and longitude properties as empty strings 

```js
import {showLocation} from 'react-native-map-link';

showLocation({
  latitude: '',
  longitude: '',
  address: '1600 Pennsylvania Avenue NW, Washington, DC 20500', // Required if replacing latitude and longitude
  title: 'The White House', // optional
  googleForceLatLon: false, // optionally force GoogleMaps to use the latlon for the query instead of the title
  alwaysIncludeGoogle: true, // optional, true will always add Google Maps to iOS and open in Safari, even if app is not installed (default: false)
  dialogTitle: 'This is the dialog Title', // optional (default: 'Open in Maps')
  dialogMessage: 'This is the amazing dialog Message', // optional (default: 'What app would you like to use?')
  cancelText: 'This is the cancel button text', // optional (default: 'Cancel')
  appsWhiteList: ['google-maps'], // optionally you can set which apps to show (default: will show all supported apps installed on device)
  naverCallerName: 'com.example.myapp', // to link into Naver Map You should provide your appname which is the bundle ID in iOS and applicationId in android.
  appTitles: { 'google-maps': 'My custom Google Maps title' }, // optionally you can override default app titles
  app: 'uber',  // optionally specify specific app to use
});
```

Notes:

- The `sourceLatitude` / `sourceLongitude` options only work if you specify both. Currently supports all apps except Waze.
- `directionsMode` works on google-maps and apple-maps (on the latter, `bike` mode will not work). Without setting it, the app will decide based on his own settings.
- If you set `directionsMode` but do not set `sourceLatitude` and `sourceLongitude`, google-maps and apple-maps will still enter directions mode, and use the current location as starting point.
- If you want to query an address instead of passing the `latitude` and `longitude` fields, you can do this by leaving both of the required fields as empty strings and provide a full address to be queried.

### Or

Using the `getApps` function will return an array (`GetAppResult[]`) with the apps available on the smartphone:

```ts
type GetAppResult = {
  id: string;
  name: string;
  icon: NodeRequire;
  open: () => Promise<void>;
};
```

```tsx
import {getApps, GetAppResult} from 'react-native-map-link';

const Demo = () => {
  const [availableApps, setAvailableApps] = useState<GetAppResult[]>([]);

  useEffect(() => {
    (async () => {
      const result = await getApps({
        latitude: 38.8976763,
        longitude: -77.0387185,
        address: '1600 Pennsylvania Avenue NW, Washington, DC 20500', // optional 
        title: 'The White House', // optional
        googleForceLatLon: false, // optionally force GoogleMaps to use the latlon for the query instead of the title
        alwaysIncludeGoogle: true, // optional, true will always add Google Maps to iOS and open in Safari, even if app is not installed (default: false)
        appsWhiteList: ['google-maps'], // optionally you can set which apps to show (default: will show all supported apps installed on device)
      });
      setAvailableApps(result);
    })();
  }, []);

  return (
    <React.Fragment>
      {availableApps.map(({icon, name, id, open}) => (
        <Pressable key={id} onPress={open}>
          <Image source={icon} />
          <Text>{name}</Text>
        </Pressable>
      ))}
    </React.Fragment>
  );
};
```

## More information

- [Using this library with Expo](docs/expo.md)
- [Alternative usage: styled popup](docs/popup.md)
- [Adding support for new maps apps](docs/add-app.md)

<br /><br />

---

<div align="center">
	<b>
		<a href="https://schof.co/consulting/?utm_source=flexible-agency/react-native-map-link">Get professional support for this package →</a>
	</b>
	<br>
	<sub>
		Custom consulting sessions available for implementation support or feature development.
	</sub>
</div>
