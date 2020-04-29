import {w} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';
import {Header} from './profile.js';

const _ = null;
const $ = '';

export function init() {
  initializeDSS({}, stylists);
  CheckYourEmail(self.loadData);
}

function CheckYourEmail(state) {
  let link;
  try {
    link = new URL(`https://${state.email}`);
    link = link.origin;
  } catch(e) {
    link = '';
    console.warn(e);
  }
  return w`
    aside ${{class:'notification', stylist:'toast'}},
      h1 ${"Email is on its way!"}.
      p,
        :text ${'If you like, you can '}.
        a ${{href: link, target: '_blank'}} :text ${`check your mail`}.
        :text ${` (${state.email}) for the link to login.`}.
      hr.
      small ${"Didn't get the email? "}, 
        a ${{href:'/email-login.html'}} :text ${"Try sending again."}.
      .
    .
  `(
    document.body
  );
}

