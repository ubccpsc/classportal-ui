let dotenv = require('dotenv');
let env = process.env.NODE_ENV || 'development';
let _config = dotenv.config().parsed;

let config = {
	sslCertPath: _config.SSL_CERT_PATH,
	sslKeyPath: _config.SSL_KEY_PATH,
	sslIntCert: _config.SSL_INT_CERT,
	backendUrl: 'https://localhost:5000',
	staticHtmlPath: _config.STATIC_HTML_PATH,
}

// alternative settings for production environment
if (env === 'production') {
	config.backendApi = _config.PROD_BACKEND_URL;
	config.frontendUrl = _config.PROD_FRONTEND_URL;
	config.staticHtmlPath = _config.STATIC_HTML_PATH;
}

module.exports = config;