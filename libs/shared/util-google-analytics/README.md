# shared-util-google-analytics

This library was generated with [Nx](https://nx.dev).

```
ng g @nx/angular:library util-google-analytics --directory shared --simpleModuleName --tags=scope:shared,type:util
```

This library provides a service to send analytics data to Google. For configuration, a tracking id is required to be sent in the GA_TRACKING_ID injection token.

To access Google Analytics data you will need a Google account tied to our Valvoline Google Analytics account. Once you are logged into this account, navigate to https://analytics.google.com/analytics/. Our data will be under the "VIOC POS" analytics account. The analytics account/property is in the top left to the right of "Analytics 360". There will be a separate "Property" for dev Central, QA Central, and prod Central. The tracking id provided in the environment will determine which property the data gets sent to. You can use the Realtime reports to view current data in near realtime to verify data is flowing.

## Running unit tests

Run `nx test shared-util-google-analytics` to execute the unit tests.
