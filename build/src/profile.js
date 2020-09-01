import{w as t,clone as $}from"./web_modules/bepis.js";import{initializeDSS as m}from"./web_modules/style.dss.js";import{stylists as p}from"./style.js";import{hiddenInput as i,auth_fields as r}from"./fields.js";const n=null,l={};export function init(){const{state:e}=self.loadData;Object.assign(l,$(e)),m({},p),Profile(l)(document.body),self.addEventListener("hashchange",b),self.addEventListener("submit",f),h()}function h(){const e=localStorage.getItem("hash-on-submit");e&&(location.hash=e)}function f(){const e=location.hash.slice(1);localStorage.setItem("hash-on-submit",e)}function b(){localStorage.removeItem("hash-on-submit"),c(l)}export function Header(){return t`
    header ${n} ${"header"}, 
      nav ul ${n} ${"responsiveList"},
        li a ${{href:"/",class:"brand-link"}}  :text ${"ServeData"}  .
      .
    .

  `}export function Profile({newEmail:e=null,username:o=null,email:a=null,_id:u=null}){const d={username:o,newEmail:e,email:a,_id:u};return t`${!0}
    main ${n} ${"profileGrid"},
      header ${n} ${"header"}, 
        nav ul ${n} ${"responsiveList"},
          li a ${{href:"/",class:"brand-link"}}  :text ${"ServeData"}  .
          li button ${{form:"logout",class:"button-like"}} :text ${"Logout"}.
        .
      .
      section ${{class:"vertical-tabs"}} ${"verticalTabs"},
        ul,
          li a ${{href:"#profile"}} :text ${"My Profile"}.
          li a ${{href:"#account"}}:text  ${"ServeData account"}.
          li a ${{href:"#subscriptions"}} :text ${"Purchase"}.
          li a ${{href:"#billing"}} :text ${"Billing account"}.
          li a ${{href:"#usage"}} :text ${"Usage"}.
        .
      .
      section ${{class:"content"}} ${"profileContent"},
        :comp ${d} ${c}.
      .
      form ${{hidden:!0,id:"logout",method:"POST",action:"/form/action/logout/redir/app"}},
        input ${{type:"hidden",name:"state",value:"logged-out"}}.
      .
  `}function g(e){return e.newEmail?t`
      dt ${"New email (unverified)"},
        br.
        small i ${"check your email for link"}.
      .
      dd ${e.newEmail}.
    `:t`dt.`}function v(e){return t`
    article,
      h1 ${"My ServeData Account"}.
      hr.
      dl,
        dt ${"Username"}.
        dd ${e.username}.
        dt ${"Email"}.
        dd ${e.email}.
        :comp ${e} ${g}.
      .
      section ${{class:"shrink-fit"}},
        form ${{class:"v-gapped full-width",method:"POST",action:"/form/action/update_email/redir/profile"}} ${"form"},
          fieldset,
            legend ${"Change email"}.
            p label ${"Email"} input ${r.email}.
            :comp ${{name:"_id",value:e._id}} ${i}.
            :comp ${{name:"username",value:e.username}} ${i}.
            p label button ${"Update"}.
          .
        .
        form ${{class:"v-gapped full-width",method:"POST",action:`/form/table/users/${e._id}/with/profile`}} ${"form"},
          fieldset,
            legend ${"Change username"}.
            p label ${"Username"} input ${r.username}.
            p label button ${"Update"}.
          .
        .
        form ${{class:"v-gapped full-width",method:"POST",action:"/form/action/update_password/redir/profile"}} ${"form"},
          fieldset,
            legend ${"Change password"}.
            :comp ${{name:"_id",value:e._id}} ${i}.
            :comp ${{name:"username",value:e.username}} ${i}.
            p label ${"Password"} input ${r.password}.
            p label button ${"Update"}.
          .
        .
      .
    .
  `}function w(){return t`
    article,
      h1 ${"Billing Account"}.
      hr.
      b ${"Credit balance "}.
      span ${"100 credits"}.
    .
  `}function S(){return t`
    article,
      h1 ${"Usage"}.
      hr.
      b ${"Credits used "}.
      span ${"50 credits"}.
    .
  `}function x(){return t`
    article,
      h1 ${"Credits & Subscriptions"}.
      hr.
      section ${{class:"shrink-fit"}},
        form ${{class:"full-width",method:"POST",action:"/form/action/pay/with/tocheckout"}} ${"form"},
          fieldset,
            legend ${"Subscription purchase"}.
            :comp ${{name:"mode",value:"subscription"}} ${i}.
            p label ${{innerText:"Purchase option "}} select ${{name:"price"}},
              option ${{value:"price_1GxoLaBKxtsqOlor5Dr9pXR1"}} :text ${"ServeData Monthly Subscription"}.
            .
            p button ${"Buy Now"}.
          .
        .
        form ${{class:"full-width",method:"POST",action:"/form/action/pay/with/tocheckout"}} ${"form"},
          fieldset,
            legend ${"Credit pack purchase"}.
            :comp ${{name:"mode",value:"payment"}} ${i}.
            p label ${{innerText:"Purchase option "}} select ${{name:"price"}},
              option ${{value:"price_1GxoLbBKxtsqOlor1N2goLyw"}} :text ${"Task Run Credits Recharge 9100 Pack"}.
              option ${{value:"price_1GxoLcBKxtsqOlorY0TVJahM"}} :text ${"Task Run Credits Recharge 2400 Pack"}.
              option ${{value:"price_1GxoLcBKxtsqOlor6lT2W0na"}} :text ${"Task Run Credits Recharge 750 Pack"}.
            .
            p button ${"Buy Now"}.
          .
        .
      .
    .
  `}function s(){return t`
    article ${{class:"profile"}},
      h1 ${"My profile"}.
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
  `}function c(e){const o=window.location.hash.slice(1);let a=s;switch(o){case"billing":a=w;break;case"usage":a=S;break;case"onetimepayments":case"subscriptions":a=x;break;case"account":a=v;break;default:a=s;break}return t`${!0}
    :comp ${e} ${a}
  `}
