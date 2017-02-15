var fs = require('fs');
var http = require('http');
var path = require('path');

if (!global.Mobile) {
  global.Mobile = require('./mobile-mock');
}
var Mobile = global.Mobile;

var unzip = require('extract-zip');
var mkdirp = require('mkdirp');

var tempdir = null;
var extractdir = null;

function createDirs(cb) {
  if (tempdir && extractdir) {
    return cb(null);
  }
  Mobile.getDocumentsPath(function (err, docspath) {
    if (err) { return cb(err); }
    if (tempdir && extractdir) { return cb(null); }
    console.log('Documents path:', docspath);
    tempdir = path.join(docspath, 'thali-temp');
    extractdir = path.join(docspath, 'thali-extract');
    console.log('Temp Dir: %s\nExtract Dir: %s', tempdir, extractdir);
    mkdirp.sync(tempdir);
    mkdirp.sync(extractdir);
    cb(null);
  });
}

function download (url, cb) {
  var filename = 'archive-' + Date.now() + '.zip';
  var filepath = path.join(tempdir, filename);
  var out = fs.createWriteStream(filepath);
  var request = http.get(url, function (response) {
    response.pipe(out);
    response.on('error', cb);
    response.on('end', function () {
      cb(null, filepath);
    });
  });

  request.on('error', cb);
}

function extract (archive, directory, cb) {
  unzip(archive, { dir: directory }, function (err) {
    if (err) {
      return cb(err);
    }
    cb(null, directory);
  });
}

function getMetaData (directory) {

}

function run (url) {
  function onError(err) {
      console.error(err);
      process.exit(1);
  }

  function onDl(archivePath) {
    console.log('downloaded %s', archivePath);
    console.log('extracting %s into %s', archivePath, extractdir);
    extract(archivePath, extractdir, function (err) {
      if (err) { return onError(err); }
      onExtract(extractdir);
    });
  }

  function onExtract(dir) {
    console.log('extracted %s', dir);
    require(dir);
  }

  createDirs(function (err) {
    if (err) { return onError(err); }
    console.log('downloading %s', url);
    download(url, function (err, archivePath) {
      if (err) { return onError(err); }
      onDl(archivePath);
    });
  });
}

Mobile('run').registerSync(function (url) {
  run(url);
});

module.exports.run = run;
