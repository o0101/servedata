import{w as t}from"./web_modules/bepis.js";import{initializeDSS as i}from"./web_modules/style.dss.js";import{stylists as e}from"./style.js";import{Header as o}from"./profile.js";export function init(){s(),i({},e)}function s(){return t`
    article,
      :comp ${o}.
      aside ${{class:"notification",stylist:"toast"}},
        h1 ${"Email is on its way!"}.
        p,
          :text ${"If you like, you can "}.
          a ${{href:"mailto:?subject=Check%20Your%20Inbox",target:"_blank"}} :text ${"check your mail"}.
          :text ${" for the link to login."}.
        .
        hr.
        small ${"Didn't get the email? "}, 
          a ${{href:"/email-login.html"}} :text ${"Try sending again."}.
        .
      .
  `(document.body)}
