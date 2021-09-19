/**
 * React Native Map Link
 */

import {Linking} from 'react-native';

import {generatePrefixes, generateTitles, isIOS} from './constants';
import {askAppChoice, checkOptions} from './utils';

/**
 * Open a maps app, or let the user choose what app to open, with the given location.
 *
 * @param {{
 *     latitude: number | string,
 *     longitude: number | string,
 *     sourceLatitude: number | undefined | null,
 *     sourceLongitude: number | undefined | null,
 *     alwaysIncludeGoogle: boolean | undefined | null,
 *     googleForceLatLon: boolean | undefined | null,
 *     googlePlaceId: number | undefined | null,
 *     title: string | undefined | null,
 *     app: string | undefined | null
 *     dialogTitle: string | undefined | null
 *     dialogMessage: string | undefined | null
 *     cancelText: string | undefined | null
 *     appsWhiteList: array | undefined | null
 *     appTitles: object | undefined | null
 *     naverCallerName: string | undefined
 * }} options
 */
export async function showLocation(options) {
  const prefixes = generatePrefixes(options);
  checkOptions(options, prefixes);

  let useSourceDestiny = false;
  let useDstAddr = false;
  let sourceLat;
  let sourceLng;
  let sourceLatLng;

  if ('sourceLatitude' in options && 'sourceLongitude' in options) {
    useSourceDestiny = true;
    sourceLat = parseFloat(options.sourceLatitude);
    sourceLng = parseFloat(options.sourceLongitude);
    sourceLatLng = `${sourceLat},${sourceLng}`;
  }

  if (('dstaddr' in options)) {
    useDstAddr = true
  }

  let dstaddr = options.dstaddr && options.dstaddr.length ? options.dstaddr : null
  let encodedDstaddr = dstaddr ? encodeURIComponent(dstaddr) : null
  let lat = parseFloat(options.latitude);
  let lng = parseFloat(options.longitude);
  let latlng = `${lat},${lng}`;
  let title = options.title && options.title.length ? options.title : null;
  let encodedTitle = encodeURIComponent(title);
  let app = options.app && options.app.length ? options.app : null;
  let dialogTitle =
    options.dialogTitle && options.dialogTitle.length
      ? options.dialogTitle
      : 'Open in Maps';
  let dialogMessage =
    options.dialogMessage && options.dialogMessage.length
      ? options.dialogMessage
      : 'What app would you like to use?';
  let cancelText =
    options.cancelText && options.cancelText.length
      ? options.cancelText
      : 'Cancel';
  let appsWhiteList =
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
    });
  }

  let url = null;

  switch (app) {
    case 'apple-maps':
      url = prefixes['apple-maps'];
      url += `?q=${title ? encodedTitle : 'Location'}`;
      url += useDstAddr ? `&daddr=${encodedDstaddr}` : `&daddr=${latlng}`
      url += useSourceDestiny
        ? `&saddr=${sourceLatLng}` : '';
      break;
    case 'google-maps':
      let useTitleForQuery = !options.googleForceLatLon && title
      let googlePlaceId = options.googlePlaceId ? options.googlePlaceId : null

      url = prefixes['google-maps']
      url += `?q=${useTitleForQuery ? encodedTitle : latlng}`
      // url += (isIOS) ? '&api=1' : ''
      url += (googlePlaceId) ? `&query_place_id=${googlePlaceId}` : ''

      url += (useSourceDestiny) ? `&saddr=${sourceLatLng}` : ''
      url += (useDstAddr) ? `&daddr=${encodedDstaddr}` : `&daddr=${latlng}`
      url += '&directionsmode=driving'
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
      url = `${prefixes['uber']}?action=setPickup`

      if (useDstAddr) {
        url += `&dropoff[formatted_address]=${encodedDstaddr}`
      } else {
        url += `&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`
      }

      url += (useSourceDestiny) ? `&pickup[latitude]=${sourceLat}&pickup[longitude]=${sourceLng}` : `&pickup=my_location`

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
      url = `http://truckmap.com/place/${lat},${lng}`;

      if (useSourceDestiny) {
        url = `http://truckmap.com/route/${sourceLat},${sourceLng}/${lat},${lng}`;
      }
      break;
    case 'waze':
      // url = `${prefixes.waze}?ll=${latlng}&navigate=yes`;
      url = `${prefixes.waze}?`;
      url += `&q=${encodedDstaddr}`;
      url += `&navigate=yes`;

      break;
    case 'yandex':
      url = `${prefixes.yandex}build_route_on_map?lat_to=${lat}&lon_to=${lng}`;

      if (useSourceDestiny) {
        url += `&lat_from=${sourceLat}&lon_from=${sourceLng}`;
      }
      break;
    case 'moovit':
      url = `${prefixes.moovit}directions?dest_lat=${lat}&dest_lon=${lng}`;

      if (title) {
        url += `&dest_name=${encodedTitle}`;
      }

      if (useSourceDestiny) {
        url += `&orig_lat=${sourceLat}&orig_lon=${sourceLng}`;
      }
      break;
    case 'yandex-taxi':
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
      url = `${prefixes.dgis}routeSearch/to/${lng},${lat}/go`;

      if (useSourceDestiny) {
        url = `${prefixes.dgis}routeSearch/to/${lng},${lat}/from/${sourceLng},${sourceLat}/go`;
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
  }

  if (url) {
    return Linking.openURL(url).then(() => Promise.resolve(app));
  }
}
