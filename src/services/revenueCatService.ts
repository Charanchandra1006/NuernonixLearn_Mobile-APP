import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
  apple: 'appl_YOUR_REVENUECAT_APPLE_KEY',
  google: 'goog_YOUR_REVENUECAT_GOOGLE_KEY',
};

export const initRevenueCat = async (userId?: string) => {
  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    if (Platform.OS === 'ios') {
      Purchases.configure({ apiKey: API_KEYS.apple, appUserID: userId });
    } else if (Platform.OS === 'android') {
      Purchases.configure({ apiKey: API_KEYS.google, appUserID: userId });
    }
  } catch (e) {
    console.error('Error initializing RevenueCat', e);
  }
};

export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
      return offerings.current.availablePackages;
    }
    return [];
  } catch (e) {
    console.error('Error getting offerings', e);
    return [];
  }
};

export const purchasePackage = async (pack: any) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pack);
    if (typeof customerInfo.entitlements.active['Premium'] !== 'undefined') {
      return true;
    }
    return false;
  } catch (e: any) {
    if (!e.userCancelled) {
      console.error('Error purchasing package', e);
    }
    return false;
  }
};

export const checkSubscription = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return typeof customerInfo.entitlements.active['Premium'] !== 'undefined';
  } catch (e) {
    return false;
  }
};
