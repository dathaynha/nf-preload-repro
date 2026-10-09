import { initFederation } from '@angular-architects/native-federation';

// Native import maps (shimMode: false), matching esmsInitOptions in angular.json.
initFederation('federation.manifest.json', {
  hostRemoteEntry: { url: './remoteEntry.json' },
  shimMode: false,
})
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
