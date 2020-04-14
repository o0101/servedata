import nodemailer from 'nodemailer';

import mailKey from '../secrets/dosycorp.com-gsuite-email-key.js';

import {MAIL_SENDER, MAIL_HOST, MAIL_PORT} from '../common.js';

const NOT_AUTHORIZED = {error: 'No such user or password incorrect.'};

export default async function action({email}, {getTable, newItem, getSearchResult}, req, res) {
  console.log("Now we should send email with login link using nodemailer");
  const table = getTable("login-links");
  console.log("Should check that email is a valid account first?");
  console.log("Should check save IP address?");
  const loginLink = newItem({table, item: {email, date: Date.now()}});
  await sendLoginMail({email, loginId:loginLink._id});
  return {email};
}

async function sendLoginMail({email, loginId}) {
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
          <form style="display:inline;" target=_blank method=POST action=http://boogeh.com:8080/form/action/login_from_link/with/profile>
            <input type=hidden name=loginLinkId value=${loginId}>
            <button>Login</button>
          </form>
      </span>
      <br>
        Alternately, click this <a target=_blank href=http://boogeh.com:8080/link-login.html?loginId=${loginId}>link to login.</a>
    `,
    text: `
      Your login link is: http://boogeh.com:8080/link-login.html?loginId=${loginId}
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

