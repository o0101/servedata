// imports
  import nodemailer from 'nodemailer';

  import mailKey from '../secrets/dosycorp.com-gsuite-email-key.js';
  import {
    USER_TABLE, 
    MAIL_SENDER, 
    MAIL_HOST, MAIL_PORT,
    LOGINLINK_TABLE, 
  } from '../common.js';
  import {
    addUser, route
  } from '../helpers.js';

export default async function action({username, password, email}, {getTable, newItem, getSearchResult}, req, res) {
  if ( getSearchResult({table: getTable(USER_TABLE), _search: { username }}).length ) {
    throw {status: 401, error: `Username ${username} already exists.`};
  }

  const user = addUser({username, email, password, verified: false}, 'users');

  const loginLink = newItem({table:getTable(LOGINLINK_TABLE), item: {userid:user._id}});

  await sendLoginMail({email, loginLink, req});

  // email the loginLink to email
  console.log({emailTask:loginLink});

  return {username, email};
}

export async function sendLoginMail({email, loginLink, req}) {
  const id = loginLink._id;
  const {linkHref, formAction} = newLoginLink(req, id);
  let transporter;

  try {
    transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: MAIL_PORT,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: MAIL_SENDER,
        serviceClient: mailKey.client_id,
        privateKey: mailKey.private_key
      }
    });
  } catch (e) {
    console.warn("Error creating transport", {email, id}, e);
    throw e;
  }
  //console.log("Transporter created", transporter);
  try {
    await transporter.verify();
  } catch (e) {
    console.warn("Error verifying transport", {email, id, transporter}, e);
    throw e;
  }
  //console.log("Transporter verified", transporter);
  const mail = {
    from: MAIL_SENDER,
    to: email,
    subject: `Login now ${new Date}`,
    html: `
      <span>
        Your 1-click login button is:
          <form style="display:inline;" target=_blank method=POST action=${formAction}>
            <input type=hidden name=id value=${id}>
            <button>Login</button>
          </form>
      </span>
      <br>
        Alternately, click this <a target=_blank href=${linkHref}>link to login.</a>
    `,
    text: `
      Your login link is: ${linkHref}
    `
  }
  try {
    await transporter.sendMail(mail);
  } catch (e) {
    console.warn("Error sending mail", {email, mail, id, transporter}, e);
    throw e;
  }
  //console.log("Email sent!", {mail, email, id, transporter});
  console.log("Yay!");
  console.log(`Email sent: ${email}, ${JSON.stringify({mail})}`);
  return {success: true, email, mail, id};
}

function newLoginLink(req, loginId) {
  return {
    formAction: route(req, '/form/action/loginwithlink/redir/profile'),
    linkHref: route(req, `/form/table/${LOGINLINK_TABLE}/${loginId}/with/loginlink`)
  };
}

