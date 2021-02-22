import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';

const _ = null;

export function init({state: state = {}} = {}) {
  App({state});
  initializeDSS(state, stylists);
}

const Nav = [
  {href:'/', class:'brand-link', text: "Dosyago"},
  {href:'/form/selection/app', text: "ViewFinder"},
  {href:'#questions', text:"FAQ"},
  {href:'https://github.com/cris691/22120', text: "A1 Docs"},
  {href:'https://isolation.site', text: "ISO"},
];

const LoggedInNav = ({userid}) => [
  {action:`/form/selection/profile/${userid}`, text: "Profile"}
];

const SignedOutNav = [
  {action: '/form/selection/signup', text: 'Sign Up'},
  {action: '/form/selection/login', text: 'Log In'},
];

function App({state}) {
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
          h1 ${{style:`
            font-size: 11.37vw;
            font-family: monospace;
            text-align: center;
            text-shadow: 5px 5px 5px grey;
            color: red;
            -webkit-text-stroke: 3px white;
            -webkit-text-stroke-width: 3px;
          `}} :text ${"Archivist1"}.
        .
        section ${{class:'awesome'}} ${"section"},
          h1 ${"What it does"}.
          section ${{class:'card-stack'}} ${"section"},
            section ${{class:'block'}} ${"card"},
              h1 ${"Why it's good"}.
              ul,
                li ${"Seamlessly save everything you browse"}.
                li ${"Provide a replayable timeline of browsing"}.
                li ${"Use webpages when you're offline"}.
                li ${"Portable archive format using JSON and base64"}.
              .
            .
          .
        .
        section ${{class:'pricing'}} ${"section"},
          h1 ${"Pricing"}.
          section ${{class:'card-stack'}} ${"section"},
            section ${{class:'block'}} ${"card"},
              h1 ${"Lifetime License"}.
              ul,
                li ${"Per major version"}.
                li ${"Free updates forever for that version"}.
                li ${"Transparent pricing."}.
                li ${"USD$13.71 per person."}.
              .
              form ${{
                action: '/err',
                style: 'text-align: center;'
              }},
                button ${{class:'buy special'}} :text ${"Buy Now"}.
              .
            .
            section ${{class:'block'}} ${"card"},
              h1 ${"Custom Deployments"}.
              ul,
                li ${"Data retention compliance available"}.
                li ${"Scalable deployments"}.
                li ${`Data-lake and "cold-storage" integration`}.
                li ${"Simple pricing."}.
              .
              form ${{
                method: 'POST',
                action:'mailto:cris@dosycorp.com?subject=Archivist1%20Corp%20License',
                style: 'text-align: center;'
              }},
                button ${{class:'info special'}} :text ${"Inquire Now"}.
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
          li a ${{href:'https://twitter.com/dosyagoos', class:'social-icon', target:'_blank'}} :text ${"Twitter"}.
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

