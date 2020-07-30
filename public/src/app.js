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
  {href:'#how', text:"How it works"},
  {href:'#questions', text:"Questions"},
  {href:'/documentation,html', text: "Documentation"},
];

const LoggedInNav = ({userid}) => [
  ...Nav,
  {action:`/form/selection/profile/${userid}`, text: "Profile"}
];

const SignedOutNav = [
  ...Nav,
  {action: '/signup.html', text: 'Sign Up'},
  {action: '/login.html', text: 'Log In'},
];

function App(state) {
  const session = state.authorization && state.authorization.session;
  const loggedIn = session && session.userid && session.userid != 'nouser';

  return w`
    main ${_} ${"holyGrid"},
      header ${{style:'position: sticky; top: 0;'}} ${"header"}, 
        nav ul ${_} ${"responsiveList"},
          :map ${loggedIn ? LoggedInNav(session) : SignedOutNav } ${NavItem}.
        .
      .
      section ${{class:'content'}} ${"content"},
        section ${{class:'banner'}} ${"section"},
          h1 ${"BrowserGap - Embeddable Remote Browser"}.
          section ${{class:'card-stack'}} ${"section"},
            section ${{class:'transparent'}} ${"card"},
              h1 ${"Free Live Demo"}.
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
        section ${{class:'about'}} ${"section"},
          h1 ${"About"}.
          section ${{class:'card-stack'}} ${"section"},
            section ${_} ${"card"},
              h1 ${"What can BrowserGap do?"}.
              ul,
                li ${"Live stream the browser remotely."}.
                li ${"Embed a browser in another web application to integrate user flows."}.
                li ${"Perform remote browser isolation for security and automation."}.
                li ${"Run your browsers anywhere and connect to them from anywhera."}.
                li ${"Isolate your network from the risks of the public internet by running browsers in a remote machine."}.
                li ${"Connect to Chrome headless with a Browser User Interface."}.
              .
            .
            section ${_} ${"card"},
              h1 ${"What is BrowserGap?"}.
              p ${`
                BrowserGap is a feature-complete, clientless, remote browser isolation product, in HTML/JavaScript that runs right in your browser. Integrated with a secure document viewer (available on request), this can provide safe remote browser isolation at deployments of any size. It also saves you bandwidth (on the last hop, anyway).
              `}.
            .
          .
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

