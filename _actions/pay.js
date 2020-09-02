// imports
  import stripe from 'stripe';
  import nodemailer from 'nodemailer';

  import mailKey from '../secrets/domain-gsuite-email-key.js';
  import stripeKey from '../secrets/stripe-key.js';
  import {
    PAYMENT_MODE,
    PAYMENT_TYPES,
    USER_TABLE, 
    MAIL_SENDER, 
    MAIL_HOST, MAIL_PORT,
    LOGINLINK_TABLE, 
  } from '../common.js';
  import {
    route
  } from '../helpers.js';

// constants
  const Stripe = stripe(stripeKey[PAYMENT_MODE], {apiVersion: ''});

export default async function action({price, mode}, {_getTable, getItem}, req, res) {
  const {userid} = req.authorization.session;

  const user = getItem({table:_getTable(USER_TABLE), id:userid});

  if ( ! user ) {
    throw  {status: 400, error: `User with id ${userid} does not exist`};
  }

  const {stripeCustomerID} = user;

  const checkout_session = await createStripeCheckoutSession({stripeCustomerID, price, mode, userid}, req);

  return {sessionId: checkout_session.id};
}

async function createStripeCheckoutSession({stripeCustomerID, price, mode, userid}, req) {
  const checkout_session = await Stripe.checkout.sessions.create({
    mode,
    customer: stripeCustomerID,
    line_items: [{
      price,
      quantity: 1
    }],
    payment_method_types: PAYMENT_TYPES,
    success_url: route(req, `/redirected/message/success_payment/with/success_payment`),
    cancel_url: route(req, `/redirected/message/cancel_payment/with/error`)
  });

  console.log({checkout_session});

  return checkout_session;
}
