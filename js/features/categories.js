import { CategoriesService } from "../services/categories-services.js";
let table_body = document.querySelector(".table-body");

let getCategories = async () => {
  try {
    const data = await CategoriesService.getAll();
    return data;
  } catch (err) {
    console.log(err);
  }
};
let categoriesData = await getCategories();

let displayCategories = (data) => {
  let allRows = "";
  data.forEach(function (el) {
    let tr = `
        <tr>
        <td class="py-3">${el.name}</td>
        <td class="text-secondary py-3">${el.description}</td>
        <td class="py-3" >${el.products.length}</td>
        <td class="py-3">
        <button class="btn  btn-sm"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm"><i class="fas fa-trash text-danger"></i></button>
        </td>
        </tr>    
        `;
    allRows += tr;
  });
  table_body.insertAdjacentHTML("beforeend", allRows);
};
displayCategories(categoriesData);
