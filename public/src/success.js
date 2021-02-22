import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {Header} from './profile.js';

const _ = null;

export function init() {
  SuccessPage(self.loadData);
  initializeDSS({}, stylists);
}

function SuccessPage({state:{message, details, gifUrl}}) {
  return w`
    main,
      article ${_} ${"success"},
        :comp ${Header}. 
        section ${{class:'message'}},
          h1 ${message || "Something good happened"}.
          pre code ${details || ''}.
        .
        hr.
      .
      img ${{src:gifUrl}} ${"funnyImage"}.
    .
  `(
    document.body
  );
}

