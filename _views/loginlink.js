import {DEBUG} from '../common.js';
import {ErrorView} from './error.js';

export default function LoginLink({_id, error}) {
  const state = {_id, error};

  if ( error ) {
    return ErrorView({error});
  } else {
    return `
      <html lang=en stylist=aux_page>
        <meta charset=utf-8>
        <meta name=viewport content="width=device-width, initial-scale=1">
        <title>ServeData</title>
        <link rel=stylesheet href=/static/style.css>
        <script src=/src/disable_on_submit.js></script>
        <script type=module>
          import {init} from '/${DEBUG.BUILD}/loginlink.js';

          self.loadData = ${JSON.stringify({state})};

          init();
        </script>
      </html>
    `
  }
}
