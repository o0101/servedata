import path from 'path';
import fs from 'fs';

import {servedata, initializeDB} from './index.js';

start();

async function start() {
  await initializeDB();
  const goSecure = fs.existsSync(path.resolve(__dirname, 'sslcerts', 'privkey.pem'));
  servedata({dev_console:true, secure: goSecure});
}
