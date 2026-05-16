// キャッシュ（宝箱）の名前
const CACHE_NAME = 'wasuremono-cache-v3';
// オフラインでも使えるように保存しておくファイルのリスト
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script2.js',
  './icon.svg',
  './tailwindcss.js',
  './react.js',
  './react-dom.js',
  './lucide.js'
];

// 1. インストール（ロボットの準備）
self.addEventListener('install', (event) => {
  self.skipWaiting(); // すぐに新しいロボットに切り替える魔法
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('ロボット：ファイルを宝箱に保存したよ！');
      return cache.addAll(urlsToCache);
    })
  );
});

// 新しいロボットがすぐに働き始める魔法
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 2. フェッチ（通信のお手伝い）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // まずはインターネットから最新のファイルを取りに行く（Network First）
    fetch(event.request)
      .catch(() => {
        // インターネットがない時は宝箱から取り出す
        return caches.match(event.request);
      })
  );
});
