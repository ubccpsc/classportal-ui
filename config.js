let dotenv = require('dotenv');
let env = process.env.NODE_ENV || 'development';
let _config = dotenv.config().parsed;

let config = {
	sslCertPath: _config.SSL_CERT_PATH,
	sslKeyPath: _config.SSL_KEY_PATH,
	sslIntCert: _config.SSL_INT_CERT,
}

// alternative settings for production environment
if (env === 'production') {
//
}

module.exports = config;