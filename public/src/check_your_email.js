import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {Header} from './profile.js';

export function init() {
  CheckYourEmail();
  initializeDSS({}, stylists);
}

function CheckYourEmail() {
  return w`
    article,
      :comp ${Header}.
      aside ${{class:'notification', stylist:'toast'}},
        h1 ${"Email is on its way!"}.
        p,
          :text ${'If you like, you can '}.
          a ${{href: `mailto:?subject=Check%20Your%20Inbox`, target: '_blank'}} :text ${`check your mail`}.
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

