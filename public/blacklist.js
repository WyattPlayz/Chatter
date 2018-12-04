if (!localStorage) {
  alert('NOT SUPPORTED')
  location.reload()
}

if (!localStorage.getItem('blacklisted')) {
  localStorage.setItem('blacklisted', true);
  location.reload()
}