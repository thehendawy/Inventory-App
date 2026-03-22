import {SupplierService, SupplierTable} from "../services/suppliers-services.js";

// عنوان الـ API بتاعك (مثلاً لو شغال JSON Server أو Node.js)
const service = new SupplierService('http://localhost:3000/suppliers');
const table = new SupplierTable('http://localhost:3000/suppliers', 'tablebody');
table.render();

// function for delete supplier
let idtodelete = null
    window.prepareDelete = (id) => {
         idtodelete = id
    }


document.getElementById('supplierAddButton').addEventListener('click', async (e) => {
    // سحب البيانات من الـ Inputs اللي في صورة الفورم
    const formData = {
        name: document.getElementById("supplierName").value,
        phone: document.getElementById("supplierPhone").value,
        email: document.getElementById("supplierEmail").value,
        address: document.getElementById("supplierAddress").value
    };

    // تنفيذ عملية الإضافة والتسميع
    const result = await service.addSupplier(formData);
    
    if (result) {
        table.render();
        alert("تمت الإضافة بنجاح!");
        
    }

});


document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {

    console.log(idtodelete)
    const result = await service.deleteSupplier(idtodelete);
})

// Search input

let searchInput = document.getElementById('searchSupplier'); // تأكد من الـ ID في الـ HTML

searchInput.addEventListener('input', (e) => {
    let query = e.target.value;
    table.search(query); // استدعاء دالة البحث من الكلاس
});



