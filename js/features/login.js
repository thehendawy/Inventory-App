import { UserService } from "../services/users-services.js";
const userService = new UserService("http://localhost:3000");

// *--------|> Selectors
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const loginBtn = document.querySelector("#loginBtn");
const alertErr = document.querySelector("#alertErr");

// &--------|> Functions
async function login() {
  let email = emailInput.value;
  let password = passwordInput.value;

  const res = await userService.signin(email, password);

  if (res.length === 0) {
    alertErr.style.opacity = 1;
    setTimeout(() => {
      alertErr.style.opacity = 0;
    }, 2000);
  } else {
    alertErr.style.opacity = 0;
    localStorage.setItem("isAuthenticated", true);
    localStorage.setItem("userId", res[0].id);
    location.assign("../pages/dashboard.html");
  }
}

// ~--------|> Events
loginBtn.addEventListener("click", () => {
  login();
});
