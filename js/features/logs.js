import ProductService from "../services/products-services.js";
import { LogService } from "../services/logs-services.js";
let product = new ProductService("http://localhost:3000");
let service = new LogService("http://localhost:3000");

const tablebody = document.getElementById("tablebody")
const selecticon = document.getElementById("selecticon")
const searchInput = document.getElementById("searchInput")


/********************** Get all Logs**************************************/
let data = await service.getLogs()
data.reverse()
console.log(data)

/********************* numbers of todayActivities ************************************** */
function getTodayActivities(allLogs) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = allLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        
        return logDate.getTime() === today.getTime();
    });

    const activitiesCountElement = document.getElementById("activitiesCountElement");
    activitiesCountElement.innerText = todayLogs.length;

    return todayLogs.length;
}
getTodayActivities(data)

/************************* low stock alert function ********************/
async function lowStockAlert(){

    let allProducts = await product.getAll("products")
    for(let item of allProducts){
      if (parseInt(item.quantity) <= parseInt(item.reorderLevel)){
        const alreadyLogged = data.some(log => 
                log.productId === item.id && 
                log.action === "Low Stock Alert"
            );
            if (!alreadyLogged) {
                await service.addLog({
                    action: "Low Stock Alert",
                    productId: item.id,
                    quantity: item.quantity,
                    details: "Product reached reorder level",
                    user: "System"
                    
                });
      }
    }
}
console.log(allProducts)
}
lowStockAlert()

/********************** Stock added today ************************************* */
function getTodayStockAdded(alllogs) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let stockadded = alllogs.filter(ele=>{
      return ele.action == "Stock Added" || ele.action == "Order Received" ||  ele.action == "ADD_PRODUCT"|| ele.action == "Receive Purchase Order"
    })
    console.log(stockadded)
    const todayLogs = stockadded.filter(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        
        return logDate.getTime() === today.getTime();
    });
    console.log(todayLogs)

    let numOfAdded = todayLogs.reduce((acc, ele) => {return acc + ele.quantity},0)
    console.log(numOfAdded)

    const countofstockadded = document.getElementById("countofstockadded");
    countofstockadded.textContent = `+${numOfAdded}`;
}
getTodayStockAdded(data)

/********************** Stock removed today ************************************* */
function getTodayStockRemoved(alllogs) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let stockremoved = alllogs.filter(ele=>{
      return ele.action == "Stock Removed"
    })
    console.log(stockremoved)
    const todayLogs = stockremoved.filter(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        
        return logDate.getTime() === today.getTime();
    });
    console.log(todayLogs)

    let numOfRemoved = todayLogs.reduce((acc, ele) => {return acc + ele.quantity},0)
    console.log(numOfRemoved)

    const countofstockremoved = document.getElementById("countofstockremoved");
    countofstockremoved.textContent = `-${numOfRemoved}`;
}
getTodayStockRemoved(data)
/********************** Render Function ******************************/
function getActionBadge(data){

  switch (data.toUpperCase()) {

    case 'ADD PRODUCT':
    case 'ADD_PRODUCT':
      return `<span class="badge add rounded-pill bg-primary px-3 shadow-sm" data-type="add">+ Add Product</span>`;

    case 'UPDATE STOCK':
    case 'UPDATE PRODUCT':
    case 'UPDATE_PRODUCT':
      return `<span class="badge  bg-info text-dark border px-3" data-type="update">🔄 Update</span>`;

    case 'CREATE PURCHASE ORDER':
      return `<span class="badge border border-secondary  text-secondary px-3" data-type="createpurchase">📝 Create PO</span>`;
      
    case 'RECEIVE PURCHASE ORDER':
    case 'ORDER RECEIVED':
      return `<span class="badge bg-primary   border px-3" data-type="receivepurchase">📦 Receive PO</span>`;

    case 'STOCK ADJUSTMENT':
    case 'STOCK ADDED':
      return `<span class="badge add rounded-pill bg-primary px-3 shadow-sm" data-type="stockadded">Stock Added</span>`;

    
    case 'STOCK REMOVED':
      return `<span class="badge  bg-danger px-3" data-type="stockremoved">Stock Removed</span>`;

    case 'LOW STOCK ALERT':
      return `<span class="badge bg-outline-danger  text-danger border border-danger px-3" data-type="lowalert">⚠️ Low Stock</span>`;

    case 'DELETE PRODUCT':
      return `<span class="badge  bg-danger px-3" data-type="deleteproduct">🗑️ Delete</span>`;

    case 'ORDER CANCELLED':
      return `<span class="badge  bg-danger px-3" data-type="cancelledpurchase">Cancelled PO</span>`;

    default:
      return `<span class="badge bg-secondary px-3">${data.action}</span>`;
  }
}

/**************************** render all logs *****************************************************/
async function render(data) {

    tablebody.innerHTML = '';

    for (let item of data){

    const productdetails = await product.getById('products', item.productId)

    const row = document.createElement("tr")
    row.classList.add("align-middle")

         row.innerHTML = `
                <td class="badgeicon pe-4">${getActionBadge(item.action)}</td>
                <td class=" text-muted ps-4">${productdetails.name}</td>
                <td class=" colorofqty text-end ">${item.quantity}</td>
                <td class="text-muted small">${item.details || 'No details'}</td>
                <td class="text-secondary small">${item.user}</td>
                <td class="text-secondary small">${item.timestamp.slice(0,19)}</td>
        `;
        tablebody.appendChild(row)
        let logtype =row.querySelector(".badge").dataset.type
        
        // colors of quantity text
        if(logtype == "add" || logtype == "update" || logtype == "createpurchase" || logtype == "receivepurchase" || logtype == "stockadded"){
            row.querySelector(".colorofqty").classList.add("text-success")
            if (logtype == "add" || logtype == "createpurchase" || logtype == "receivepurchase" || logtype == "stockadded"){
                row.querySelector(".colorofqty").textContent = `+${item.quantity}`
            }else {
                row.querySelector(".colorofqty").textContent = `${item.quantity}`
                row.querySelector(".colorofqty").classList.remove("text-success")
            }
        }else {
            row.querySelector(".colorofqty").classList.add("text-danger")
        }
    };
    document.getElementById("countoflogs").textContent = `Complete log of all inventory activities (${data.length} entries)`
}
render(data);

/********************* get all users**************************** */
async function getAllUsers(){
    try{
    const response = await fetch('http://localhost:3000/users');
    return await response.json();
    } catch(error){
        console.error(error)
    }
}
let users = await getAllUsers()
document.getElementById("numberofusers").textContent = users.length


/********************** Search Filtering**********************************************/

async function search(resultData, searchterm){
    
  let datafiltered = []
    for(let ele of resultData){
      const productName = await product.getById("products", ele.productId)
      if (productName.name.toLowerCase().includes(searchterm.toLowerCase())){
        datafiltered.push(ele)
      }
    }
    return datafiltered
  }

  let currentArray = data
    searchInput.addEventListener("input", async function (e){
      let result = this.value
      let datafiltered = await search(currentArray, result)
      render(datafiltered)
    })



selecticon.addEventListener("change", async function(e){
  searchInput.value = ""
  if(this.value == "all"){
    currentArray = data
    render(currentArray)
  }else if (this.value == "orders"){
    let orders = data.filter(ele => {return ele.action == "Create Purchase Order" || ele.action == "Receive Purchase Order" || ele.action == "Order Received" || ele.action == "Order Cancelled"})
    currentArray = orders
    render(currentArray)
  }else if (this.value == "updates"){
    let updates = data.filter(ele => {return ele.action == "UPDATE_PRODUCT" || ele.action == "Update Product" || ele.action == "Update Stock"})
    currentArray = updates
    render(currentArray)
  }else if(this.value == "new"){
    let newproduct = data.filter(ele => {return ele.action == "Add Product" || ele.action == "ADD_PRODUCT"})
    currentArray = newproduct
    render(currentArray)
  }else if(this.value == "added"){
    let stockadded = data.filter(ele => {return ele.action == "Stock Added"})
    currentArray = stockadded
    render(currentArray)
  }else {
    let stockremoved = data.filter(ele => {return ele.action == "Stock Removed"})
    currentArray = stockremoved
    render(currentArray)
  }
})