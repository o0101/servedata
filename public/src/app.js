import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';

const _ = null;

export function init({state: state = {}} = {}) {
  App(state);
  initializeDSS(state, stylists);
}

const Nav = [
  {href:'#', class:'brand-link', text: "BrowserGap"},
  {href:'#questions', text:"FAQ"},
  {href:'https://github.com/dosyago/BrowserGap', text: "Docs"},
];

const LoggedInNav = ({userid}) => [
  {action:`/form/selection/profile/${userid}`, text: "Profile"}
];

const SignedOutNav = [
  {action: '/signup.html', text: 'Sign Up'},
  {action: '/login.html', text: 'Log In'},
];

function App(state) {
  const session = state.authorization && state.authorization.session;
  const loggedIn = session && session.userid && session.userid != 'nouser';
  let userid;
  if ( loggedIn ) {
    ({userid} = session);
  }

  return w`
    main ${_} ${"holyGrid"},
      header ${{style:'position: sticky; top: 0;'}} ${"header"}, 
        nav,
          ul ${_} ${"responsiveList"},
            :map ${Nav} ${NavItem}.
          .
          ul ${_} ${"responsiveList"},
            :map ${loggedIn ? LoggedInNav({userid}) : SignedOutNav} ${NavItem}.
          .
        .
      .
      section ${{class:'content'}} ${"content"},
        section ${{class:'card-stack'}} ${"section"},
          section ${{class:'transparent'}} ${"card"},
            h1 ${"BrowserGap"}.
            p,
              a ${{href:'https://demo.browsergap.dosyago.com', target:"_blank", title:"Click through to a free live demo"}},
                img ${{
                  style: 'filter: contrast(1.2) saturate(1.3) brightness(1.05)',
                  src:'https://j.gifs.com/E8yzLv.gif', 
                  class: 'card-border'
                }}.
              .
            .
            p,
              a ${{href:'https://demo.browsergap.dosyago.com', target:"_blank"}} :text ${"Click through to a live demo."}.
            .
          .
          section ${{class:'transparent'}} ${"card"},
            h1 ${{style:"font-size: 3.5vw; text-align: right;"}} :text ${"BrowserGap is a secure browser you embed in your webapp."}.
          .
        .
        section ${{class:'awesome'}} ${"section"},
          h1 ${"Why BrowserGap is Awesome"}.
          section ${{class:'card-stack'}} ${"section"},
            section ${{class:'block'}} ${"card"},
              h1 ${"Uses Cases"}.
              ul,
                li ${"Embed a custom browser in a web app."}.
                li ${"Live stream a browser."}.
                li ${"Protect your network."}.
                li ${"Securely browse the web."}.
                li ${"Ensure PCI and HIPAA compliance."}.
                li ${"Watch your automated tests."}.
                li ${"Literally anything you can imagine."}.
              .
            .
            section ${{class:'block'}} ${"card"},
              h1 ${"Features"}.
              ul,
                li ${"Upload and download files."}.
                li ${"Submit forms."}.
                li ${"Securely view documents."}.
                li ${"Copy and paste."}.
                li ${"Interact with modal dialogs."}.
                li ${"Open new tabs, and new incognito tabs."}.
                li ${"Navigate history."}.
                li ${"Search from the address bar."}.
                li ${"Clear cache, history and session cookies."}.
                li ${"Scroll with touch, spacebar, mousewheel and magic track pad."}.
                li ${"Use anywhere: desktop, tablet or mobile."}.
              .
            .
          .
        .
        section ${{class:'pricing'}} ${"section"},
          h1 ${"Pricing"}.
          section ${{class:'card-stack'}} ${"section"},
            section ${{class:'block'}} ${"card"},
              h1 ${"Self-hosted Site License"}.
              ul,
                li ${"Deploy and maintain contracts available."}.
                li ${"Support tiers available."}.
                li ${"Transparent pricing."}.
                li ${"From USD$100,000 per site per year."}.
              .
            .
            section ${{class:'block'}} ${"card"},
              h1 ${"Self-hosted Seat License"}.
              ul,
                li ${"Support available."}.
                li ${"Simple pricing."}.
                li ${"From USD$1068.73 per seat per year."}.
              .
            .
            section ${{class:'block'}} ${"card"},
              h1 ${"Enterprise Whale Usage"}.
              p, 
                a ${{href:'mailto:cris@dosycorp.com?body=Hi%20Cris&subject=Whale'}} :text ${"Email"}.
              .
            .
            section ${{class:'block'}} ${"card"},
              h1 ${"SaaS Seat License"}.
              ul,
                li ${"Fully managed."}.
                li ${"Single tenant service for orgs."}.
                li ${"Simple pricing."}.
                li ${"USD$100 per seat per month."}.
              .
            .
          .
        .
        section ${{id:'questions', class:'questions'}} ${"section"},
          h1 ${"Frequently Asked Questions"}.
            section ${{class:'block'}} ${"card"},
              dl,
                dt ${"Who can I contact if I need more info or help?"}.
                dd,
                  :text ${"Please, "}.
                  a ${{href:'mailto:cris@dosycorp.com?body=Hi%20Cris&subject=BrowserGap%20Help'}} :text ${"mail me"}.
                  :text ${" for assistance."}.
                .
              .
            .
        .
      .
      footer ${_} ${"footer"},
        nav ul ${_} ${"responsiveList"},
          li a ${{
            href:'https://dosyago.com', class:'author-cite', target:'_blank',
            style: 'font-size: smaller;'
          }} :text ${"© 2020 DOSYAGO, Inc."}.
          li a ${{href:'mailto:cris@dosycorp.com?body=Hi%20Cris&subject=Hello'}} :text ${"Email"}.
          li a ${{href:'https://github.com/dosyago', class:'social-icon', target:'_blank'}} :text ${"GitHub"}.
          li a ${{href:'https://www.youtube.com/channel/UCxyWgnYfo8TvSJWc9n_vVcQ', class:'social-icon', target:'_blank'}} :text ${"YouTube"}.
          li a ${{href:'https://twitter.com/browsergap', class:'social-icon', target:'_blank'}} :text ${"Twitter"}.
        .
      .
    .
  `(
    document.body
  );
}

function NavItem({text, action: action = null, href: href = null, ...rest}) {
  if ( action ) {
    return w`
      li form ${{action, ...rest}} button ${rest} :text ${text}.
    `;
  } else if ( href ) {
    return w`
      li a ${{href, ...rest}} :text ${text}.
    `;
  } else {
    throw new TypeError(`NavItem must provide either action or href as URL to navigate to.`);
  }
}

