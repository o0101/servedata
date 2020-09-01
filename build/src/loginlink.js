import{w as i}from"./web_modules/bepis.js";import{initializeDSS as e}from"./web_modules/style.dss.js";import{stylists as r}from"./style.js";import{Header as n}from"./profile.js";export function init(){s(self.loadData),e({},r)}function s({state:o}){const{_id:t}=o;return i`
    article,
      :comp ${n}.
      form ${{method:"POST",action:"/form/action/loginwithlink/redir/profile",stylist:"form"}},
        fieldset,
          legend :text ${"Login from Link"}.
          input ${{type:"hidden",name:"id",value:t}}.
          p button :text ${"Login"}.
          hr.
          small ${"Not working as expected? "}, 
            a ${{href:"mailto:cris@dosycorp.com"}} :text ${"Contact us for help."}.
          .
        .
      .
  `(document.body)}
