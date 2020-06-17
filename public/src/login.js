import {w} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';
import {Header} from './profile.js';

const _ = null;
const $ = '';

export function init() {
  Login();
  initializeDSS({}, stylists);
}

function Login(state) {
  if ( location.pathname.startsWith('/email-login') ) {
    return w`
      article,
        :comp ${Header}.
        form ${{
          method:'POST',
          action:'/form/action/sendloginemail/with/check_your_email',
          stylist: 'form'
        }},
          fieldset,
            legend :text ${"Login with Email"}.
            p label ${"Username"} input ${fields.username}.
            p button :text ${"Get Login Email"}.
            hr.
            small ${"Can't access email? "}, 
              a ${{href:'mailto:cris@dosycorp.com'}} :text ${"Contact us to start account verification."}.
            .
          .
        .
    `(
      document.body
    );
  } else if ( location.pathname.startsWith('/link-login') ) {
    const loginId = location.search.split('&')[0].replace('?loginId=', '');
    return w`
      article,
        :comp ${Header}.
        form ${{
          method:'POST',
          action:'/form/action/loginwithlink/redir/profile',
          stylist: 'form'
        }},
          fieldset,
            legend :text ${"Login from Link"}.
            input ${{type:'hidden', name:'loginLinkId', value:loginId}}.
            p button :text ${"Login Now"}.
            hr.
            small ${"Link not working? "}, 
              a ${{href:'/email-login.html'}} :text ${"Request another"}.
              :text ${" or "}.
              a ${{href:'mailto:cris@dosycorp.com'}} :text ${"Contact us for support."}.
            .
          .
        .
    `(
      document.body
    );
  } else {
    return w`
      article,
        :comp ${Header}. 
        form ${{
          method:'POST',
          action:'/form/action/login/redir/profile',
          stylist: 'form'
        }},
          fieldset,
            legend :text ${"Login"}.
            p label ${"Username"} input ${fields.username}.
            p label ${"Password"} input ${fields.password}.
            p button :text ${"Login"}.
            hr.
            p small ${"Forget a password? "}, 
              a ${{href:'/email-login.html'}} :text ${"Login with email instead."}.
            .
            p small ${"Don't have an account? "}, 
              a ${{href:'/signup.html'}} :text ${"Sign Up here."}.
            .
          .
      .
    `(
      document.body
    );
  }
}

