import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';
import {Header} from './profile.js';
import {haveNotReloaded, tryReload} from './session_helpers.js';

export function init({state: state = {}} = {}) {
  Signup(state);
  initializeDSS({}, stylists);
}

function Signup(state) {
  const session = state.authorization && state.authorization.session;
  const loggedIn = session && session.userid && session.userid != 'nouser';
  let userid;
  if ( loggedIn ) {
    ({userid} = session);
    location.pathname = `/form/selection/profile/${userid}`;
  } else {
    if ( haveNotReloaded() ) {
      tryReload();
    } else {
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
              p label, span ${"Username"}. input ${fields.username}..
              p label, span ${"Email"}. input ${fields.email}..
              p label, span ${"Email again"}. input ${fields.email2}..
              p label, span ${"Password"}. input ${fields.password}..
              p button ${"Sign Up"}.
              hr.
              p small ${"Already have an account? "}, 
                a ${{href:'/form/selection/login'}} :text ${"Login instead."}.
              .
            .
        .
      `(
        document.body
      );
    }
  }
}

