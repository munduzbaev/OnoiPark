import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onoipark.app',
  appName: 'OnoiPark',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
};

export default config;

