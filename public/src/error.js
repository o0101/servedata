import {w} from './web_modules/bepis.js';
import {initializeDSS, restyleAll, setState} from './web_modules/style.dss.js';
import {stylists} from './style.js';
import {Header} from './profile.js';

const _ = null;
const $ = '';

export function init() {
  ErrorPage(self.loadData);
  initializeDSS({}, stylists);
}

function ErrorPage({state:{error, gifUrl}}) {
  return w`
    main,
      article ${_} ${"error"},
        :comp ${Header}. 
        section ${{class:'message'}},
          h1 ${"An Error occurred"}.
          p ${error}.
        .
        hr.
      .
      img ${{src:gifUrl}} ${"funnyImage"}.
    .
  `(
    document.body
  );
}

