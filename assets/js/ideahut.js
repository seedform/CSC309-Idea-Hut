/*
  Custom animations
*/
function autoClose(selector, delay) {
   var notif = $(selector).alert();
   window.setTimeout(function() { notif.alert('close') }, delay);
}
autoClose('#success-alert', 2000);
autoClose('#error-alert', 2000);