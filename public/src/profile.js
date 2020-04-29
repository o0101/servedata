import {w} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';

const _ = null;
const $ = '';

export function init() {
  initializeDSS({}, stylists);
  Profile(self.loadData);
}

export function Header() {
  return w`
    header ${_} ${"header"}, 
      nav ul ${_} ${"responsiveList"},
        li a ${{href:'/', class:'brand-link'}}  :text ${"Dosyago"}  .
      .
    .

  `
}

export function Profile({username, email, _id}) {
  initializeDSS({}, stylists);
  return w`
    main ${_} ${"profileGrid"},
      header ${_} ${"header"}, 
        nav ul ${_} ${"responsiveList"},
          li a ${{href:'#', class:'brand-link'}}  :text ${"Dosyago"}  .
          li button ${{form:'logout', class:'button-like'}} :text ${"Logout"}.
        .
      .
      section ${{class:'vertical-tabs'}} ${"verticalTabs"},
        ul,
          li a ${{href:'#profile'}} :text ${`My Profile`}.
          li a ${{href:'#account'}}:text  ${`Dosyago account`}.
          li a ${{href:'#billing'}} :text ${`Billing account`}.
          li a ${{href:'#subscriptions'}} :text ${`Subscriptions`}.
          li a ${{href:'#onetimepayments'}} :text ${`One-time payments`}.
          li a ${{href:'#usage'}} :text ${`Usage`}.
          li a ${{href:'#freecredits'}} :text ${`Free credits`}.
        .
      .
      section ${{class:'content'}} ${"profileContent"},
        article ${{class:'profile'}},
          h1 ${`My profile`}.
          hr.
          form ${{
              class: 'full-width' 
            }} ${'form'},
            p label ${"Email"} input ${fields.email}.
            p label ${"Username"} input ${fields.username}.
            p label ${"Save changes"} button ${"Save"}.
          .
        .
      .
      form ${{
        hidden:true,
        id: 'logout',
        method: 'POST',
        action: `/form/action/logout/redir/app`,
      }},
        input ${{
          type:'hidden', 
          name:'state',
          value:'logged-out'
        }}.
      .
  `(
    document.body
  );
}

