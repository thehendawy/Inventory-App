export class PurchaseOrdersService {
  constructor(baseURL = "http://localhost:3000") {
    this.baseURL = baseURL;
  }

  async getAllPurchaseOrders() {
    try {
      const res = await fetch(
        `${this.baseURL}/purchaseOrders?_embed=product&_embed=supplier`,
      );
      return await res.json();
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }

  async createNewOrder(data) {
    try {
      let response = await fetch(`${this.baseURL}/purchaseOrders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }

  async updateOrder(id, data) {
    try {
      const response = await fetch(`${this.baseURL}/purchaseOrders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  }
}
