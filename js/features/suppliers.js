import {SupplierService, SupplierTable} from "../services/suppliers-services.js";

const service = new SupplierService('http://localhost:3000/suppliers');
const table = new SupplierTable('http://localhost:3000/suppliers', 'tablebody');
table.render();

// function for delete supplier
let idtodelete = null
window.prepareDelete = (id) => {
    idtodelete = id
}

// function for delete supplier
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


document.getElementById('supplierAddButton').addEventListener('click', async (e) => {

    const formData = {
        name: document.getElementById("supplierName").value,
        phone: document.getElementById("supplierPhone").value,
        email: document.getElementById("supplierEmail").value,
        address: document.getElementById("supplierAddress").value
    };

    // check statment either add or update
    let result;
    if (window.idtoEdit) {
        result = await service.updateSupplier(window.idtoEdit, formData);
        if (result !== false) {

        alert("supplier updated successfully");
        window.idtoEdit = null;
        }
    } else {
        
        result = await service.addSupplier(formData);
        alert("a new supplier has added");
    }

});

// delete supplier
document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {

    console.log(idtodelete)
    const result = await service.deleteSupplier(idtodelete);
})

// Search input

let searchInput = document.getElementById('searchSupplier');

searchInput.addEventListener('input', (e) => {
    let query = e.target.value;
    table.search(query);
});



