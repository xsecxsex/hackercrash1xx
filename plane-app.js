(function () {
  'use strict';

  // Firebase LION: activation keys and orders.
  var LION_DB_URL = 'https://zoomelbet-bc9fd-default-rtdb.europe-west1.firebasedatabase.app/';
  // Firebase Archive: live game multiplier feed at node "pre".
  var GAME_DB_URL = 'https://zoz8-f2d27-default-rtdb.firebaseio.com';

  var ref = null; // Archive DatabaseReference "pre"
  var lionDb = null;
  var attached = false;

  var btnStart = document.getElementById('linear29');
  var btnAgain = document.getElementById('linear30');
  var valueText = document.getElementById('textview28');

  // The plane page is available only after Firebase validates a plane activation code.
  var auth = null;
  var expiryTimer = null;
  try { auth = JSON.parse(localStorage.getItem('lionPlaneAuth') || 'null'); } catch (e) { auth = null; }
  var loadingOverlay = document.getElementById('loadingOverlay');

  function rejectAccess() {
    localStorage.removeItem('lionPlaneAuth');
    window.location.replace('/');
  }

  function startExpiryGuard() {
    if (expiryTimer) clearInterval(expiryTimer);
    expiryTimer = setInterval(function () {
      if (!auth || !auth.expiry || new Date(auth.expiry) <= new Date()) {
        clearInterval(expiryTimer);
        rejectAccess();
      }
    }, 1000);
  }

  function validatePlaneAccess() {
    if (!auth || !auth.code) return rejectAccess();
    firebase.database().ref('keys/' + auth.code).once('value').then(function (snapshot) {
      var key = snapshot.val();
      if (!key || key.product !== 'plane' || !key.expiry || new Date(key.expiry) <= new Date()) {
        rejectAccess();
        return;
      }
      auth.expiry = key.expiry;
      localStorage.setItem('lionPlaneAuth', JSON.stringify(auth));
      document.body.classList.remove('auth-pending');
      startExpiryGuard();
      attachListener();
    }).catch(rejectAccess);
  }

  // ---------- Firebase listener (ChildEventListener on "pre") ----------
  function attachListener() {
    if (attached || !ref) return;
    attached = true;

    // onChildAdded  ->  on('child_added')
    ref.on('child_added', function (snapshot) {
      var map = snapshot.val();
      if (map && Object.prototype.hasOwnProperty.call(map, 'hipr')) {
        valueText.textContent = '\u00d7' + map.hipr;
      }
    });

    // onChildChanged -> on('child_changed')
    ref.on('child_changed', function (snapshot) {
      var map = snapshot.val();
      if (map && Object.prototype.hasOwnProperty.call(map, 'hipr')) {
        valueText.textContent = '\u00d7' + map.hipr;
      }
    });
  }

  function detachListener() {
    if (!ref || !attached) return;
    ref.off();
    attached = false;
  }

  // ---------- UI helpers ----------

  // Mirrors _Custom_Loading(boolean)
  function setLoading(show) {
    if (show) {
      loadingOverlay.classList.add('show');
    } else {
      loadingOverlay.classList.remove('show');
    }
  }

  // Mirrors _Edit_By_Volt(view, 11.0d): scale 0.95 -> 1.0 over 650ms
  function popAnimation(el) {
    el.classList.remove('pop');
    void el.offsetWidth; // restart animation
    el.classList.add('pop');
  }

  function setButtonsDim(dim) {
    btnStart.style.opacity = dim ? '0.5' : '1';
    btnAgain.style.opacity = dim ? '0.5' : '1';
  }

  // ---------- Button handlers ----------

  // linear29 -> START
  btnStart.addEventListener('click', function () {
    popAnimation(btnStart);
    popAnimation(btnAgain);
    setButtonsDim(true);
    setLoading(true);

    // after 800ms: hide loading
    setTimeout(function () {
      setLoading(false);
    }, 800);

    // after 900ms: restore alpha and re-attach the Firebase listener
    setTimeout(function () {
      setButtonsDim(false);
      detachListener();
      attachListener();
    }, 900);
  });

  // linear30 -> AGAIN
  btnAgain.addEventListener('click', function () {
    popAnimation(btnAgain);
    popAnimation(btnStart);
    setButtonsDim(true);
    setLoading(true);

    // after 600ms: hide loading
    setTimeout(function () {
      setLoading(false);
    }, 600);

    // after 700ms: restore alpha and reset the value text
    setTimeout(function () {
      setButtonsDim(false);
      valueText.textContent = '\u00d70.00';
    }, 700);
  });

  // ---------- Init (initializeLogic + setupVideoBackground + setupRotatingImage) ----------
  // Default app is LION and is used only to validate the activation key.
  firebase.initializeApp({ databaseURL: LION_DB_URL });
  lionDb = firebase.database();
  // Named second app preserves the original Archive game data source.
  var gameApp = firebase.initializeApp({ databaseURL: GAME_DB_URL }, 'archiveGame');
  ref = gameApp.database().ref('pre');
  validatePlaneAccess();
})();
