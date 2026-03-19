export class LogService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getLogs() {
    try {
      const res = await fetch(`${this.baseURL}/logs`);
      return await res.json();
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }

  async addLog({ action, productId, quantity, details, user }) {
    try {
      const newLog = {
        action,
        productId,
        quantity,
        details,
        user,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(`${this.baseURL}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newLog),
      });

      return await res.json();
    } catch (error) {
      console.error("Error adding log:", error);
    }
  }
}
