import nodemailer from 'nodemailer';

import mailKey from '../secrets/dosycorp.com-gsuite-email-key.js';

import {MAIL_SENDER, MAIL_HOST, MAIL_PORT} from '../common.js';

import {
  LOGINLINKS_TABLE, SESSION_TABLE, COOKIE_NAME,
  addUser, newLoginLink
} from '../server.js';

export default async function action({username, password, email}, {getTable, newItem}, req, res) {
  const user = addUser({username, email, password, verified: false}, 'users');

  /**
  const session = newItem({table:getTable(SESSION_TABLE), item: {userid:user._id}});
  res.cookie(COOKIE_NAME, session._id);
  **/

  const loginLink = newItem({table:getTable(LOGINLINKS_TABLE), item: {userid:user._id, href:newLoginLink(req)}});
  await sendLoginMail({email, loginLink});

  // email the loginLink to email
  console.log({emailTask:loginLink});

  return {username, email};
}

export async function sendLoginMail({email, loginLink}) {
  const loginId = loginLink._id;
  let getHref = new URL(loginLink.href);
  let transporter;

  getHref.search = `loginId=${loginId}`;

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
    console.warn("Error creating transport", {email, loginId}, e);
    throw e;
  }
  //console.log("Transporter created", transporter);
  try {
    await transporter.verify();
  } catch (e) {
    console.warn("Error verifying transport", {email, loginId, transporter}, e);
    throw e;
  }
  //console.log("Transporter verified", transporter);
  const mail = {
    from: MAIL_SENDER,
    to: email,
    subject: 'Login to PayMe now',
    html: `
      <span>
        Your 1-click login button is:
          <form style="display:inline;" target=_blank method=POST action=${loginLink.href}>
            <input type=hidden name=loginId value=${loginId}>
            <button>Login</button>
          </form>
      </span>
      <br>
        Alternately, click this <a target=_blank href=${getHref}>link to login.</a>
    `,
    text: `
      Your login link is: ${getHref}
    `
  }
  try {
    await transporter.sendMail(mail);
  } catch (e) {
    console.warn("Error sending mail", {email, mail, loginId, transporter}, e);
    throw e;
  }
  //console.log("Email sent!", {mail, email, loginId, transporter});
  console.log("Yay!");
  console.log(`Email sent: ${email}, ${JSON.stringify({mail})}`);
  return {success: true, email, mail, loginId};
}
