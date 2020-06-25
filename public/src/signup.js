import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';
import {Header} from './profile.js';

export function init() {
  Signup();
  initializeDSS({}, stylists);
}

function Signup() {
  return w`
    article,
      :comp ${Header}.
      form ${{
        method:'POST',
        action:'/form/action/signup/with/check_your_email',
        stylist: 'form'
      }},
        fieldset,
          legend ${"Sign Up"}.
          p label ${"Username"} input ${fields.username}.
          p label ${"Email"} input ${fields.email}.
          p label ${"Email again"} input ${fields.email2}.
          p label ${"Password"} input ${fields.password}.
          p button ${"Sign Up"}.
        .
      .
  `(
    document.body
  );
}

