export class SupplierService {
  constructor(Url) {
    this.Url = Url;
  }

  // validation

  validate(data) {
      
    //name validation
      const supplierName = document.getElementById("supplierName")
      if (data.name == "" || data.name.trim().length < 3) {
        supplierName.classList.add('is-invalid');
        return false
      } else {
        supplierName.classList.remove('is-invalid');
      }

      // Phone validation
      const phoneRegex = /^01[0125][0-9]{8}$/;
      const supplierPhone = document.getElementById("supplierPhone")
      if (!phoneRegex.test(data.phone)) {
          supplierPhone.classList.add('is-invalid');
        return false
      } else {
        supplierPhone.classList.remove('is-invalid');
      }

      //email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const supplierEmail = document.getElementById("supplierEmail")
      if (!emailRegex.test(data.email)) {
          supplierEmail.classList.add('is-invalid');
        return false
      } else {
        supplierEmail.classList.remove('is-invalid');
      }

      // Address validation
      const supplierAddress = document.getElementById("supplierAddress")
      if (data.address == "" || data.address.trim().length < 4) {
          supplierAddress.classList.add('is-invalid');
        return false
      } else {
        supplierAddress.classList.remove('is-invalid');
      }
  }


  async addSupplier(formData) {

    let erroeMassage = this.validate(formData);
    if (erroeMassage == false ) return false

    try {

    const suppliersnumbers = await fetch(this.Url);
    const data = await suppliersnumbers.json();
    console.log(data)

      const response = await fetch(this.Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("could not connect to server");

      const result = await response.json();
      console.log("supplier had added correctly ✅");
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

            alert(`suppliers of ${id} id has been deleted succesfully✅`);
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

  async updateSupplier(id, updatedData) {

    let erroeMassage = this.validate(updatedData);
    if (erroeMassage == false ) return false;

      const response = await fetch(`${this.Url}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
      });
  }


}

export class SupplierTable {
    constructor(Url, tableBodyId) {
        this.Url = Url;
        this.tableBody = document.getElementById(tableBodyId);
    }

    async render() {
        const response = await fetch(this.Url);
        const data = await response.json();
        console.log(data)

        // Table
        this.tableBody.innerHTML = data.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.phone}</td>
                <td><a href="mailto:${s.email}">${s.email}</a></td>
                <td>${s.address}</td>
                <td class="text-start">
                    <i
                        class="fa-solid fa-edit mx-2 text-secondary"
                        style="cursor: pointer"
                        data-bs-toggle="modal"
                        data-bs-target="#supplierInputs"
                        data-bs-whatever="add-supplier"
                        onclick="prepareEdit('${s.id}')"
                      ></i>
                    <i
                        class="fa-solid fa-trash mx-2 text-danger"
                        style="cursor: pointer"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteSupplierModal"
                        onclick="prepareDelete('${s.id}')"
                      ></i>
                </td>
            </tr>
        `).join('');
        
        // تحديث العدد الإجمالي (suppliersLength)
        document.getElementById('countofsuppleries').textContent = `Your supplier network (${data.length} suppliers)`;
    }

    // search method
    async search(query) {
        let response = await fetch(this.Url);
        let data = await response.json();
        console.log(query)

        let filtered = data.filter(s => {
            return s.name.toLowerCase().includes(query.toLowerCase()) || 
            s.phone.includes(query)
        });

        this.renderData(filtered); 
    }

    // Display result of search in table
    renderData(suppliers) {
        this.tableBody.innerHTML = suppliers.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.phone}</td>
                <td><a href="mailto:${s.email}">${s.email}</a></td>
                <td>${s.address}</td>
                <td class="text-start">
                      <i
                        class="fa-solid fa-edit mx-2 text-secondary"
                        style="cursor: pointer"
                        data-bs-toggle="modal"
                        data-bs-target="#supplierInputs"
                        data-bs-whatever="add-supplier"
                        onclick="prepareEdit('${s.id}')"
                      ></i>
                      <i
                          class="fa-solid fa-trash mx-2 text-danger"
                          style="cursor: pointer"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteSupplierModal"
                          onclick="prepareDelete('${s.id}')"
                        ></i>
                  </td>
            </tr>
        `).join('');
        
        // Display numbers of search result
        const countLabel = document.getElementById('countofsuppleries');
        if (countLabel) countLabel.innerText = `Search results: (${suppliers.length})`;
    }

}



