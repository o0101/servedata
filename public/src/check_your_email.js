import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {Header} from './profile.js';

export function init({state}) {
  const {username, email} = state;
  CheckYourEmail({username, email});
  initializeDSS({}, stylists);
}

function CheckYourEmail({username, email}) {
  let emailProviderUrl;
  if ( email ) {
    const emailUrl = new URL(`https://${email}`);
    emailUrl.username = '';
    emailProviderUrl = emailUrl + '';
  }

  return w`
    article,
      :comp ${Header}.
      aside ${{class:'notification', stylist:'toast'}},
        h1 ${`Hey ${username}, your login email is on its way!`}.
        :comp ${CheckPrompt({emailProviderUrl})}.
        hr.
        small ${"Didn't get the email? "}, 
          a ${{href:'/form/selection/email-login'}} :text ${"Try sending again."}.
        .
      .
  `(
    document.body
  );
}

function CheckPrompt({emailProviderUrl}) {
  if ( emailProviderUrl ) {
    return w`
        p,
          :text ${'If you like, you can '}.
          a ${{href: emailProviderUrl, target: '_blank'}} :text ${`check your mail`}.
          :text ${` for the link to login.`}.
        .
    `;
  } else {
    return w`
        p ${`Check your email for the link to login.`}.
    `;

  }
}

