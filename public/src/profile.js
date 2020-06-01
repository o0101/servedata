import {w, clone} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';

const _ = null;
const $ = '';
const State = {};


export function init() {
  Object.assign(State, clone(self.loadData));
  initializeDSS({}, stylists);
  Profile(State)(document.body);
  self.addEventListener('hashchange', () => Profile(State));
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
  return w`${true}
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
        :comp ${ActiveContent}.
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
  `;
}

function Purchases() {
  return w`
    article,
      h1 ${"Credits & Subscriptions"}.
      hr.
      form,
        p label :text ${"Purchase option"}. select,
          option ${{value:"Group Subscription"}} :text ${"Group Subscription"}.
          option ${{value:"Group Subscription"}} :text ${"1000 Credit Pack"}.
        .
        p button ${"Buy Now"}.
      .
    .
  `;
}

function Default() {
  return w`
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
  `
}

function ActiveContent() {
  const hash = window.location.hash.slice(1);
  let view = Default;
  switch(hash) {
    case "billing":
    case "onetimepayments":
    case "subscriptions":
    case "usage":
    case "freecredits":
      view = Purchases;
      break;
    default: 
      view = Default;
      break;
  }
  return view();
}

