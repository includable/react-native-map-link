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
  MapsException
} from './utils';

/**
 * Open a maps app, or let the user choose what app to open, with the given location.
 *
 * @param {{
 *     latitude: number | string,
 *     longitude: number | string,
 *     sourceLatitude: number | undefined | null,
 *     sourceLongitude: number | undefined | null,
 *     address: string | undefined | null,
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
 * }} options
 */
export async function showLocation(options) {
  const prefixes = generatePrefixes(options);
  checkOptions(options, prefixes);

  let useSourceDestiny = false;
  let sourceLat;
  let sourceLng;
  let sourceLatLng;
  let fullAddress;

  if (options.sourceLatitude != null && options.sourceLongitude != null) {
    useSourceDestiny = true;
    sourceLat = parseFloat(options.sourceLatitude);
    sourceLng = parseFloat(options.sourceLongitude);
    sourceLatLng = `${sourceLat},${sourceLng}`;
  }

  if (options.address) {
    fullAddress = encodeURIComponent(options.address)
  }

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
      if (fullAddress) {
        url = `${url}?address=${fullAddress}`;
      } else {
        if (useSourceDestiny || options.directionsMode) {
          url = `${url}?daddr=${latlng}`;
          url += sourceLatLng ? `&saddr=${sourceLatLng}` : '';
        } else if (!options.appleIgnoreLatLon) {
          url = `${url}?ll=${latlng}`;
        }
      }
      url +=
        useSourceDestiny || options.directionsMode || !options.appleIgnoreLatLon || fullAddress
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
        url += sourceLatLng ? `&origin=${sourceLatLng}` : '';
        if (!options.googleForceLatLon && title) {
          url += `&destination=${encodedTitle}`;
        } else {
          url += `&destination=${latlng}`;
        }

        url += options.googlePlaceId
          ? `&destination_place_id=${options.googlePlaceId}`
          : '';

        url += googleDirectionMode ? `&travelmode=${googleDirectionMode}` : '';
      } else {
        // Use "search" as this will open up a single marker
        if (fullAddress) {
          url = `https://www.google.com/maps/search/?q=${fullAddress}`;
        } else {
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
      }
      break;
    case 'citymapper':
      if (fullAddress) {
        url = `${prefixes.citymapper}directions?endname=${fullAddress}`;
      } else {
        url = `${prefixes.citymapper}directions?endcoord=${latlng}`;

        if (title) {
          url += `&endname=${encodedTitle}`;
        }

        if (useSourceDestiny) {
          url += `&startcoord=${sourceLatLng}`;
        }
      }
      break;
    case 'uber':
      if (fullAddress) {
        url = `${prefixes.uber}?action=setPickup&pickup=my_location&dropoff=${fullAddress}`
      } else {
        url = `${prefixes.uber}?action=setPickup&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}`;

        if (title) {
          url += `&dropoff[nickname]=${encodedTitle}`;
        }

        url += useSourceDestiny
          ? `&pickup[latitude]=${sourceLat}&pickup[longitude]=${sourceLng}`
          : '&pickup=my_location';
      }
      break;
    case 'lyft':
      if (fullAddress) {
        url = `${prefixes.lyft}ridetype?id=lyft&destination[address]=${fullAddress}`;
      } else {
        url = `${prefixes.lyft}ridetype?id=lyft&destination[latitude]=${lat}&destination[longitude]=${lng}`;

        if (useSourceDestiny) {
          url += `&pickup[latitude]=${sourceLat}&pickup[longitude]=${sourceLng}`;
        }
      }
      break;
    case 'transit':
      if (fullAddress) {
        url = `${prefixes.transit}directions?destination=${fullAddress}`;
      } else {
        url = `${prefixes.transit}directions?to=${latlng}`;
      }

      if (useSourceDestiny) {
        url += `&from=${sourceLatLng}`;
      }
      break;
    case 'truckmap':
      if (fullAddress) {
        // Constructed from documentation from https://truckmap.com/solutions/developer
        url = `https://truckmap.com/place/${fullAddress}`;
      } else {
        url = `https://truckmap.com/place/${lat},${lng}`;
  
        if (useSourceDestiny) {
          url = `https://truckmap.com/route/${sourceLat},${sourceLng}/${lat},${lng}`;
        }
      }
      break;
    case 'waze':
      if (fullAddress) {
        url = `${prefixes.waze}?q=${fullAddress}`
      } else {
        url = `${prefixes.waze}?ll=${latlng}&navigate=yes`;
        if (title) {
          url += `&q=${encodedTitle}`;
        }
      }
      break;
    case 'yandex':
      if (fullAddress) {
        url = `${prefixes.yandex}?text=${fullAddress}`;
      } else {
        url = `${prefixes.yandex}build_route_on_map?lat_to=${lat}&lon_to=${lng}`;
  
        if (useSourceDestiny) {
          url += `&lat_from=${sourceLat}&lon_from=${sourceLng}`;
        }
      }
      break;
    case 'moovit':
      if (fullAddress) {
        url = `${prefixes.moovit}?dest_name=${fullAddress}`;
      } else {
        url = `${prefixes.moovit}?dest_lat=${lat}&dest_lon=${lng}`;
  
        if (title) {
          url += `&dest_name=${encodedTitle}`;
        }
  
        if (useSourceDestiny) {
          url += `&orig_lat=${sourceLat}&orig_lon=${sourceLng}`;
        }
      }
      break;
    case 'yandex-taxi':
      if (fullAddress) {
        throw new MapsException(`yandex-taxi does not support passing the fullAddress or has not been implemented yet.`);
      } else {
        url = `${prefixes['yandex-taxi']}route?end-lat=${lat}&end-lon=${lng}&appmetrica_tracking_id=1178268795219780156`;
      }

      break;
    case 'yandex-maps':
      if (fullAddress) {
        url = `${prefixes['yandex-maps']}?text=${fullAddress}`;
      } else {
        url = `${prefixes['yandex-maps']}?pt=${lng},${lat}`;
      }

      break;
    case 'kakaomap':
      if (fullAddress) {
        url = `${prefixes.kakaomap}route?ep=${fullAddress}`;
      } else {
        url = `${prefixes.kakaomap}look?p=${latlng}`;
  
        if (useSourceDestiny) {
          url = `${prefixes.kakaomap}route?sp=${sourceLat},${sourceLng}&ep=${latlng}&by=CAR`;
        }
      }

      break;
    case 'tmap':
      if (fullAddress) {
        url = `${prefixes.tmap}search?name=${fullAddress}`;
      } else {
        url = `${prefixes.tmap}viewmap?x=${lng}&y=${lat}`;
  
        if (useSourceDestiny) {
          url = `${prefixes.tmap}route?startx=${sourceLng}&starty=${sourceLat}&goalx=${lng}&goaly=${lat}`;
        }
      }

      break;
    case 'mapycz':
      if (fullAddress) {
        url = `${prefixes.mapycz}www.mapy.cz/zakladni?q=${fullAddress}`;
      } else {
        url = `${prefixes.mapycz}www.mapy.cz/zakladni?x=${lng}&y=${lat}&source=coor&id=${lng},${lat}`;
      }

      break;
    case 'maps-me':
      if (fullAddress) {
        url = `${prefixes['maps-me']}?q=${fullAddress}`;
      } else {
        url = `${prefixes['maps-me']}route?sll=${sourceLat},${sourceLng}&saddr= &dll=${lat},${lng}&daddr=${title}&type=vehicle`;
      }

      break;
    case 'osmand':
      if (fullAddress) {
        url = `${prefixes.osmand}show_map?addr=${fullAddress}`
      } else {
        url = isIOS
          ? `${prefixes.osmand}?lat=${lat}&lon=${lng}`
          : `${prefixes.osmand}?q=${lat},${lng}`;
      }

      break;
    case 'gett':
      if (fullAddress) {
        throw new MapsException(`gett does not support passing the fullAddress or has not been implemented yet.`);
      } else {
        url = `${prefixes.gett}order?pickup=my_location&dropoff_latitude=${lat}&dropoff_longitude=${lng}`;
      }

      break;
    case 'navermap':
      if (fullAddress) {
        url = `${prefixes.navermap}search?query=${fullAddress}`;
      } else {
        url = `${prefixes.navermap}map?lat=${lat}&lng=${lng}&appname=${options.naverCallerName}`;
  
        if (useSourceDestiny) {
          url = `${prefixes.navermap}route?slat=${sourceLat}&slng=${sourceLng}&dlat=${lat}&dlng=${lng}&appname=${options.naverCallerName}`;
        }
      }

      break;
    case 'dgis':
      if (fullAddress) {
        url = `${prefixes.dgis}?q=${fullAddress}`;
      } else {
        url = `${prefixes.dgis}routeSearch/to/${lng},${lat}/go`;

        if (useSourceDestiny) {
          url = `${prefixes.dgis}routeSearch/to/${lng},${lat}/from/${sourceLng},${sourceLat}/go`;
        }
      }

      break;
    case 'liftago':
      if (fullAddress) {
        throw new MapsException(`liftago does not support passing the fullAddress or has not been implemented yet.`);
      } else {
        url = `${prefixes.liftago}order?destinationLat=${lat}&destinationLon=${lng}`;

        if (title) {
          url += `&destinationName=${encodedTitle}`;
        }

        if (useSourceDestiny) {
          url += `&pickupLat=${sourceLat}&pickupLon=${sourceLng}`;
        }
      }

      break;
    case 'petalmaps':
      if (fullAddress) {
        // Got this from this documentation https://developer.huawei.com/consumer/en/doc/HMSCore-Guides/petal-maps-introduction-0000001059189679
        url = `${prefixes.petalmaps}textSearch?text=${fullAddress}`;
      } else {
        url = `${prefixes.petalmaps}navigation?daddr=${lat},${lng}`;
  
        if (useSourceDestiny) {
          url += `&saddr=${sourceLat},${sourceLng}`;
        }
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
