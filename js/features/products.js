import { LogService } from "../services/logs-services.js";
import ProductService from "../services/products-services.js";
import { UserService } from "../services/users-services.js";

let productService = new ProductService("http://localhost:3000");
let logService = new LogService("http://localhost:3000");
let userService = new UserService("http://localhost:3000");
let addProductForm = document.getElementById("addProductForm");
let editProductForm = document.getElementById("editProductForm");

async function displayProducts() {
    try {
        let products = await productService.getAll(
            "products?_embed=category&_embed=supplier",
        );

        let tableBody = document.querySelector(".table tbody");
        let totalCountElement = document.querySelector(".totalCount");

        if (!tableBody) {
            console.error("Table body not found");
            return 0;
        }

        let html = "";

        products.forEach((product) => {
            let statusBadge = '';
            if (product.quantity == 0) {
                statusBadge = '<span class="badge text-white bg-secondary">Out of Stock</span>';
            } else if (product.quantity <= product.reorderLevel) {
                statusBadge = '<span class="badge text-white bg-danger">Low Stock</span>';
            } else {
                statusBadge = '<span class="badge text-white bg-success">In Stock</span>';
            }
            html += `
                <tr>
                    <td class="py-3">${product.name}</td>
                    <td class="text-secondary py-3">${product.sku}</td>
                    <td class="py-3 ">${product.category?.name}</td>
                    <td class="py-3">${product.supplier?.name}</td>
                    <td class="py-3">$${product.price}</td>
                    <td class="py-3">${product.quantity}</td>
                    <td class="text-secondary py-3 text-center">${product.reorderLevel}</td>
                    <td class="py-3">${statusBadge}</td>
                    <td class="py-3">
                        <button class="btn btn-sm editBtn"  data-id="${product.id}" >
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm deleteBtn" data-id="${product.id}">
                            <i class="fas fa-trash text-danger"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;

        document.querySelectorAll(".editBtn").forEach((btn) => {
            btn.addEventListener("click", async function () {
                const id = this.dataset.id;
                await openEditModal(id);
            });
        });

        document.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', async function () {
                const id = this.dataset.id;
                await deleteProduct(id);
            });
        });


        if (totalCountElement) {
            totalCountElement.textContent = `A list of all products in your inventory (${products.length} total)`;
        }


    } catch (error) {

        console.error("Error");
        const tableBody = document.querySelector(".table tbody");
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-danger py-5">
                        Failed to load products.
                    </td>
                </tr>
            `;
        }
    }
}
displayProducts();

document.addEventListener("DOMContentLoaded", () => {
    loadCategories('category');
    loadSuppliers('supplier');
});


function generateSKU(productName) {
    const cleanName = productName
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '-');

    const random = Math.floor(Math.random() * 10000);
    const timestamp = Date.now().toString().slice(-4);

    return `${cleanName}-${timestamp}-${random}`;
}


addProductForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    document
        .querySelectorAll("#addProductForm p")
        .forEach((p) => (p.textContent = ""));

    let productName = document.getElementById("productName").value.trim();
    let category = document.getElementById("category").value;
    let supplier = document.getElementById("supplier").value;
    let price = document.getElementById("price").value.trim();
    let quantity = document.getElementById("quantity").value.trim();
    let recorder = document.getElementById("recorder").value.trim();

    let recorderValue = Number(recorder);
    let isValid = true;

    if (!productName) {
        document.getElementById("productNameError").textContent =
            "Product name is required";
        isValid = false;
    } else if (!isNaN(productName)) {
        document.getElementById("productNameError").textContent =
            "Product name cannot be only numbers";
        isValid = false;
    } else if (productName.length < 2) {
        document.getElementById("productNameError").textContent =
            "Product name must be at least 2 characters";
        isValid = false;
    }

    if (!category) {
        document.getElementById("categoryError").textContent =
            "Required Must Have category ";
        isValid = false;
    }

    if (!supplier) {
        document.getElementById("supplierError").textContent =
            "Supplier is Required ";
        isValid = false;
    }

    if (!price || isNaN(price) || Number(price) <= 0) {
        document.getElementById("priceError").textContent = "Enter valid price";
        isValid = false;
    }

    if (!quantity) {
        document.getElementById("quantityError").textContent =
            "Quantity is required";
        isValid = false;
    } else if (isNaN(quantity)) {
        document.getElementById("quantityError").textContent =
            "Quantity must be a number";
        isValid = false;
    } else if (Number(quantity) < 0) {
        document.getElementById("quantityError").textContent =
            "Quantity cannot be negative";
        isValid = false;
    }

    if (recorder === "" || isNaN(recorderValue) || recorderValue < 0) {
        document.getElementById("reorderError").textContent = "Invalid";
        isValid = false;
    }

    if (!isValid) return;

    let sku = generateSKU(productName);
    let status = Number(quantity) <= recorderValue ? "low-stock" : "in-stock";

    let productData = {
        name: productName,
        sku,
        categoryId: category,
        supplierId: supplier,
        price,
        quantity,
        reorderLevel: recorderValue,
        status,
    };

    try {
        let result = await productService.create("products", productData);
        let userId = localStorage.getItem("userId");
        let user = await userService.getLoggedUser(userId);

        await logService.addLog({
            action: "ADD_PRODUCT",
            productId: result.id,
            quantity: quantity,
            details:
                quantity <= recorderValue
                    ? `Added ${productName} `
                    : `Added ${productName}`,
            user: user.name,
        });

        showAlert(" Product added successfully ", "primary");

        setTimeout(() => {
            document.getElementById("addProductModal").style.display = "none";
        }, 7000);
    } catch (error) {
        console.error(error);
        showAlert("Failed to add product", "danger");
    }
});

async function loadCategories(selectId) {
    let res = await fetch('http://localhost:3000/categories');
    let categories = await res.json();

    let select = document.getElementById(selectId);

    select.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        let option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

async function loadSuppliers(selectId) {
    const res = await fetch('http://localhost:3000/suppliers');
    const suppliers = await res.json();

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Supplier</option>';

    suppliers.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = s.name;
        select.appendChild(option);
    });
}

function showAlert(message, type = "primary") {
    let alertBox = document.getElementById("alertBox");
    alertBox.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    alertBox.style.zIndex = "9999";
    alertBox.style.maxWidth = "300px";
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");

    setTimeout(() => {
        alertBox.classList.add("d-none");
    }, 6000);
}



async function openEditModal(id) {
    let product = await productService.getById(`products/${id}?_embed=category&_embed=supplier`);


    await loadCategories('editCategory');
    await loadSuppliers('editSupplier');

    document.getElementById("editProductId").value = product.id;
    document.getElementById("editProductName").value = product.name;
    document.getElementById("editPrice").value = product.price;
    document.getElementById("editQuantity").value = product.quantity;
    document.getElementById("editRecorder").value = product.reorderLevel;
    document.getElementById("editSupplier").value = product.supplierId;
    document.getElementById("editCategory").value = product.category.id;
    document.querySelector(".editSku").value = product.sku;


    let modal = new bootstrap.Modal(
        document.getElementById("editProductModal"),
    );
    modal.show();

}

editProductForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    document.querySelectorAll('#editProductForm p').forEach(p => p.textContent = '');

    let id = document.getElementById('editProductId').value;

    let originalProduct = await productService.getById('products', id);
    console.log(originalProduct);


    let name = document.getElementById('editProductName').value.trim();
    let category = document.getElementById('editCategory').value;
    let supplier = document.getElementById('editSupplier').value;
    let price = document.getElementById('editPrice').value.trim();
    let quantity = document.getElementById('editQuantity').value.trim();
    let recorder = document.getElementById('editRecorder').value.trim();

    let recorderValue = Number(recorder);
    let isValid = true;

    if (!name) { document.getElementById('editProductNameError').textContent = 'Required'; isValid = false; }
    if (!category) { document.getElementById('editCategoryError').textContent = 'Required'; isValid = false; }
    if (!supplier) { document.getElementById('editSupplierError').textContent = 'Required'; isValid = false; }
    if (!price || isNaN(price) || Number(price) <= 0) { document.getElementById('editPriceError').textContent = 'Invalid'; isValid = false; }
    if (!quantity || isNaN(quantity) || Number(quantity) < 0) { document.getElementById('editQuantityError').textContent = 'Invalid'; isValid = false; }
    if (!recorder || isNaN(recorderValue)) { document.getElementById('editReorderError').textContent = 'Invalid'; isValid = false; }

    if (!isValid) return;

    let updatedData = {
        id: originalProduct.id,
        name: name || originalProduct.name,
        sku: originalProduct.sku,
        price: price || originalProduct.price,
        quantity: quantity || originalProduct.quantity,
        reorderLevel: recorderValue || originalProduct.reorderLevel,
        supplierId: supplier || originalProduct.supplierId,
        categoryId: category || originalProduct.categoryId,
    };

    try {
        await productService.update('products', id, updatedData);

        let userId = localStorage.getItem("userId");
        let user = await userService.getLoggedUser(userId);

        await logService.addLog({
            action: 'UPDATE_PRODUCT',
            productId: id,
            quantity: updatedData.quantity,
            details: `Updated ${name || originalProduct.name}`,
            user: user.name
        });

        showAlert('Product updated successfully', 'primary');

        bootstrap.Modal.getInstance(document.getElementById("editProductModal")).hide();
        await displayProducts();

    } catch (error) {
        console.error(error);
        showAlert('Update failed', 'danger');
    }
});









