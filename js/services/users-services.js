export class UserService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async signin(email, password) {
    try {
      const res = await fetch(
        `${this.baseURL}/users?email=${email}&password=${password}`,
      );
      return await res.json();
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }

  async getLoggedUser(id) {
    try {
      const res = await fetch(`${this.baseURL}/users/${id}`);
      return await res.json();
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }
}
