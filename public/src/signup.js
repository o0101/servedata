import {w} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';

const _ = null;
const $ = '';

initializeDSS({}, stylists);
Signup();

function Signup(state) {
  return w`
    form ${{
      method:'POST',
      action:'/form/action/signup/with/check_your_email',
      stylist: 'form'
    }},
      fieldset,
        legend ${"Signup"}.
        p label ${"Username"} input ${fields.username}.
        p label ${"Email"} input ${fields.email}.
        p label ${"Password"} input ${fields.password}.
        p label ${"Confirm password"} input ${fields.password2}.
        p button ${"Signup"}.
      .
    .
  `(
    document.body
  );
}

