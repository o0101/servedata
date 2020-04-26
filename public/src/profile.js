import {w} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {auth_fields as fields} from './fields.js';

const _ = null;
const $ = '';

initializeDSS({}, stylists);
Profile(self.loadData);

function Profile({username, email, _id}) {
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
          li a ${{href:'#settings'}}:text  ${`Account settings`}.
          li a ${{href:'#billing'}} :text ${`Product billing`}.
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
        action: `/form/table/sessions/${_id}/with/app`,
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

function OldProfile({username, email, _id}) {
  return w`
    main ${_} ${"holyGrid"},
      header ${_} ${"header"}, 
        nav ul ${_} ${"responsiveList"},
          li a ${{href:'#', class:'brand-link'}}  :text ${"Dosyago"}  .
          li a ${{href:'#how'}}  :text ${"How it works"}  .
          li a ${{href:'#questions'}} :text ${"Questions"}.
          li a ${{href:'/documentation.html'}}  :text ${"Documentation"}  .
          li a ${{href:'/settings.html'}} :text ${"Settings"}.
          li button ${{form:'logout', class:'button-like'}} :text ${"Logout"}.
        .
      .
      section ${{class:'content'}} ${"content"},
        article ${{class:'profile'}},
          h1 ${`${username} profile`}.
          dl,
            dt ${"Email"}.
            dd ${email}.
          .
        .
      .
      footer ${_} ${"footer"},
        nav ul ${_} ${"responsiveList"},
          li a ${{href:'https://dosyago.com', class:'author-cite', target:'_blank'}} :text ${"2020 DOSYAGO, Inc."}.
          li a ${{href:'/about.html'}} :text ${"About"}.
          li a ${{href:'/privacy.html'}} :text ${"Privacy Policy"}.
          li a ${{href:'/term"html"'}} :text ${"Terms of Service"}.
          li a ${{href:'/contact.html'}} :text ${"Contact"}.
          li a ${{href:'/security.html'}} :text ${"Security"}.
          li, a ${{href:'https://github.com/dosyago', class:'social-icon', target:'_blank'}} :text ${"GH"}.
              a ${{href:'https://www.youtube.com/channel/UCxyWgnYfo8TvSJWc9n_vVcQ', class:'social-icon', target:'_blank'}} :text ${"YT"}.
              a ${{href:'https://twitter.com/browsergap', class:'social-icon', target:'_blank'}} :text ${"TW"}.
          .
        .
      .
      form ${{
        hidden:true,
        id: 'logout',
        method: 'POST',
        action: `/form/table/sessions/${_id}/with/app`,
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
