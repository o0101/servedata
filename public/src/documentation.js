import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {Header} from './profile.js';

const _ = null;

export function init() {
  Documentation();
  initializeDSS({}, stylists);
}

function Documentation() {
  return w`
    main ${_} ${"holyGrid"},
      :comp ${Header}.
      section ${{class:'vertical'}} ${"nav"},
        ul,
          li a ${{href:'#part1'}} :text ${"Doc Part 1"}.
        .
      .
      section ${{class:'content'}} ${"content"},
        section ${{class:'part1'}} ${"section"},
          h1 ${"Doc Part 1"}.
        .
        section ${{class:'part2'}} ${"section"},
          h1 ${"Doc Part 2"}.
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

