import {SupplierService} from "../services/suppliers-services.js";

const service = new SupplierService('http://localhost:3000/suppliers');
const tablebody = document.getElementById("tablebody")
const addNewSupplier = document.getElementById("addNewSupplier")
const formdata = document.getElementById("formdata")

let allSuppliers =  await service.getAllSuppliers()
allSuppliers.reverse()
render(allSuppliers)

/********************validation function***********************/
 function validate(data) {
      
    //name validation
      const supplierName = document.getElementById("supplierName")
      if (data.name == "" || data.name.trim().length < 3) {
        supplierName.classList.add('is-invalid');
        document.getElementById("error-message1").style.display = "none"
        return false
      } else if (!isNaN(data.name)){
        document.getElementById("error-message1").style.display = "block"
        supplierName.classList.remove('is-invalid');
        document.getElementById("error-message1").textContent = "please don't enter numbers only"
        return false
      }else {
        supplierName.classList.remove('is-invalid');
        document.getElementById("error-message1").style.display = "none"
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
        document.getElementById("error-messageaddress").style.display = "none"
        return false

      }else if (!isNaN(data.address)) {
        document.getElementById("error-messageaddress").style.display = "block"
        supplierAddress.classList.remove('is-invalid');
        document.getElementById("error-messageaddress").textContent = "plaese enter your address correctly"
        return false
      } else {
        supplierAddress.classList.remove('is-invalid');
        document.getElementById("error-messageaddress").style.display = "none"
      }
  }

  /********************Render function********************************/
  async function render(data) {

        // Table
        tablebody.innerHTML = data.map(s => `
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

/********************** Search Function ******************************/
async function search(query) {

        let filtered = allSuppliers.filter(s => {
            return s.name.toLowerCase().includes(query.toLowerCase()) || 
            s.phone.includes(query)
        });

        render(filtered); 
    }


/*********************** function for delete supplier ********************/
let idtodelete = null
window.prepareDelete = (id) => {
    idtodelete = id
}

/****************************** function for delete supplier ***********************/
window.idtoEdit = null
window.prepareEdit = async (id) => {
    window.idtoEdit = id
    const supplier = await service.getSupplierById(id);

    document.getElementById("supplierName").value = supplier.name;
    document.getElementById("supplierPhone").value = supplier.phone;
    document.getElementById("supplierEmail").value = supplier.email;
    document.getElementById("supplierAddress").value = supplier.address;

    document.getElementById("addSupplierLabel").innerText = "Edit Supplier";
    document.getElementById("addsuppliercontent").innerText = "Edit an existing supplier in your network.";
    document.getElementById("supplierAddButton").innerText = "Update Changes";

}

/************************* Add Or Update Suppllier ********************************************/
document.getElementById('supplierAddButton').addEventListener('click', async (e) => {

    const formData = {
        name: document.getElementById("supplierName").value,
        phone: document.getElementById("supplierPhone").value,
        email: document.getElementById("supplierEmail").value,
        address: document.getElementById("supplierAddress").value
    };

    // check statment either add or update
    let result;
    let erroeMassage = validate(formData);
    if (erroeMassage == false ) return false

    if (window.idtoEdit) {
        result = await service.updateSupplier(window.idtoEdit, formData);
        if (result !== false) {

        window.idtoEdit = null;
        }
    } else {
        result = await service.addSupplier(formData);
    }

});

/************************* delete supplier *****************************************/
document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {

    console.log(idtodelete)
    const result = await service.deleteSupplier(idtodelete);
})

/************************************ Search input ************************************/

let searchInput = document.getElementById('searchSupplier');

searchInput.addEventListener('input', (e) => {
    let query = e.target.value;
    search(query);
});

/***************************** Reset form ******************************************/
addNewSupplier.addEventListener("click", (e)=>{
    formdata.reset()
})



