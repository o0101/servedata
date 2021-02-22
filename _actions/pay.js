// imports
  import stripe from 'stripe';
  import nodemailer from 'nodemailer';

  import mailKey from '../secrets/domain-gsuite-email-key.js';
  import {T} from 'jtype-system';

  import stripeKey from '../secrets/stripe-key.js';
  import {
    DEBUG,
    PAYMENT_MODE,
    PAYMENT_TYPES,
    USER_TABLE, 
  } from '../common.js';
  import {
    route
  } from '../helpers.js';

// constants
  const Stripe = stripe(stripeKey[PAYMENT_MODE], {apiVersion: ''});

export default async function action({price, mode, quantity}, {_getTable, getItem}, req, res) {
  const {userid} = req.authorization.session;

  const user = getItem({table:_getTable(USER_TABLE), id:userid});

  if ( ! user ) {
    throw  {status: 400, error: `User with id ${userid} does not exist`};
  }

  const {stripeCustomerID} = user;

  const checkout_session = await createStripeCheckoutSession({stripeCustomerID, price, quantity, mode, userid}, req);

  return {sessionId: checkout_session.id};
}

async function createStripeCheckoutSession({stripeCustomerID, price, quantity, mode, userid}, req) {
  quantity = parseInt(quantity);
  T.guard(T`Integer`, quantity);

  const checkout_session = await Stripe.checkout.sessions.create({
    mode,
    customer: stripeCustomerID,
    line_items: [{
      price,
      quantity
    }],
    payment_method_types: PAYMENT_TYPES,
    success_url: route(req, `/redirected/message/success_payment/with/success_payment`),
    cancel_url: route(req, `/redirected/message/cancel_payment/with/error`),
    metadata: {
      userid
    }
  });

  DEBUG.INFO && console.log({checkout_session});

  return checkout_session;
}
