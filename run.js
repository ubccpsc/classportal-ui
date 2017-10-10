const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');
config = require('./.env');

// configure express app
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.static('public'));
app.get('*', function(req, res) {
  res.sendFile(path.resolve(__dirname, './index.html'));
});

let sslCert = fs.readFileSync(config.sslCertPath, 'utf8');
let sslKey = fs.readFileSync(config.sslKeyPath, 'utf8');
let sslIntCert = fs.readFileSync(config.sslIntCert, 'utf8');
console.log('localHost', config.localHost);
console.log('apiAddress', config.apiAddress);
console.log('appPath', config.appPath);

// create server SSL credentials
let options = { cert: sslCert, key: sslKey, ca: sslIntCert };

// config http --> https redirect
let redirectApp = new express();
redirectApp.get('*', function(req, res) {
  res.redirect('https://' + req.hostname + req.url);
});

// create servers
let httpServer = http.createServer(redirectApp);
let httpsServer = https.createServer(options, app);

// start servers
httpServer.listen(80, function(err) {
  if (err) { console.log('Error: ' + err)}
  console.log('Started server in production mode on 80 for redirects to 443');
});

httpsServer.listen(443, function(err) {
  if (err) { console.log('Error: ' + err)}
  console.log('Started server in production mode on 443');
});
