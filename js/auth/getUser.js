import { UserService } from "../services/users-services.js";
const userService = new UserService("http://localhost:3000");

async function getUser() {
  const user = await userService.getLoggedUser(localStorage.getItem("userId"));

  if (user) return user.name;
  else return "Not Exist";
}

const username = await getUser();

document.querySelector("#username").innerHTML = username;
