const APP_PREFIX = 'Budgie-';
const CACHE_NAME = 'Budgie-version_1';


const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "./js/idb.js"
]

self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
      caches.match(e.request).then(function (request) {// check if the resrouces already exists in caches
        if (request) { // if cache is available respond with cacge, meaning we don't have to make a server request to get content identical to our cache
          console.log('responding with cache : ' + e.request.url)
          return request
        } else {       // if there are no cache, allow the resource to be fetched from onine as usual
          console.log('file is not cached, fetching : ' + e.request.url)
          return fetch(e.request)
        }
  
        // You can omit if/else for console.log & put one line below like this too.
        // return request || fetch(e.request)
      })
    )
  })
  
  // we use self. instead of windows. because service workers run before the windows object is created
  self.addEventListener('install', function (e) {
    e.waitUntil(// tell browser wait until work is funished before terminating the service worker
      caches.open(CACHE_NAME).then(function (cache) {// use caches.open to find a specific cache by name
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)// and files to cache
      })
    )
  })
  
  // Delete outdated caches
  self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(function (keyList) {
        // `keyList` contains all cache names under your username.github.io
        // filter out ones that has this app prefix to create keeplist
        let cacheKeeplist = keyList.filter(function (key) {
          return key.indexOf(APP_PREFIX);
        })
        // add current cache name to keeplist
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log('deleting cache : ' + keyList[i] );
            return caches.delete(keyList[i]);
          }
        }));
      })
    );
  });