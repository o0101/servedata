export const stylists={aux_page:d,holyGrid:c,profileGrid:l,header:g,nav:u,footer:s,section:m,content:f,profileContent:p,error:n,funnyImage:i,responsiveList:b,verticalTabs:o,form:v,toast:h};export function all(...r){const t=r.some(e=>e instanceof Function);return t?(...e)=>(r=r.map(a=>(a instanceof Function&&(a=a(...e)),a)),Object.assign({},...r)):Object.assign({},...r)}function n(){return`
      * {
        background: snow;
      }

      * section.message {
        padding: var(--pad2);
      }
    `}function i(){return`
      * {
        display: block;
        margin: 3rem auto;
        padding: var(--pad2);
        min-width: 30%;
        max-width: 88vw;
      }
    `}function o(){return`
      * li {
        border-bottom: thin solid var(--grey);
      }

      * li a {
        color: inherit;
        text-decoration: none;
        cursor: default;
      }

      * li:hover,
      * li:active {
        background: var(--smoke);
      }
    `}function d(){return`
      * {
        background: var(--smoke);
      }
    `}function l(){return`
      * {
        display: grid;
        grid-template-areas: 
          "header header"
          "tabs content"
          "footer footer";
        grid-template-columns: auto 1fr;
        grid-template-rows: auto 1fr auto;
        grid-gap: var(--pad2);
        min-height: 100%;
        box-sizing: border-box;
      }

      * a {
        color: var(--blue);
      }

      * a.brand-link {
        font-size: larger;
      }

      * .button-like {
        padding: var(--pad1);
        border: 0.25em solid;
        display: inline-block;
        background: transparent;
        color: var(--white);
        font-variant: small-caps;
      }

      @media screen and (max-width: 640px) {
        * a.button-like {
          margin: var(--pad1);
        }
      }

      * a.author-cite {
        color: var(--grey);
      }

      * .vertical-tabs {
        grid-area: tabs;
        display: table; 
        background: var(--white);
        border: thin solid var(--grey);
        margin-left: var(--pad2);
      }

      * .vertical-tabs ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
      }

      * .vertical-tabs li a {
        padding: 0.5rem 1rem;
        display: block;
        margin: 0;
      }

      * .content {
        grid-area: content;
        margin-right: var(--pad2);
        background: var(--white);
        border: thin solid var(--grey);
      }

      * .shrink-fit {
        display: table;
      }

      * .v-gapped {
        margin: 1em 0;
      }
    `}function c(){return`
      * {
        display: grid;
        grid-template-areas: 
          "header header header"
          "nav content aside"
          "footer footer footer";
        grid-template-columns: auto 1fr auto;
        grid-template-rows: auto 1fr auto;
        height: 100%;
      }

      * a {
        color: var(--blue);
      }

      * a.brand-link {
        font-size: larger;
      }

      * .button-like {
        padding: 0;
        padding: var(--pad1);
        border: 0.25em solid;
        display: inline-block;
        background: transparent;
        color: var(--white);
        font-variant: small-caps;
      }

      @media screen and (max-width: 640px) {
        * a.button-like {
          margin: var(--pad1);
        }
      }

      * a.author-cite {
        color: var(--grey);
      }
    `}function g(){return`
      * {
        grid-area: header;
        background: linear-gradient(to right, var(--left), var(--right));
        padding: 0 var(--pad2);
      }

      * a {
        color: var(--white);
        font-variant: small-caps;
        text-decoration: none;
      }

      * a.brand-link {
        font-size: larger;
      }
    `}function u(){return`
      *.vertical {
        
      }
    `}function s(){return`
      * {
        grid-area: footer;
        background: var(--smoke);
      }
    `}function p(){return`
      * {
        grid-area: content;
        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem;
      }

      * article h1 {
        margin: 0.5rem 0;
      }
    `}function f(){return`
      * {
        grid-area: content;
        display: flex;
        flex-direction: column;
      }

      * article h1 {
        margin: 0.5rem 0;
      }
    `}function m(){return`
      * {
        flex-grow: 1;
        min-height: 300px;
      }

      *:nth-of-type(2n) {
        background: var(--smoke);
      }

      * h1 {
        text-align: center;
      }
    `}function b(){return`
      * {
        list-style-type: none;
        display: flex;
        margin: 0;
        padding: 0;
        padding: var(--pad1);
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
      }

      * li a {
        text-decoration: none; 
      }
      
      * li form {
        margin: 0;
      }

      * li {
      }
    `}function v(){return`
      * {
        display: table;
        margin: 0 auto;
        padding-top: 1rem;
      }

      *.full-width {
        display: block;
        width: 100%;
      }

      *.full-width fieldset {

      }

      * fieldset {
        border: thin solid;
        border-top: 1rem solid var(--right);
        background: var(--white);
      }

      * label {
        display: flex;
        justify-content: space-between;
      }

      * input, * select  {
        margin-left: 2rem;
      }

    `}function h(){return`
      *.notification {
        display: table;
        margin: 0 auto;
        background: var(--white);
        padding: 0.5rem;
        margin-top: 0.5rem;
        border: thin solid;
        border-top: 1rem solid var(--left);
      }
    `}
