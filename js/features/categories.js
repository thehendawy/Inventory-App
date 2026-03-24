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

let getCategories = async () => {
  try {
    const data = await CategoriesService.getAll();
    if (!data || data.length === 0) {
      throw new Error(`*Something wrong!`);
    }
    displayCategories(data);
  } catch (err) {
    console.log(err);
    errMessage.textContent = `Try Again ${err.message}`;
  }
};
getCategories();

// Show Data at table
function displayCategories(data) {
  let allRows = "";
  // table_body.innerHTML = "";

  data.forEach(function (el) {
    let tr = /* html */ `
        <tr>
        <td class="py-3">${el.name}</td>
        <td class="text-secondary py-3">${el.description}</td>
        <td class="py-3" >${el.products.length}</td>
        <td class="py-3 p-btn">
        <button class="btn  btn-sm edit-btn" data-title="edit" data-bs-toggle="modal" data-bs-target="#updateProductModal" data-id="${el.id}" data-name="${el.name}" data-description="${el.description}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm delete-btn" data-title="delete" data-bs-toggle="modal" data-bs-target="#deleteConfirmModal" data-id="${el.id}"><i class="fas fa-trash text-danger"></i></button>
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

  if (input_name.value == "" || input_description.value == "") return;

  let categoryName = input_name.value;
  let categoryDescription = input_description.value;

  let categoryData = {
    name: categoryName,
    description: categoryDescription,
  };

  try {
    await CategoriesService.addNewCategory(categoryData);

    const newCategories = await getCategories();
    displayCategories(newCategories);

    input_name.value = "";
    input_description.value = "";
  } catch (err) {
    console.log(err.message);
    errMessage.textContent = err.message;
  }
});

// delete Category
deleteModal.addEventListener("show.bs.modal", (e) => {
  const button = e.relatedTarget;
  idForDeleteCategory = button.getAttribute("data-id");
});
btn_delete.addEventListener("click", async () => {
  try {
    await CategoriesService.deleteCategory(idForDeleteCategory);

    const modalInstance = bootstrap.Modal.getInstance(deleteModal);
    modalInstance.hide();

    const newCategories = await getCategories();
    displayCategories(newCategories);
  } catch (err) {
    errMessage.textContent = `Something wrong + ${err.message}`;
  }
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

  const nameInput = document.getElementById("updName");
  const descInput = document.getElementById("updDescription");

  if (!nameInput.value.trim() || !descInput.value.trim()) return;

  let categoryData = {
    name: nameInput.value,
    description: descInput.value,
  };

  try {
    await CategoriesService.updateCategory(idForUpdateCategory, categoryData);

    const newCategories = await getCategories();
    displayCategories(newCategories);

    bootstrap.Modal.getInstance(document.getElementById("updateModal")).hide();
    nameInput.value = "";
    descInput.value = "";
  } catch (err) {
    console.log(err.message);
    errMessage.textContent = err.message;
  }
});
