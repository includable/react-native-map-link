/**
 * React Native Map Link
 */

import {Linking} from 'react-native';

import {generatePrefixes, generateTitles, isIOS, icons} from './constants';
import {
  askAppChoice,
  checkOptions,
  getAvailableApps,
  checkNotSupportedApps,
} from './utils';

/**
 * Open a maps app, or let the user choose what app to open, with the given location.
 *
 * @param {{
 *     latitude: number | string,
 *     longitude: number | string,
 *     fromAddress: string | undefined,
 *     toAddress: string | undefined,
 *     sourceLatitude: number | undefined | null,
 *     sourceLongitude: number | undefined | null,
 *     alwaysIncludeGoogle: boolean | undefined | null,
 *     googleForceLatLon: boolean | undefined | null,
 *     googlePlaceId: number | string | undefined | null,
 *     title: string | undefined | null,
 *     app: string | undefined | null
 *     dialogTitle: string | undefined | null
 *     dialogMessage: string | undefined | null
 *     cancelText: string | undefined | null
 *     appsWhiteList: array | undefined | null
 *     appTitles: object | undefined | null
 *     naverCallerName: string | undefined
 *     directionsMode: 'car' | 'walk' | 'public-transport' | 'bike' | undefined
 *     tintColor: string | undefined
 * }} options
 */
export async function showLocation(options) {
  const prefixes = generatePrefixes(options);
  checkOptions(options, prefixes);

  let useSourceDestiny = false;
  let sourceLat;
  let sourceLng;
  let sourceLatLng;

  if (options.sourceLatitude != null && options.sourceLongitude != null) {
    useSourceDestiny = true;
    sourceLat = parseFloat(options.sourceLatitude);
    sourceLng = parseFloat(options.sourceLongitude);
    sourceLatLng = `${sourceLat},${sourceLng}`;
  }

  const fromAddress = options.fromAddress;
  const toAddress = options.toAddress;

  const lat = parseFloat(options.latitude);
  const lng = parseFloat(options.longitude);
  const latlng = `${lat},${lng}`;
  const title = options.title && options.title.length ? options.title : null;
  const encodedTitle = encodeURIComponent(title);
  let app = options.app && options.app.length ? options.app : null;
  const dialogTitle =
    options.dialogTitle && options.dialogTitle.length
      ? options.dialogTitle
      : 'Open in Maps';
  const dialogMessage =
    options.dialogMessage && options.dialogMessage.length
      ? options.dialogMessage
      : 'What app would you like to use?';
  const cancelText =
    options.cancelText && options.cancelText.length
      ? options.cancelText
      : 'Cancel';
  const appsWhiteList =
    options.appsWhiteList && options.appsWhiteList.length
      ? options.appsWhiteList
      : null;

  if (!app) {
    app = await askAppChoice({
      dialogTitle,
      dialogMessage,
      cancelText,
      appsWhiteList,
      prefixes,
      appTitles: generateTitles(options.appTitles),
      tintColor: options.tintColor,
    });
  }

  let url = null;

  const getDirectionsModeAppleMaps = () => {
    switch (options.directionsMode) {
      case 'car':
        return 'd';

      case 'walk':
        return 'w';

      case 'public-transport':
        return 'r';

      default:
        return undefined;
    }
  };

  const getDirectionsModeGoogleMaps = () => {
    switch (options.directionsMode) {
      case 'car':
        return 'driving';

      case 'walk':
        return 'walking';

      case 'public-transport':
        return 'transit';

      case 'bike':
        return 'bicycling';

      default:
        return undefined;
    }
  };

  switch (app) {
    case 'apple-maps':
      const appleDirectionMode = getDirectionsModeAppleMaps();
      url = prefixes['apple-maps'];
      if (useSourceDestiny || options.directionsMode) {
        url = `${url}?daddr=${latlng}`;
        url += sourceLatLng ? `&saddr=${sourceLatLng}` : '';
      } else if (!options.appleIgnoreLatLon) {
        url = `${url}?ll=${latlng}`;
      }
      url +=
        useSourceDestiny || options.directionsMode || !options.appleIgnoreLatLon
          ? '&'
          : '?';
      url += `q=${title ? encodedTitle : 'Location'}`;
      url += appleDirectionMode ? `&dirflg=${appleDirectionMode}` : '';
      break;
    case 'google-maps':
      const googleDirectionMode = getDirectionsModeGoogleMaps();
      // Always using universal URL instead of URI scheme since the latter doesn't support all parameters (#155)
      if (useSourceDestiny || options.directionsMode) {
        // Use "dir" as this will open up directions
        url = 'https://www.google.com/maps/dir/?api=1';

        const toAddressQuery = toAddress ? encodeURI(toAddress) : '';

        url += sourceLatLng ? `&origin=${sourceLatLng}` : '';
        if (!options.googleForceLatLon && title) {
          url += `&destination=${toAddressQuery || encodedTitle}`;
        } else {
          url += `&destination=${toAddressQuery || latlng}`;
        }

        url += options.googlePlaceId
          ? `&destination_place_id=${options.googlePlaceId}`
          : '';

        url += googleDirectionMode ? `&travelmode=${googleDirectionMode}` : '';
      } else {
        // Use "search" as this will open up a single marker
        url = 'https://www.google.com/maps/search/?api=1';

        if (!options.googleForceLatLon && title) {
          url += `&query=${encodedTitle}`;
        } else {
          url += `&query=${latlng}`;
        }

        url += options.googlePlaceId
          ? `&query_place_id=${options.googlePlaceId}`
          : '';
      }
      break;
    case 'citymapper':
      url = `${prefixes.citymapper}directions?endcoord=${latlng}`;

      if (title) {
        url += `&endname=${encodedTitle}`;
      }

      if (useSourceDestiny) {
        url += `&startcoord=${sourceLatLng}`;
      }
      break;
    case 'uber':
      url = `${prefixes.uber}?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`;

      if (title) {
        url += `&dropoff[nickname]=${encodedTitle}`;
      }

      url += useSourceDestiny
        ? `&pickup[latitude]=${sourceLat}&pickup[longitude]=${sourceLng}`
        : '&pickup=my_location';

      break;
    case 'lyft':
      url = `${prefixes.lyft}ridetype?id=lyft&destination[latitude]=${lat}&destination[longitude]=${lng}`;

      if (useSourceDestiny) {
        url += `&pickup[latitude]=${sourceLat}&pickup[longitude]=${sourceLng}`;
      }

      break;
    case 'transit':
      url = `${prefixes.transit}directions?to=${latlng}`;

      if (useSourceDestiny) {
        url += `&from=${sourceLatLng}`;
      }
      break;
    case 'truckmap':
      url = `https://truckmap.com/place/${lat},${lng}`;

      if (useSourceDestiny) {
        url = `https://truckmap.com/route/${sourceLat},${sourceLng}/${lat},${lng}`;
      }
      break;
    case 'waze':
      url = `${prefixes.waze}?ll=${latlng}&navigate=yes`;
      if (title) {
        url += `&q=${encodedTitle}`;
      }
      break;
    case 'yandex':
      url = `${prefixes.yandex}build_route_on_map?lat_to=${lat}&lon_to=${lng}`;

      if (useSourceDestiny) {
        url += `&lat_from=${sourceLat}&lon_from=${sourceLng}`;
      }
      break;
    case 'moovit':
      url = `${prefixes.moovit}?dest_lat=${lat}&dest_lon=${lng}`;

      if (title) {
        url += `&dest_name=${encodedTitle}`;
      }

      if (useSourceDestiny) {
        url += `&orig_lat=${sourceLat}&orig_lon=${sourceLng}`;
      }
      break;
    case 'yandex-taxi':
      if (useSourceDestiny) {
        url = `${prefixes['yandex-taxi']}route?start-lat=${sourceLat}&end-lat=${lat}&start-lon=${sourceLng}&end-lon=${lng}&appmetrica_tracking_id=1178268795219780156`;
        break;
      }

      url = `${prefixes['yandex-taxi']}route?end-lat=${lat}&end-lon=${lng}&appmetrica_tracking_id=1178268795219780156`;

      break;
    case 'yandex-maps':
      url = `${prefixes['yandex-maps']}?pt=${lng},${lat}`;

      break;
    case 'kakaomap':
      url = `${prefixes.kakaomap}look?p=${latlng}`;

      if (useSourceDestiny) {
        url = `${prefixes.kakaomap}route?sp=${sourceLat},${sourceLng}&ep=${latlng}&by=CAR`;
      }
      break;
    case 'tmap':
      url = `${prefixes.tmap}viewmap?x=${lng}&y=${lat}`;

      if (useSourceDestiny) {
        url = `${prefixes.tmap}route?startx=${sourceLng}&starty=${sourceLat}&goalx=${lng}&goaly=${lat}`;
      }
      break;
    case 'mapycz':
      url = `${prefixes.mapycz}www.mapy.cz/zakladni?x=${lng}&y=${lat}&source=coor&id=${lng},${lat}`;

      break;
    case 'maps-me':
      url = `${prefixes['maps-me']}route?sll=${sourceLat},${sourceLng}&saddr= &dll=${lat},${lng}&daddr=${title}&type=vehicle`;

      break;
    case 'osmand':
      url = isIOS
        ? `${prefixes.osmand}?lat=${lat}&lon=${lng}`
        : `${prefixes.osmand}?q=${lat},${lng}`;

      break;
    case 'gett':
      url = `${prefixes.gett}order?pickup=my_location&dropoff_latitude=${lat}&dropoff_longitude=${lng}`;

      break;
    case 'navermap':
      url = `${prefixes.navermap}map?lat=${lat}&lng=${lng}&appname=${options.naverCallerName}`;

      if (useSourceDestiny) {
        url = `${prefixes.navermap}route?slat=${sourceLat}&slng=${sourceLng}&dlat=${lat}&dlng=${lng}&appname=${options.naverCallerName}`;
      }
      break;
    case 'dgis':
      const toAddressQuery = toAddress ? `|${toAddress}` : '';
      const fromAddressQuery = fromAddress ? `|${fromAddress}` : '';

      url = `${prefixes.dgis}routeSearch/to/${lng},${lat}|${toAddressQuery}/go`;

      if (useSourceDestiny) {
        url = `${prefixes.dgis}routeSearch/to/${lng},${lat}|${toAddressQuery}/from/${sourceLng},${sourceLat}|${fromAddressQuery}/go`;
      }
      break;
    case 'liftago':
      url = `${prefixes.liftago}order?destinationLat=${lat}&destinationLon=${lng}`;

      if (title) {
        url += `&destinationName=${encodedTitle}`;
      }

      if (useSourceDestiny) {
        url += `&pickupLat=${sourceLat}&pickupLon=${sourceLng}`;
      }
      break;
    case 'petalmaps':
      url = `${prefixes.petalmaps}navigation?daddr=${lat},${lng}`;

      if (useSourceDestiny) {
        url += `&saddr=${sourceLat},${sourceLng}`;
      }
      break;
  }

  if (url) {
    return Linking.openURL(url).then(() => Promise.resolve(app));
  }
}

export async function getApps(options) {
  let apps = await getAvailableApps(generatePrefixes(options));
  if ('appsWhiteList' in options && options.appsWhiteList.length) {
    checkNotSupportedApps(options.appsWhiteList);
    apps = apps.filter((appName) => options.appsWhiteList.includes(appName));
  }

  const titles = generateTitles(options.appTitles);
  async function open(app) {
    return showLocation({...options, app});
  }

  let list = [];
  for (const app of apps) {
    list.push({
      id: app,
      name: titles[app],
      icon: icons[app],
      open: open.bind(this, app),
    });
  }

  return list;
}
