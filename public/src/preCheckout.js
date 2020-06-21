import {loadStripe} from './web_modules/@stripe/stripe-js.js';

async function init() {
  const stripe = await loadStripe('pk_test_WHuL9mvNe6xYIYnpaAcwQlQi00XyMv7TDO');
  console.log({stripe});
}

init();
