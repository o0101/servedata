import {w, clone} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {hiddenInput, auth_fields as fields} from './fields.js';

const MODE = 'live';

const PRICE = {
  live: {
    a1: "price_1HcYehBKxtsqOlor2rvYsRY2",
    isoKey: "price_1I4iizBKxtsqOlorSmm9AMBu",
    vf: "price_1HcZ1SBKxtsqOlorJtHNi8qQ",
    m2m_ba_1: "sku_IR4C4lyY3SMmP3"
  },
  test: {
    a1: "price_1HekScBKxtsqOlorUDzYrPhL",
    isoKey: "price_1HekScBKxtsqOlorLemcszTC",
    vf: "price_1HekScBKxtsqOlorLemcszTC",
    m2m_ba_1: "sku_IR4Gpx5yqs7JsH"
  }
};

const _ = null;
const State = {};


export function init() {
  const {state} = self.loadData;
  Object.assign(State, clone(state));

  initializeDSS({}, stylists);
  Profile(State)(document.body);

  self.addEventListener('hashchange', Route);
  self.addEventListener('submit', saveHash);

  restoreSavedHash();
}

function restoreSavedHash() {
  const hashOnSubmit = localStorage.getItem('hash-on-submit');
  if ( hashOnSubmit ) {
    location.hash = hashOnSubmit;
  }
}

function saveHash() {
  const hashOnSubmit = location.hash.slice(1);
  localStorage.setItem('hash-on-submit', hashOnSubmit);
}

function Route() {
  localStorage.removeItem('hash-on-submit');
  ActiveContent(State);
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

export function Profile({newEmail: newEmail = null, username:username = null, email:email = null, _id:_id = null}) {
  const state = {username, newEmail, email, _id};
  return w`${true}
    main ${_} ${"profileGrid"},
      header ${_} ${"header"}, 
        nav ul ${_} ${"responsiveList"},
          li a ${{href:'/', class:'brand-link'}}  :text ${"Dosyago"}  .
          li button ${{form:'logout', class:'button-like'}} :text ${"Logout"}.
        .
      .
      section ${{class:'vertical-tabs'}} ${"verticalTabs"},
        ul,
          li a ${{href:'#profile'}} :text ${`My Apps`}.
          li a ${{href:'#account'}}:text  ${`Dosyago account`}.
          li a ${{href:'#subscriptions'}} :text ${`Purchase`}.
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

function NewEmail(state) {
  if ( state.newEmail ) {
    return w`
      dt ${"New email (unverified)"},
        br.
        small i ${"check your email for link"}.
      .
      dd ${state.newEmail}.
    `;
  } else {
    return w`dt.`;
  }
}

function Account(state) {
  return w`
    article,
      h1 ${`My Dosyago Account`}.
      hr.
      p ${`If you want to continue using ISOlation.SITE you need to get membership from the Purchase tab`}.
      dl,
        dt ${"Username"}.
        dd ${state.username}.
        dt ${"Email"}.
        dd ${state.email}.
        :comp ${state} ${NewEmail}.
      .
      section ${{class:'shrink-fit'}},
        form ${{
          class:'v-gapped full-width',
          method: 'POST',
          action: `/form/action/update_email/redir/profile`
        }} ${'form'},
          fieldset,
            legend ${"Change email"}.
            p label ${"Email"} input ${fields.email}.
            :comp ${{name:'_id', value:state._id}} ${hiddenInput}.
            :comp ${{name:'username', value:state.username}} ${hiddenInput}.
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
            p label ${"Username"} input ${fields.username}.
            p label button ${"Update"}.
          .
        .
        form ${{
            class:'v-gapped full-width',
            method: 'POST',
            action: `/form/action/update_password/redir/profile`
          }} ${'form'},
          fieldset,
            legend ${"Change password"}.
            :comp ${{name:'_id', value:state._id}} ${hiddenInput}.
            :comp ${{name:'username', value:state.username}} ${hiddenInput}.
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
      h1 ${"Products, Keys & Subscriptions"}.
      hr.
      section ${{class:'shrink-fit'}},
        p ${`If you want to continue using ISOlation.SITE (also known as BrowserGap and ViewFinder) you need to get membership below.`}.
        form ${{
            class:'full-width',
            method: 'POST',
            action: '/form/action/pay/with/tocheckout'
          }} ${'form'},
          fieldset,
            legend ${"ISO/BG/VF Monthly Membership"}.
            :comp ${{name:'mode', value:"subscription"}} ${hiddenInput}.
            p label ${{innerText:"Purchase option "}} select ${{name:'price'}},
              option ${{value:PRICE[MODE].isoKey}} :text ${"Monthly Subscription"}.
            .
            p label ${{innerText:"Quantity "}} 
              input ${{required:true, name: 'quantity', type:'number',value:'1',min:'1'}}.
            p button ${{class:'buy special'}} :text ${"Buy Now"}.
            p small ${"This subscription gives you 1185 URL opens in a secure context per month for ISOlation.SITE, or equivalent minutes using BrowserGap / ViewFinder."}.
          .
        .
        form ${{
            class:'full-width',
            method: 'POST',
            action: '/form/action/pay/with/tocheckout'
          }} ${'form'},
          fieldset,
            legend ${"Mail-2-Merge Banner Ad"}.
            :comp ${{name:'mode', value:"payment"}} ${hiddenInput}.
            p label ${{innerText:"Purchase option "}} select ${{name:'price'}},
              option ${{value:PRICE[MODE].m2m_ba_1}} :text ${"Mail-2-Merge Banner Ad"}.
            .
            p label ${{innerText:"Quantity "}} 
              input ${{required:true, name: 'quantity', type:'number',value:'1',min:'1'}}.
            p button ${{class:'buy special'}} :text ${"Buy Now"}.
            p small ${"Your ad will get 1 Month Placement"}.
          .
        .
        form ${{
            class:'full-width',
            method: 'POST',
            action: '/form/action/pay/with/tocheckout'
          }} ${'form'},
          fieldset,
            legend ${"Archivist1 V1 PRO Purchase"}.
            :comp ${{name:'mode', value:"payment"}} ${hiddenInput}.
            p label ${{innerText:"Purchase option "}} select ${{name:'price'}},
              option ${{value:PRICE[MODE].a1}} :text ${"Archivist1 V1 PRO License"}.
            .
            p label ${{innerText:"Quantity "}} 
              input ${{required:true, name: 'quantity', type:'number',value:'1',min:'1'}}.
            p button ${{class:'buy special'}} :text ${"Buy Now"}.
            p small ${"You'll download Archivist1 V1 PRO after your purchase."}.
          .
        .
        form ${{
            class:'full-width',
            method: 'POST',
            action: '/form/action/pay/with/tocheckout'
          }} ${'form'},
          fieldset,
            legend ${"ViewFinder Seat Subscription"}.
            :comp ${{name:'mode', value:"subscription"}} ${hiddenInput}.
            p label ${{innerText:"Purchase option "}} select ${{name:'price'}},
              option ${{value:PRICE[MODE].vf}} :text ${"VF 25 Seat Monthly"}.
            .
            p label ${{innerText:"Quantity "}} 
              input ${{required:true, name: 'quantity', type:'number',value:'1',min:'1'}}.
            p button ${{class:'buy special'}} :text ${"Buy Now"}.
            p small ${"This subscription gives you ViewFinder Managed seats, in packs of 25."}.
          .
        .
      .
    .
  `;
}

function Default() {
  return w`
    article ${{class:'profile'}},
      h1 ${`My Apps`}.
      hr.
      p ${`If you want to continue using ISOlation.SITE you need to get membership from the Purchase tab`}.
      dl,
        dt ${"Products & Services Available"}.
        dd a ${{href:'https://mail2merge.com'}} :text ${"Free Manual MailMerge"}.
        dd a ${{href:'/form/selection/app'}} :text ${"ViewFinder"}.
        dd a ${{href:'/form/selection/archivist1'}} :text ${"Archivist1"}.
        dd a ${{href:'https://isolation.site/?li', target:'_blank'}} :text ${"ISOlation.SITE"}.
      .
    .
  `
}

function ActiveContent(state) {
  const hash = window.location.hash.slice(1);
  let view = Purchases;
  switch(hash) {
    case "billing":
      view = BillingAccount;
      break;
    case "usage":
      view = Usage;
      break;
    case "onetimepayments":
    case "subscriptions":
      view = Purchases;
      break;
    case "account":
      view = Account;
      break;
    case "profile":
      view = Default;
      break;
    default: 
      view = Purchases;
      break;
  }

  // make a pinner container for active content to render and be replaced in 
  return w`${true}
    :comp ${state} ${view}
  `;
}

