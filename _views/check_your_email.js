import {DEBUG} from '../common.js';
import {ErrorView} from './error.js';

export default function CheckYourEmail({email, _id, error}) {
  const state = {email,_id, error};

  if ( error ) {
    return ErrorView({error});
  } else {
    return `
      <html lang=en stylist="aux_page">
        <meta charset=utf-8>
        <meta name=viewport content="width=device-width, initial-scale=1">
        <title>Dosyago</title>
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
