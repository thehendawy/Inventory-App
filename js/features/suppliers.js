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

// function for delete supplier
window.idtoEdit = null
window.prepareEdit = async (id) => {
    window.idtoEdit = id
    const supplier = await service.getSupplierById(id);

    // 2. ملء حقول الفورم بالبيانات الحالية (نفس فورم الإضافة)
    document.getElementById("supplierName").value = supplier.name;
    document.getElementById("supplierPhone").value = supplier.phone;
    document.getElementById("supplierEmail").value = supplier.email;
    document.getElementById("supplierAddress").value = supplier.address;

    // 3. تغيير عنوان المودال وزرار الحفظ (اختياري عشان المستخدم ميتوهش)
    document.getElementById("addSupplierLabel").innerText = "Edit Supplier";
    document.getElementById("addsuppliercontent").innerText = "Edit an existing supplier in your network.";
    document.getElementById("supplierAddButton").innerText = "Update Changes";

}


document.getElementById('supplierAddButton').addEventListener('click', async (e) => {

    // سحب البيانات من الـ Inputs اللي في صورة الفورم
    const formData = {
        name: document.getElementById("supplierName").value,
        phone: document.getElementById("supplierPhone").value,
        email: document.getElementById("supplierEmail").value,
        address: document.getElementById("supplierAddress").value
    };

    // check statment either add or update
    if (window.idtoEdit) {
        let result = await service.updateSupplier(window.idtoEdit, formData);
        if (result !== false) {

        alert("supplier updated successfully");
        window.idtoEdit = null;
        }
    } else {
        
        result = await service.addSupplier(formData);
        alert("a new supplier has added");
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



