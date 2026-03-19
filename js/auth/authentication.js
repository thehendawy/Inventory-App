if (
  !localStorage.getItem("isAuthenticated") ||
  !localStorage.getItem("userId")
) {
  alert("You don't have the privilege to access this page");
  location.assign("../index.html");
}
