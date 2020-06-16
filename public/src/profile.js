import {w, clone} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {hiddenInput, auth_fields as fields} from './fields.js';

const _ = null;
const $ = '';
const State = {};


export function init() {
  const {state} = self.loadData;
  Object.assign(State, clone(state));
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
  const state = {username, email, _id};
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
        :comp ${state} ${ActiveContent}.
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

function Account(state) {
  return w`
    article,
      h1 ${`My Dosyago Account`}.
      hr.
      dl,
        dt ${"Username"}.
        dd ${state.username}.
        dt ${"Email"}.
        dd ${state.email}.
      .
      section ${{class:'shrink-fit'}},
        form ${{
          class:'v-gapped full-width',
          method: 'POST',
          action: `/form/table/users/${state._id}/with/profile`
        }} ${'form'},
          fieldset,
            legend ${"Change email"}.
            p label ${"Email"} input ${fields.email}.
            p label button ${"Update"}.
          .
        .
        form ${{
            class:'v-gapped full-width',
            method: 'POST',
            action: `/form/table/users/${state._id}/with/profile`
          }} ${'form'},
          fieldset,
            legend ${"Change username"}.
            :comp ${{name:'_id', value:state._id}} ${hiddenInput}.
            p label ${"Username"} input ${fields.username}.
            p label button ${"Update"}.
          .
        .
        form ${{class:'v-gapped full-width'}} ${'form'},
          fieldset,
            legend ${"Change password"}.
            p label ${"Password"} input ${fields.password}.
            p label button ${"Update"}.
          .
        .
      .
    .
  `
}

function BillingAccount() {
  return w`
    article,
      h1 ${"Billing Account"}.
      hr.
      b ${"Credit balance "}.
      span ${"100 credits"}.
    .
  `;
}

function Usage() {
  return w`
    article,
      h1 ${"Usage"}.
      hr.
      b ${"Credits used "}.
      span ${"50 credits"}.
    .
  `;
}

function Purchases() {
  return w`
    article,
      h1 ${"Credits & Subscriptions"}.
      hr.
      section ${{class:'shrink-fit'}},
        form ${{class:'full-width'}} ${'form'},
          fieldset,
            legend ${"Select purchase"}.
            p label ${{innerText:"Purchase option "}} select,
              option ${{value:"Group Subscription"}} :text ${"Group Subscription"}.
              option ${{value:"Group Subscription"}} :text ${"1000 Credit Pack"}.
            .
            p button ${"Buy Now"}.
          .
        .
      .
    .
  `;
}

function FreeCredits() {
  return w`
    article,
      h1 ${"Free Credits"}.
      hr.
      section ${{class:'shrink-fit'}},
        form ${{class:'full-width'}} ${'form'},
          fieldset,
            legend ${"Add free credits"}.
            p label ${{innerText:"Coupon or Token"}} input.
            p button ${"Redeem"}.
          .
        .
      .
    .
  `;
}

function Default() {
  return w`
    article ${{class:'profile'}},
      h1 ${`My profile`}.
      hr.
      dl,
        dt ${"Active Purchases"}.
        dd ${"Some Credit Pack"}.
        dd ${"Some Subscription"}.
      .
      dl,
        dt ${"Current Balance"}.
        dd ${"50 Credits."}.
      .
      dl,
        dt ${"Services Uses"}.
        dd ${"RemoteView"}.
        dd ${"22120"}.
      .
    .
  `
}

function ActiveContent(state) {
  const hash = window.location.hash.slice(1);
  let view = Default;
  switch(hash) {
    case "billing":
      view = BillingAccount;
      break;
    case "usage":
      view = Usage;
      break;
    case "freecredits":
      view = FreeCredits;
      break;
    case "onetimepayments":
    case "subscriptions":
      view = Purchases;
      break;
    case "account":
      view = Account;
      break;
    default: 
      view = Default;
      break;
  }
  return view(state);
}

