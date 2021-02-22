import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';
import {Header} from './profile.js';
import {haveNotReloaded, tryReload} from './session_helpers.js';

export function init({state: state = {}} = {}) {
  Login(state);
  initializeDSS({}, stylists);
}

function Login(state) {
  const session = state.authorization && state.authorization.session;
  const loggedIn = session && session.userid && session.userid != 'nouser';
  let userid;
  console.log(state, loggedIn);
  if ( loggedIn ) {
    ({userid} = session);
    location.pathname = `/form/selection/profile/${userid}`;
  } else {
    if ( haveNotReloaded() ) {
      tryReload();
    } else {
      if ( location.pathname.includes('/email-login') ) {
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
                  a ${{href:'mailto:cris@dosycorp.com?subject=Account%20Verification', target:"_top"}} :text ${"Contact us to start account verification."}.
                .
              .
            .
        `(
          document.body
        );
      } else if ( location.pathname.includes('/link-login') ) {
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
                  a ${{href:'/form/selection/email-login'}} :text ${"Request another"}.
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
                p label, span ${"Username"}. input ${fields.username}..
                p label, span ${"Password"}. input ${fields.password}..
                p button :text ${"Login"}.
                hr.
                p small ${"Forget a password? "}, 
                  a ${{href:'/form/selection/email-login'}} :text ${"Login with email instead."}.
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
  }
}

