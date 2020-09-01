import{w as n}from"./web_modules/bepis.js";import{initializeDSS as a}from"./web_modules/style.dss.js";import{stylists as c}from"./style.js";const s=null;export function init({state:t={}}={}){h(t),a(t,c)}const r=[{href:"#",class:"brand-link",text:"ServeData"},{href:"#how",text:"How it works"},{href:"#questions",text:"Questions"},{href:"/documentation,html",text:"Documentation"}],l=({userid:t})=>[...r,{action:`/form/selection/profile/${t}`,text:"Profile"}],$=[...r,{action:"/signup.html",text:"Sign Up"},{action:"/login.html",text:"Log In"}];function h(t){const e=t.authorization&&t.authorization.session,o=e&&e.userid&&e.userid!="nouser";return n`
    main ${s} ${"holyGrid"},
      header ${{style:"position: sticky; top: 0;"}} ${"header"}, 
        nav ul ${s} ${"responsiveList"},
          :map ${o?l(e):$} ${u}.
        .
      .
      section ${{class:"content"}} ${"content"},
        section ${{class:"banner"}} ${"section"},
          h1 ${"ServeData"}.
        .
        section ${{class:"pricing"}} ${"section"},
          h1 ${"Pricing"}.
        .
        section ${{class:"features"}} ${"section"},
          h1 ${"Features"}.
        .
        section ${{id:"how",class:"how-it-works"}} ${"section"},
          h1 ${"How it works"}.
        .
        section ${{id:"questions",class:"questions"}} ${"section"},
          h1 ${"Frequently Asked Questions"}.
        .
      .
      footer ${s} ${"footer"},
        nav ul ${s} ${"responsiveList"},
          li a ${{href:"https://dosyago.com",class:"author-cite",target:"_blank"}} :text ${"2020 DOSYAGO, Inc."}.
          li a ${{href:"/about.html"}} :text ${"About"}.
          li a ${{href:"/privacy.html"}} :text ${"Privacy Policy"}.
          li a ${{href:"/terms.html"}} :text ${"Terms of Service"}.
          li a ${{href:"/contact.html"}} :text ${"Contact"}.
          li a ${{href:"/security.html"}} :text ${"Security"}.
          li, a ${{href:"https://github.com/dosyago",class:"social-icon",target:"_blank"}} :text ${"GH"}.
              a ${{href:"https://www.youtube.com/channel/UCxyWgnYfo8TvSJWc9n_vVcQ",class:"social-icon",target:"_blank"}} :text ${"YT"}.
              a ${{href:"https://twitter.com/browsergap",class:"social-icon",target:"_blank"}} :text ${"TW"}.
          .
        .
      .
    .
  `(document.body)}function u({text:t,action:e=null,href:o=null,...i}){if(e)return n`
      li form ${{action:e,...i}} button ${i} :text ${t}.
    `;if(o)return n`
      li a ${{href:o,...i}} :text ${t}.
    `;throw new TypeError("NavItem must provide either action or href as URL to navigate to.")}
