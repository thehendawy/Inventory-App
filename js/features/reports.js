import ProductService from "../services/products-services.js";

let productService = new ProductService();
let totalPro = document.querySelector(".totalProduct")
let TotalSupp = document.querySelector(".totalSupplier")
let products = [] ;
let suppliers = [] ;


async function showReports () {
    products = await productService.getAll("products");
    totalPro.innerHTML = products.length;
    suppliers = await productService.getAll("suppliers")
    TotalSupp.innerHTML = suppliers.length;
    
    

    
}

showReports();