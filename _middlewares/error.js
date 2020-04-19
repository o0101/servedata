import {DEBUG} from '../common.js';
import {Log,HTML_ERROR, JSON_ERROR} from '../helpers.js';

  export function catchError(err, req, res, next) {
    const errExists = !! err;
    const stack = errExists ? err.stack || '' : '';
    const msg = errExists ? err.message || '' : '';
    const Err = {
      err,
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
    if ( req.path.startsWith('/form') ) {
      res.type('html');
      res.end(HTML_ERROR(msg));
    } else if ( req.path.startsWith('/json') ) {
      res.type('json');
      res.end(JSON_ERROR(msg));
    } else {
      res.type('text');
      res.end("Error " + msg);
    }
  }

