import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';

const _ = null;

export function init() {
  App();
  initializeDSS({}, stylists);
}

function App() {
  return w`
    main ${_} ${"holyGrid"},
      header ${{style:'position: sticky; top: 0;'}} ${"header"}, 
        nav ul ${_} ${"responsiveList"},
          li a ${{href:'#', class:'brand-link'}}  :text ${"Capi.Click"}  .
          li a ${{href:'#how'}}  :text ${"How it works"}  .
          li a ${{href:'#questions'}} :text ${"Questions"}.
          li a ${{href:'/documentation.html'}}  :text ${"Documentation"}  .
          li,
            form ${{action:'/signup.html'}} button ${{class:''}} :text ${"Sign Up"}.
          .
          li,
            form ${{action:'/login.html'}} button ${{class:''}} :text ${"Login"}.
          .
        .
      .
      section ${{class:'content'}} ${"content"},
        section ${{class:'banner'}} ${"section"},
          h1 ${"Capi.Click"}.
        .
        section ${{class:'pricing'}} ${"section"},
          h1 ${"Pricing"}.
        .
        section ${{class:'features'}} ${"section"},
          h1 ${"Features"}.
        .
        section ${{id:'how', class:'how-it-works'}} ${"section"},
          h1 ${"How it works"}.
        .
        section ${{id:'questions', class:'questions'}} ${"section"},
          h1 ${"Frequently Asked Questions"}.
        .
      .
      footer ${_} ${"footer"},
        nav ul ${_} ${"responsiveList"},
          li a ${{href:'https://dosyago.com', class:'author-cite', target:'_blank'}} :text ${"2020 DOSYAGO, Inc."}.
          li a ${{href:'/about.html'}} :text ${"About"}.
          li a ${{href:'/privacy.html'}} :text ${"Privacy Policy"}.
          li a ${{href:'/terms.html'}} :text ${"Terms of Service"}.
          li a ${{href:'/contact.html'}} :text ${"Contact"}.
          li a ${{href:'/security.html'}} :text ${"Security"}.
          li, a ${{href:'https://github.com/dosyago', class:'social-icon', target:'_blank'}} :text ${"GH"}.
              a ${{href:'https://www.youtube.com/channel/UCxyWgnYfo8TvSJWc9n_vVcQ', class:'social-icon', target:'_blank'}} :text ${"YT"}.
              a ${{href:'https://twitter.com/browsergap', class:'social-icon', target:'_blank'}} :text ${"TW"}.
          .
        .
      .
    .
  `(
    document.body
  );
}

