const fs = require('fs');
const path = require('path');
require('dotenv').config();

const targetPath = path.join(__dirname, '../src/environments/environment.ts');

const envConfigFile = `export const environment = {
  production: true,
  gatewayUrl: '${process.env.GATEWAY_URL || 'http://16.192.39.156:8080/api/v1'}',
  googleClientId: '${process.env.GOOGLE_CLIENT_ID || ''}',
  googleRedirectUri: '${process.env.GOOGLE_REDIRECT_URI || ''}',
  paypalClientId: '${process.env.PAYPAL_CLIENT_ID || ''}',
  paypalEnv: '${process.env.PAYPAL_ENV || 'production'}'
};
`;

fs.writeFile(targetPath, envConfigFile, (err) => {
  if (err) {
    console.error('Error writing environment file:', err);
    process.exit(1);
  }

  console.log(`Environment variables injected into ${targetPath}`);
});
