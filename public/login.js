var userid = self.id
if (userid == "logout") {
  localStorage.setItem('id', false);
} else {
  localStorage.setItem('id', userid);
}
location.href="/chat/" + userid