const express = require('express');
let config = require('./config');

let sslCert = fs.readFileSync(config.sslCertPath, 'utf8');
let sslKey = fs.readFileSync(config.sslKeyPath, 'utf8');
let sslIntCert = fs.readFileSync(config.sslIntCert, 'utf8');

	// start servers
	httpServer.listen(80, function(err) {
	  if (err) { console.log('Error: ' + err)}
	  console.log('Started server in production mode on 80 for redirects to 443');
	});

	httpsServer.listen(443, function(err) {
	  if (err) { console.log('Error: ' + err)}
	  console.log('Started server in production mode on 443');
	});
