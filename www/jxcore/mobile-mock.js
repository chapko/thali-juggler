var notImplemented = function () {
  console.error('not implemented');
};

var Mobile = function (name) {
  return {
    registerSync: notImplemented,
    registerAsync: notImplemented,
    registerToNative: notImplemented,
    call: notImplemented,
  };
};

Mobile.getDocumentsPath = function (cb) {
  process.nextTick(function () {
    cb(null, '/tmp');
  });
};
