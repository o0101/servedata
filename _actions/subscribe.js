// imports
	import stripe from 'stripe';
  import nodemailer from 'nodemailer';

  import mailKey from '../secrets/domain-gsuite-email-key.js';
  import stripeKey from '../secrets/stripe-key.js'
  import {
    PAYMENT_MODE,
    USER_TABLE, 
    MAIL_SENDER, 
    MAIL_HOST, MAIL_PORT,
    LOGINLINK_TABLE, 
  } from '../common.js';
  import {
    addUser, route
  } from '../helpers.js';

// consts
  const PRICE = {
    'Element Animal Membership': 'price_HNBnk3QEXIgjac'
  };

export default async function action({priceName}, {getTable, newItem, getSearchResult}, req, res) {
	const stripe = (await import('stripe'))(stripeKey[PAYMENT_MODE]);
  const priceId = PRICE[priceName];
	const session = await stripe.checkout.sessions.create({
		payment_method_types: ['card'],
		line_items: [{
			price: priceId,
			quantity: 1,
		}],
		mode: 'subscription',
		success_url: route(req, '/success?session_id={CHECKOUT_SESSION_ID}'),
		cancel_url: route(req, '/cancel'),
	});
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


