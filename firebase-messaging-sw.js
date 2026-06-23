/* StudyLog 푸시용 서비스워커 (메시징 전용 - 캐싱 안 함) */
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
// notification payload는 FCM SDK가 백그라운드에서 자동 표시함(iOS/Android 공통).
// onBackgroundMessage로 직접 showNotification 하면 중복되므로 두지 않는다.
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for (var i=0;i<list.length;i++){ if('focus' in list[i]) return list[i].focus(); }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
