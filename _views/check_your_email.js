import {DEBUG} from '../common.js';
import {ErrorView} from './error.js';

export default function CheckYourEmail({username, error}) {
  if ( error ) {
    return ErrorView({error});
  } else {
    const state = {username};
    return `
      <html lang=en stylist="aux_page">
        <meta charset=utf-8>
        <meta name=viewport content="width=device-width, initial-scale=1">
        <title>ServeData</title>
        <link rel=stylesheet href=/static/style.css>
      <script type=module>
        import {init} from '/${DEBUG.BUILD}/check_your_email.js';

        self.loadData = ${JSON.stringify({state})};

        init();
      </script>
      </html>
    `
  }
}
