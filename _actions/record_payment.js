// imports
  import stripe from 'stripe';

  import mailKey from '../secrets/domain-gsuite-email-key.js';
  import {T} from 'jtype-system';
  import stripeKey from '../secrets/stripe-key.js';
  import {
    DEBUG,
    PAYMENT_MODE,
    PAYMENT_TYPES,
    USER_TABLE, 
    TRANSACTION_TABLE,
    MAIL_SENDER, 
    MAIL_HOST, MAIL_PORT,
  } from '../common.js';
  import {
    route
  } from '../helpers.js';
  import {beamsplitter} from 'beamsplitter';

// constants
  const Stripe = stripe(stripeKey[PAYMENT_MODE], {apiVersion: ''});
  const {
    webhookSigningSecret:{
      [PAYMENT_MODE]: webhookSigningSecret
    }
  } = stripeKey;

export default async function action(payload, db, req, res) {
  const sig = req.headers['stripe-signature'];
  DEBUG.INFO && console.log({payload});

  const rawPayload = req.rawBody;

  let transaction, event;

  try {
    event = Stripe.webhooks.constructEvent(rawPayload, sig, webhookSigningSecret);
  } catch (e) {
    throw { status: 401, error: `Could not record payment: ${e.message}` };
  }

  switch ( event.type ) {
    case 'checkout.session.completed': {
      const session = event.data.object;

      if ( session.payment_status == 'paid' ) {
        transaction = await recordPayment(session, db);
      }
    }; break;
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;

      transaction = await recordPayment(session, db);
    }; break;
    default: {
      DEBUG.INFO && console.log({
        webhook: {
          path: req.path,
          eventType: event.type,
          info: `Nothing to do for this event type.`
        }
      });
    }; break;
  }

  res.status(200);
}

async function recordPayment(session, db) {
  const {customer} = session;
  const transaction = {
    stripeCustomerId: customer,
    valence: 1, // deposit (someone is paying us)
  };

  let userid;

  // get the transaction type, and the amount, and description

  try {
    ({metadata:{userid}} = session);
  } catch(e) {
    throw { status: 400, error: `Could not identify userid for checkout session. ${e.message}` };
  }

  transaction.currency = session.currency;

  switch(session.mode) {
    case 'payment': {
      transaction.type = 'onetime-payment';
      if ( session.payment_intent ) {
        const expandedSession = await Stripe.checkout.sessions.retrieve(session.id, {
          expand: ['payment_intent.invoice']
        });
        const {payment_intent} = expandedSession;
        if ( session.amount_total ) {
          transaction.amount100ths = session.amount_total
        } else {
          if ( payment_intent.status == 'succeeded' ) {
            transaction.amount100ths = payment_intent.amount_received;
          } else {
            // nothing to do as no money comes to us
            return;
          }
        }

        transaction.description = {
          detail: `
            payment_intent.description: ${payment_intent.description || ''}
            payment_intent.receipt_email ${payment_intent.receipt_email}
          `.slice(0,400)
        };

        transaction.createdAt = payment_intent.created * 1000;

        try {
          transaction.priceId = payment_intent.invoice.lines.data[0].price.id;
        } catch(e) {
          DEBUG.INFO && console.info(`Couldn't get priceId`, {transaction}, e);
          DEBUG.INFO && console.log(JSON.stringify({expandedSession}));
        }

        if ( ! transaction.priceId ) {
          let data;
          try {
            ({data} = await Stripe.checkout.sessions.listLineItems(
              session.id,
              {
                limit:1
              }
            ));
            transaction.priceId = data[0].price.id;
          } catch(e) {
            DEBUG.INFO && console.info(`Couldn't get priceId`, {data}, e);
          }
        }
      } else {
        throw { 
          status: 400, 
          error: `Mode is payment but no payment_intent ID is present.` 
        };
      }
    }; break;
    case 'subscription': {
      transaction.type = 'subscription';
      if ( session.subscription ) {
        const expandedSession = await Stripe.checkout.sessions.retrieve(session.id, {
          expand: ['subscription.latest_invoice']
        });
        const {subscription} = expandedSession;
        if ( session.amount_total ) {
          transaction.amount100ths = session.amount_total
        } else {
          if ( subscription.status == 'active' ) {
            if ( subscription.latest_invoice ) {
              if ( subscription.latest_invoice.status == 'paid' ) {
                transaction.amount100ths = subscription.latest_invoice.total;
              } else {
                return;
              }
            } else {
              transaction.amount100ths = subscription
                .items
                .data[0]
                .price
                .unit_amount * subscription.quantity
            }
          } else {
            // nothing to do as no money comes to us
            return;
          }
        }

        transaction.createdAt = subscription.created * 1000;

        transaction.description = {
          detail: `
            collection_method: ${subscription.collection_method}
          `
        };

        try {
          transaction.priceId = subscription.items.data[0].price.id
        } catch(e) {
          DEBUG.INFO && console.info(`Couldn't get subscription priceId`, transaction, expandedSession);
        }
      } else {
        throw { 
          status: 400, 
          error: `Mode is subscription but no subscription ID is present.` 
        };
      }
    }; break;
    default: {
      throw { status: 400, error: `Only payment and subscription transactions are supported.` }
    }; 
  }

  // add the txId
  transaction.txId = beamsplitter(JSON.stringify({transaction}), transaction.created/1000).toString(16);

  const recordedPayment = db.newItem({
    table: db._getTable(TRANSACTION_TABLE), 
    userid, 
    item: transaction
  });

  console.info(`Payment: ${JSON.stringify(recordedPayment,null,2)} successfully recorded.`);

  return recordedPayment;
}

