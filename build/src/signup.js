import{w as e}from"./web_modules/bepis.js";import{initializeDSS as t}from"./web_modules/style.dss.js";import{stylists as o}from"./style.js";import{auth_fields as i}from"./fields.js";import{Header as s}from"./profile.js";export function init(){l(),t({},o)}function l(){return e`
    article,
      :comp ${s}.
      form ${{method:"POST",action:"/form/action/signup/with/check_your_email",stylist:"form"}},
        fieldset,
          legend ${"Sign Up"}.
          p label ${"Username"} input ${i.username}.
          p label ${"Email"} input ${i.email}.
          p label ${"Email again"} input ${i.email2}.
          p label ${"Password"} input ${i.password}.
          p button ${"Sign Up"}.
        .
      .
  `(document.body)}
