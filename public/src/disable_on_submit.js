// prevent duplicate submission

installDisableOnSubmit();

function installDisableOnSubmit() {
  self.document.addEventListener('submit', disableOnSubmit);
}

function disableOnSubmit(submission) {
  const form = submission.target;
  const action = form.getAttribute('action');

  // do not apply to JSON forms 
    // because 
    // these will no navigate the top level document the page and 
    // instead need to have disabled removed at response
  if ( action.startsWith('/form') || action.endsWith('.html') ) {
    const fieldset = form.querySelector('fieldset');
    const buttons = Array.from(form.querySelectorAll('button'));

    setTimeout(() => {
      if ( fieldset ) {
        fieldset.disabled = true;
      } else if ( buttons.length ) {
        buttons.forEach(b => b.disabled = true);
      } else if ( form.id ) {
        const referredButtons = Array.from(document.querySelectorAll(`button[form="${form.id}"]`)); 
        referredButtons.forEach(b => b.disabled = true);
      }
    }, 0);
  }
}
