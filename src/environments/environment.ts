// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  instagram_token: 'INSTA_TOKEN',
  stripe_token: 'STRIPE_TOKEN',
  paypal_token: 'access_token$sandbox$j48xvs54f2h7g7zc$8212271a3525a5b12c52f28faf021a6e',
  //baseUrl: 'https://api.ralbatech.com/api/v1/',
  baseUrl: 'http://localhost:5000/api/v1/',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
