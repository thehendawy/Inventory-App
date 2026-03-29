import { CategoriesService } from "../services/categories-services.js";
const table_body = document.querySelector(".table-body");
const input_name = document.querySelector(".input-name");
const input_description = document.querySelector(".input-description");
const myForm = document.querySelector("#myForm");
const myFormUpdate = document.querySelector("#myFormUpdate");
const errMessage = document.querySelector(".err");
const deleteModal = document.getElementById("deleteConfirmModal");
const updateModal = document.getElementById("updateProductModal");
const btn_delete = document.querySelector(".btn-delete");
let idForDeleteCategory = null;
let idForUpdateCategory = null;
let nameForUpdateCategory = null;
let descriptionForUpdateCategory = null;
let productsLength = null;

let getCategories = async () => {
  try {
    const data = await CategoriesService.getAll();
    if (!data || data.length === 0) return null;

    displayCategories(data);
  } catch (err) {
    errMessage.textContent = `Try Again ${err.message}`;
  }
};
getCategories();

// Show Data at table
function displayCategories(data) {
  let allRows = "";

  data.forEach(function (el) {
    let tr = /* html */ `
        <tr>
        <td class="py-3">${el.name}</td>
        <td class="text-secondary py-3">${el.description}</td>
        <td class="py-3" >${el.products.length}</td>
        <td class="py-3 p-btn">
        <button class="btn  btn-sm edit-btn" data-title="edit" data-bs-toggle="modal" data-bs-target="#updateProductModal" data-id="${el.id}" data-name="${el.name}" data-description="${el.description}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm delete-btn" data-title="delete" data-bs-toggle="modal" data-bs-target="#deleteConfirmModal" data-id="${el.id}" data-prod="${el.products.length}"><i class="fas fa-trash text-danger"></i></button>
        </td>
        </tr>    
        `;
    allRows += tr;
  });
  table_body.insertAdjacentHTML("beforeend", allRows);
}

// Add New Category
myForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let catName = document.getElementById("catName");
  let catDesc = document.getElementById("catDesc");

  if (
    !ValidtionForm(catName, catDesc, input_name.value, input_description.value)
  )
    return false;

  let categoryName = input_name.value;
  let categoryDescription = input_description.value;

  let categoryData = {
    name: categoryName,
    description: categoryDescription,
  };

  await CategoriesService.addNewCategory(categoryData);

  const newCategories = await getCategories();
  displayCategories(newCategories);
});

// Form Validtion

let ValidtionForm = (catName, catDesc, nameValue, descValue) => {
  let isValid = true;

  catName.textContent = "";
  catDesc.textContent = "";

  if (nameValue.trim() === "") {
    catName.textContent = "Category Name Is Required";
    isValid = false;
  }

  if (descValue.trim() === "") {
    catDesc.textContent = "Category Description Is Required";
    isValid = false;
  }

  return isValid;
};

// delete Category
deleteModal.addEventListener("show.bs.modal", (e) => {
  const button = e.relatedTarget;
  productsLength = button.getAttribute("data-prod");
  if (productsLength > 0) {
    showAlert(
      "You should get rid of products first before deleting this category!",
      "danger",
    );

    e.preventDefault();
    return;
  }
  idForDeleteCategory = button.getAttribute("data-id");
});

btn_delete.addEventListener("click", async () => {
  await CategoriesService.deleteCategory(idForDeleteCategory);

  const modalInstance = bootstrap.Modal.getInstance(deleteModal);
  modalInstance.hide();

  const newCategories = await getCategories();
  displayCategories(newCategories);
});

// Update Category
updateModal.addEventListener("show.bs.modal", (e) => {
  const button = e.relatedTarget;

  idForUpdateCategory = button.getAttribute("data-id");
  nameForUpdateCategory = button.getAttribute("data-name");
  descriptionForUpdateCategory = button.getAttribute("data-description");

  document.getElementById("updName").value = nameForUpdateCategory;
  document.getElementById("updDescription").value =
    descriptionForUpdateCategory;
});

myFormUpdate.addEventListener("submit", async (e) => {
  e.preventDefault();

  let catName = document.getElementById("catNameUp");
  let catDesc = document.getElementById("catDescUp");

  const nameInput = document.getElementById("updName");
  const descInput = document.getElementById("updDescription");

  if (!ValidtionForm(catName, catDesc, nameInput.value, descInput.value))
    return false;

  let categoryData = {
    name: nameInput.value,
    description: descInput.value,
  };

  await CategoriesService.updateCategory(idForUpdateCategory, categoryData);

  const newCategories = await getCategories();
  displayCategories(newCategories);
});

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
