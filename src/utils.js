/**
 * React Native Map Link
 */

import {Linking, ActionSheetIOS, Alert} from 'react-native';

import {appKeys, isIOS} from './constants';

/**
 * Get available navigation apps.
 */
export const getAvailableApps = async (prefixes) => {
  const availableApps = [];
  const promises = [];

  for (const app in prefixes) {
    if (prefixes.hasOwnProperty(app)) {
      promises.push(
        new Promise(async (resolve) => {
          try {
            const isInstalled = await isAppInstalled(app, prefixes);

            resolve({
              app,
              isInstalled,
            });
          } catch (error) {
            resolve({
              app,
              isInstalled: false,
            });
          }
        }),
      );
    }
  }

  const results = await Promise.all(promises);
  results.forEach(
    ({isInstalled, app}) => isInstalled && availableApps.push(app),
  );

  return availableApps;
};

/**
 * Check if a given map app is installed.
 *
 * @param {string} app
 * @param {object} prefixes
 * @returns {Promise<boolean>}
 */
export function isAppInstalled(app, prefixes) {
  return new Promise((resolve) => {
    if (!(app in prefixes)) {
      return resolve(false);
    }

    Linking.canOpenURL(prefixes[app])
      .then((result) => {
        resolve(!!result);
      })
      .catch(() => resolve(false));
  });
}

/**
 * Check if a given app is supported by this library
 *
 * @param {string} app
 * @returns {boolean}
 */
function isSupportedApp(app) {
  return appKeys.includes(app);
}

/**
 * Get a list of not supported apps from a given array of apps
 *
 * @param {array} apps
 * @returns {array}
 */
function getNotSupportedApps(apps) {
  return apps.filter((app) => !isSupportedApp(app));
}

/**
 * Throws an exception if some of the given apps is not supported
 *
 * @param {array} apps
 */
export function checkNotSupportedApps(apps) {
  const notSupportedApps = getNotSupportedApps(apps);
  if (notSupportedApps.length) {
    throw new MapsException(
      `appsWhiteList [${notSupportedApps}] are not supported apps, please provide some of the supported apps [${appKeys}]`,
    );
  }
}

/**
 * Ask the user to choose one of the available map apps.
 * @param {{
 *     title: string | undefined | null
 *     message: string | undefined | null
 *     cancelText: string | undefined | null
 *     appsWhiteList: string[] | null
 *     prefixes: string[],
 *     appTitles: object | undefined | null,
 *     tintColor: string | undefined
 * }} options
 * @returns {Promise}
 */
export function askAppChoice({
  dialogTitle,
  dialogMessage,
  cancelText,
  appsWhiteList,
  prefixes,
  appTitles,
  tintColor
}) {
  return new Promise(async (resolve) => {
    let availableApps = await getAvailableApps(prefixes);

    if (appsWhiteList && appsWhiteList.length) {
      availableApps = availableApps.filter((appName) =>
        appsWhiteList.includes(appName),
      );
    }

    if (availableApps.length < 2) {
      return resolve(availableApps[0] || null);
    }

    if (isIOS) {
      const options = availableApps.map((app) => appTitles[app]);
      options.push(cancelText);

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: dialogTitle,
          message: dialogMessage,
          options: options,
          cancelButtonIndex: options.length - 1,
          tintColor
        },
        (buttonIndex) => {
          if (buttonIndex === options.length - 1) {
            return resolve(null);
          }
          return resolve(availableApps[buttonIndex]);
        },
      );

      return;
    }

    const options = availableApps.map((app) => ({
      text: appTitles[app],
      onPress: () => resolve(app),
    }));
    options.unshift({
      text: cancelText,
      onPress: () => resolve(null),
      style: 'cancel',
    });

    return Alert.alert(dialogTitle, dialogMessage, options, {
      cancelable: true,
      onDismiss: () => resolve(null),
    });
  });
}

/**
 * Check if options are valid and well passed
 *
 * @param {{
 *     latitude: number | string,
 *     longitude: number | string,
 *     fromAddress: string | undefined,
 *     toAddress: string | undefined,
 *     sourceLatitude: number | undefined | null,
 *     sourceLongitude: number | undefined | null,
 *     googleForceLatLon: boolean | undefined | null,
 *     googlePlaceId: number | undefined | null,
 *     title: string | undefined | null,
 *     app: string | undefined | null
 *     dialogTitle: string | undefined | null
 *     dialogMessage: string | undefined | null
 *     cancelText: string | undefined | null
 *     naverCallerName: string | undefined
 * }} options
 * @param {object} prefixes
 */
export function checkOptions(options, prefixes) {
  if (!options || typeof options !== 'object') {
    throw new MapsException(
      'First parameter of `showLocation` should contain object with options.',
    );
  }
  if (!('latitude' in options) || !('longitude' in options)) {
    throw new MapsException(
      'First parameter of `showLocation` should contain object with at least keys `latitude` and `longitude`.',
    );
  }
  if (
    'title' in options &&
    options.title &&
    typeof options.title !== 'string'
  ) {
    throw new MapsException('Option `title` should be of type `string`.');
  }
  if (
    'googleForceLatLon' in options &&
    options.googleForceLatLon &&
    typeof options.googleForceLatLon !== 'boolean'
  ) {
    throw new MapsException(
      'Option `googleForceLatLon` should be of type `boolean`.',
    );
  }
  if (
    'googlePlaceId' in options &&
    options.googlePlaceId &&
    typeof options.googlePlaceId !== 'string'
  ) {
    throw new MapsException(
      'Option `googlePlaceId` should be of type `string`.',
    );
  }
  if ('app' in options && options.app && !(options.app in prefixes)) {
    throw new MapsException(
      'Option `app` should be undefined, null, or one of the following: "' +
        Object.keys(prefixes).join('", "') +
        '".',
    );
  }
  if ('appsWhiteList' in options && options.appsWhiteList) {
    checkNotSupportedApps(options.appsWhiteList);
  }
  if (
    'appTitles' in options &&
    options.appTitles &&
    typeof options.appTitles !== 'object'
  ) {
    throw new MapsException('Option `appTitles` should be of type `object`.');
  }
  if ('fromAddress' in options &&  options.fromAddress && typeof options.fromAddress !== 'string') {
    throw new MapsException(
      'Option `fromAddress` should be of type `string`.',
    );
  }

  if ('toAddress' in options &&  options.toAddress && typeof options.toAddress !== 'string') {
    throw new MapsException(
      'Option `toAddress` should be of type `string`.',
    );
  }
}

class MapsException {
  constructor(message) {
    this.message = message;
    this.name = 'MapsException';
  }
}
