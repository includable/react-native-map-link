import * as React from 'react';
import {
  ViewStyle,
  StyleProp,
  ImageStyle,
  TextStyle,
  ImageSourcePropType,
} from 'react-native';

/** id for map application. this is the id that is passed to the `app` option */
export type MapId =
  | 'apple-maps'
  | 'google-maps'
  | 'citymapper'
  | 'uber'
  | 'lyft'
  | 'transit'
  | 'truckmap'
  | 'waze'
  | 'yandex'
  | 'moovit'
  | 'yandex-maps'
  | 'yandex-taxi'
  | 'kakaomap'
  | 'tmap'
  | 'mapycz'
  | 'maps-me'
  | 'osmand'
  | 'gett'
  | 'navermap'
  | 'dgis'
  | 'liftago'
  | 'petalmaps';

/** options shared across different types */
interface SharedOptions {
  /** optionally you can set which apps to show (default: will show all supported apps installed on device) */
  appsWhiteList?: MapId[];
  /** custom titles to display for each app instead of using default titles. */
  appTitles?: Partial<Record<MapId, string>>;
}

interface Options extends SharedOptions {
  latitude: number | string;
  longitude: number | string;
  /** optionally you can enter a full address that will be queried against the map app's API and return the initial results if not the actual matched result. */
  /** latitude and longitude will be ignored if the address field is set */
  address?: string | undefined;
  /** optionally specify starting location for directions */
  sourceLatitude?: number;
  /** required if `sourceLatitude` is specified */
  sourceLongitude?: number;
  /** optional, true will always add Google Maps to iOS and open in Safari, even if app is not installed (default: false) */
  alwaysIncludeGoogle?: boolean;
  googleForceLatLon?: boolean;
  appleIgnoreLatLon?: boolean;
  googlePlaceId?: string;
  title?: string;
  /** optionally specify specific app to use */
  app?: MapId;
  /** optional (default: 'Open in Maps') */
  dialogTitle?: string;
  /** optional (default: 'What app would you like to use?') */
  dialogMessage?: string;
  cancelText?: string;
  /** to link into Naver Map You should provide your appname which is the bundle ID in iOS and applicationId in android. */
  naverCallerName?: string;
  directionsMode?: 'car' | 'walk' | 'public-transport' | 'bike';
}

interface PopupStyleProp {
  container?: StyleProp<ViewStyle>;
  itemContainer?: StyleProp<ViewStyle>;
  image?: StyleProp<ImageStyle>;
  itemText?: StyleProp<TextStyle>;
  headerContainer?: StyleProp<ViewStyle>;
  titleText?: StyleProp<TextStyle>;
  subtitleText?: StyleProp<TextStyle>;
  cancelButtonContainer?: StyleProp<ViewStyle>;
  cancelButtonText?: StyleProp<TextStyle>;
  separatorStyle?: StyleProp<ViewStyle>;
  activityIndicatorContainer?: StyleProp<ViewStyle>;
}

interface PopupProps extends SharedOptions {
  isVisible: boolean;
  showHeader?: boolean;
  customHeader?: React.ReactNode;
  customFooter?: React.ReactNode;
  onCancelPressed: () => void;
  onBackButtonPressed: () => void;
  onAppPressed: (appName: MapId) => void;
  style?: PopupStyleProp;
  modalProps?: object;
  options: Options;
}

/**
 * Link users to their desired map app.
 *
 * If an `app` option is passed, it will directly link to that map app,
 * else it will prompt user to select map app.
 *
 * Prompts via `ActionSheetIOS` on iOS & `Alert.alert` on Android.
 *
 * If these prompts don't meet your UI use case, checkout the `Popup` component,
 * or use the `getApps` function to build a custom UI.
 */
export function showLocation(
  options: Options,
): Promise<string | undefined | null>;

export type GetAppResult = {
  id: MapId;
  name: string;
  icon: ImageSourcePropType;
  /** function to link user to map app */
  open: () => Promise<void>;
};

/**
 * Get array of map apps on users device.
 *
 * Useful for building custom UIs.
 */
export function getApps(options: Options): Promise<GetAppResult[]>;

/**
 * A styled popup component that displays icons in the app list
 */
export class Popup extends React.Component<PopupProps> {}
