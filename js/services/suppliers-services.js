export class SupplierService {
  constructor(Url) {
    this.Url = Url;
  }

  // Get all suppliers method
  async getAllSuppliers(){
    try {
      const suppliersnumbers = await fetch(this.Url);
      const data = await suppliersnumbers.json();
      return data;
    } catch (error) {
      console.error("couldn't connect to server❌", error.message);
    }
  }


  // Add a new Supplier method
  async addSupplier(formData) {
    try {
      const response = await fetch(this.Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("could not connect to server");

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("error had happended ❌", error.message);
    }

  }

  // delete supplier method
  async deleteSupplier(id) {
        try {
            const response = await fetch(`${this.Url}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Delete proccess has failed");
            }

            return true;

        } catch (error) {
            console.error("an Error has happened❌", error.message);
            return false;
        }
    }

  // Edit existing supplier method
  async getSupplierById(id) {
      const response = await fetch(`${this.Url}/${id}`);
      return await response.json();
  }

  // Update Supplier
  async updateSupplier(id, updatedData) {

      const response = await fetch(`${this.Url}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
      });
      return await response.json()
  }

}
