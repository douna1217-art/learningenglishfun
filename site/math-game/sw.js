/* Times Table Monster Island used to be an installable offline app with its own cache.
   It is now a normal page of the English site, so this worker only cleans up:
   it deletes the old cache, unregisters itself and reloads open copies of the game. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("math-game-") === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.registration.unregister(); })
    .then(function () { return self.clients.matchAll({ type: "window" }); })
    .then(function (cs) { cs.forEach(function (c) { c.navigate(c.url); }); }));
});
