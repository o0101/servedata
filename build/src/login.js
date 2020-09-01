import{w as t}from"./web_modules/bepis.js";import{initializeDSS as n}from"./web_modules/style.dss.js";import{stylists as l}from"./style.js";import{auth_fields as e}from"./fields.js";import{Header as o}from"./profile.js";export function init(){r(),n({},l)}function r(){if(location.pathname.startsWith("/email-login"))return t`
      article,
        :comp ${o}.
        form ${{method:"POST",action:"/form/action/sendloginemail/with/check_your_email",stylist:"form"}},
          fieldset,
            legend :text ${"Login with Email"}.
            p label ${"Username"} input ${e.username}.
            p button :text ${"Get Login Email"}.
            hr.
            small ${"Can't access email? "}, 
              a ${{href:"mailto:cris@dosycorp.com"}} :text ${"Contact us to start account verification."}.
            .
          .
        .
    `(document.body);if(location.pathname.startsWith("/link-login")){const i=location.search.split("&")[0].replace("?loginId=","");return t`
      article,
        :comp ${o}.
        form ${{method:"POST",action:"/form/action/loginwithlink/redir/profile",stylist:"form"}},
          fieldset,
            legend :text ${"Login from Link"}.
            input ${{type:"hidden",name:"loginLinkId",value:i}}.
            p button :text ${"Login Now"}.
            hr.
            small ${"Link not working? "}, 
              a ${{href:"/email-login.html"}} :text ${"Request another"}.
              :text ${" or "}.
              a ${{href:"mailto:cris@dosycorp.com"}} :text ${"Contact us for support."}.
            .
          .
        .
    `(document.body)}else return t`
      article,
        :comp ${o}. 
        form ${{method:"POST",action:"/form/action/login/redir/profile",stylist:"form"}},
          fieldset,
            legend :text ${"Login"}.
            p label ${"Username"} input ${e.username}.
            p label ${"Password"} input ${e.password}.
            p button :text ${"Login"}.
            hr.
            p small ${"Forget a password? "}, 
              a ${{href:"/email-login.html"}} :text ${"Login with email instead."}.
            .
            p small ${"Don't have an account? "}, 
              a ${{href:"/signup.html"}} :text ${"Sign Up here."}.
            .
          .
      .
    `(document.body)}
