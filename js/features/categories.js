import { CategoriesService } from "../services/categories-services.js";
const table_body = document.querySelector(".table-body");
const input_name = document.querySelector(".input-name");
const input_description = document.querySelector(".input-description");
const myForm = document.querySelector("#myForm");
const errMessage = document.querySelector(".err");
const deleteModal = document.getElementById("deleteConfirmModal");
const btn_delete = document.querySelector(".btn-delete");
let idForDeleteCategory = null;

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
        <button class="btn  btn-sm edit-btn" data-title="edit"><i class="fa-solid fa-pen"></i></button>
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
