import { device, expect, element, by } from 'detox';

describe('Landing & Auth Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show landing screen and navigate to login', async () => {
    // Assuming standard text exists on LandingScreen
    await expect(element(by.text('Sign In'))).toBeVisible();
    await element(by.text('Sign In')).tap();
    await expect(element(by.type('TextInput'))).toExist();
  });
});
