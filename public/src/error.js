import {w} from './web_modules/bepis.js';
import {initializeDSS} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {Header} from './profile.js';

const _ = null;

export function init() {
  ErrorPage(self.loadData);
  initializeDSS({}, stylists);
}

function ErrorPage({state:{error, message, gifUrl}}) {
  return w`
    main,
      article ${_} ${"error"},
        :comp ${Header}. 
        section ${{class:'message'}},
          h1 ${message || "An Error occurred"}.
          pre code ${error || ''}.
        .
        hr.
      .
      img ${{src:gifUrl}} ${"funnyImage"}.
    .
  `(
    document.body
  );
}

