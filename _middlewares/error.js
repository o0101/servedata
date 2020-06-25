import {DEBUG} from '../common.js';
import {Log,HTML_ERROR, JSON_ERROR} from '../helpers.js';
import {ErrorView} from '../_views/error.js';

  export async function catchError(err, req, res, next) {
    try {
      const nativeError = err instanceof Error;
      if ( Array.isArray(err) ) {
        err = err.join('\n');
      }
      let stack, msg, status
      if ( ! err ) {
        msg = 'Unknown error';
        status = 500;
        stack = (new Error('Unknown error')).stack.split(/\s*\n\s*/g);
      } else if ( nativeError ) {
        stack = err.stack.split(/\s*\n\s*/g);
        msg = err.message;
        status = 500;
      } else {
        if ( typeof err == "string" ) {
          msg = err;
        } else {
          msg = err.error || err.reason;
        }
        status = err.status || 500;
        stack = (new Error('Request Error')).stack.split(/\s*\n\s*/g);
      }
      if ( DEBUG.INFO ) {
        const Err = {
          status,
          stack,
          msg,
          path: req.path,
          ip: {
            rip: req.ip,
            rips: req.ips,
            rcra: req.connection.remoteAddress,
            rxff: req.headers['x-forwarded-for'],
            rxrip: req.headers['x-real-ip']
          }
        };
        Log(Err, DEBUG.CONSOLE_ERROR);
      }
      if ( req.path.startsWith('/form') ) {
        res.type('html');
        res.status(status);
        res.end(await ErrorView({error:msg}));
      } else if ( req.path.startsWith('/json') ) {
        res.type('json');
        res.status(status);
        res.end(JSON_ERROR(msg));
      } else {
        res.type('text');
        res.status(status);
        res.end("Error " + msg);
      }
    } catch(e) {
      console.log(`Error in catchError event handler function`, e);
    }
  }

