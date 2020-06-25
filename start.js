import {servedata, initializeDB} from './index.js';

start();

async function start() {
  await initializeDB();
  servedata({dev_console:true});
}
