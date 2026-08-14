/* StudyLog 서비스워커 — 푸시 알림 + 오프라인 캐시(앱 설치) */
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey:"AIzaSyBjlWA9GHPvL4sGEdOShwyaCnPDuLgIcPA",
  authDomain:"studylog-cd02a.firebaseapp.com",
  databaseURL:"https://studylog-cd02a-default-rtdb.firebaseio.com",
  projectId:"studylog-cd02a",
  storageBucket:"studylog-cd02a.firebasestorage.app",
  messagingSenderId:"714212261002",
  appId:"1:714212261002:web:075c8c992ba986b5a9c173"
});
var messaging = firebase.messaging();
messaging.onBackgroundMessage(function(payload){
  var d = payload.data || payload.notification || {};
  self.registration.showNotification(d.title || '📚 studyLog', {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: (d.url || './') }
  });
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for (var i=0;i<list.length;i++){ if('focus' in list[i]) return list[i].focus(); }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});

/* ── 오프라인 캐시 ────────────────────────────────────────────
   네트워크 우선. 항상 최신 코드를 받고, 인터넷이 끊겼을 때만 캐시로 연다. */
var CACHE = 'studylog-v1';
var SHELL = ['./', './index.html', './manifest.json',
             './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
    .catch(function(){}).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(new URL(req.url).origin !== location.origin) return;   /* Firebase 등 외부는 손대지 않음 */
  e.respondWith(
    fetch(req).then(function(res){
      var cp = res.clone();
      caches.open(CACHE).then(function(c){ c.put(req, cp); });
      return res;
    }).catch(function(){
      return caches.match(req).then(function(r){ return r || caches.match('./index.html'); });
    })
  );
});
