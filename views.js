import path from 'path';
import fs from 'fs';

import {VIEWS} from './common.js';

// views
  export function withView(f) {
    return async (...args) => {
      const raw = await f(...args);
      const view = args[0].view;
      let viewFileName, View;

      try {
        viewFileName = path.resolve(VIEWS, `${args[0].view}.js`);
        ({default:View} = await import(viewFileName));
      } catch(e) {
        console.warn(`View ${view} is not in file ${viewFileName}`);
      }

      /**
        const tempJsonView = JSON.stringify(raw);
        return tempJsonView;
      **/

      const renderedView = View(raw);
      return renderedView;
    };
  }
