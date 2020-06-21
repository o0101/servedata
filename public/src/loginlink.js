import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {Header} from './profile.js';

export function init() {
  LoginLink(self.loadData);
  initializeDSS({}, stylists);
}

function LoginLink({state}) {
  const {_id} = state;

  return w`
    article,
      :comp ${Header}.
      form ${{
        method:'POST',
        action: '/form/action/loginwithlink/redir/profile',
        stylist: 'form'
      }},
        fieldset,
          legend :text ${"Login from Link"}.
          input ${{type:'hidden', name:'id', value:_id}}.
          p button :text ${"Login"}.
          hr.
          small ${"Not working as expected? "}, 
            a ${{href:'mailto:cris@dosycorp.com'}} :text ${"Contact us for help."}.
          .
        .
      .
  `(
    document.body
  );
}

