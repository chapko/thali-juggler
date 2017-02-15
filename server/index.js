const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const archiver = require('archiver');

const outputFile = '/tmp/archive.zip';

function generateArchive(directory, cb) {
  var out = fs.createWriteStream(outputFile);

  var archive = archiver('zip');
  console.log('Archiving %s directory to %s', directory, outputFile);
  archive.glob('**/*', {
    cwd: directory,
    root: directory
  });
  archive.finalize();
  archive.pipe(out);

  archive.on('error', cb);
  out.on('error', cb);
  out.on('finish', () => {
    var stat = fs.statSync(outputFile);
    console.log('Archive created: %s (%d bytes)', outputFile, stat.size);
    cb(null, outputFile, stat.size);
  });
}

function validateDir(directory) {
  const stat = fs.statSync(directory);
  if (!stat.isDirectory()) {
    throw new Error('Not a directory: ' + directory);
  }
  if (!path.isAbsolute(directory)) {
    throw new Error('Directory is not an absolute path: ' + directory);
  }
}

function run (directory, port) {
  var archiveFile;
  var archiveSize;

  validateDir(directory);

  var server = http.createServer((req, res) => {
    var parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/' && parsedUrl.query.download) {
      console.log('Sending archive');
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename=archive.zip');
      res.setHeader('Content-Transfer-Encoding', 'binary');
      res.setHeader('Content-Length', archiveSize);
      fs.createReadStream(archiveFile).pipe(res);
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.end(`<a href="?download=1">Download archive</a>`);
    }
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  generateArchive(directory, (err, file, size) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    archiveFile = file;
    archiveSize = size;
    server.listen(port, () => {
      console.log('Listening on %d port', port);
    });
  });
}

module.exports.run = run;
