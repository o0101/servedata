import {w} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';
import {Header} from './profile.js';

const _ = null;
const $ = '';
const message = `subject=Send%20yourself%20this%20mail&body=Then...go%to%that%email%20%to%20get%20your%20login%20%link.`;

export function init() {
  CheckYourEmail(self.loadData);
  initializeDSS({}, stylists);
}

function CheckYourEmail({state}) {
  return w`
    article,
      :comp ${Header}.
      aside ${{class:'notification', stylist:'toast'}},
        h1 ${"Email is on its way!"}.
        p,
          :text ${'If you like, you can '}.
          a ${{href: `mailto:${state.email}?${message}`, target: '_blank'}} :text ${`check your mail`}.
          :text ${` for the link to login.`}.
        .
        hr.
        small ${"Didn't get the email? "}, 
          a ${{href:'/email-login.html'}} :text ${"Try sending again."}.
        .
      .
  `(
    document.body
  );
}

