import{w as s}from"./web_modules/bepis.js";import{initializeDSS as t}from"./web_modules/style.dss.js";import{stylists as i}from"./style.js";import{Header as m}from"./profile.js";const n=null;export function init(){l(self.loadData),t({},i)}function l({state:{error:r,message:e,gifUrl:o}}){return s`
    main,
      article ${n} ${"error"},
        :comp ${m}. 
        section ${{class:"message"}},
          h1 ${e||"An Error occurred"}.
          pre code ${r||""}.
        .
        hr.
      .
      img ${{src:o}} ${"funnyImage"}.
    .
  `(document.body)}
