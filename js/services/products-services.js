class ProductService {
    
    constructor(baseURL = "http://localhost:3000") {
        this.baseURL = baseURL;
    }

    async getAll(endpoint) {
        try {
            let response = await fetch(`${this.baseURL}/${endpoint}`);
            if (!response.ok) throw new Error(`${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error`, error);
            throw error;
        }
    }

    async getById(endpoint, id) {
        try {
            let response = await fetch(`${this.baseURL}/${endpoint}/${id}`);
            if (!response.ok) throw new Error(` ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error`, error);
            throw error;
        }
    }

    async create(endpoint, data) {
        try {
            let response = await fetch(`${this.baseURL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error in POST ${endpoint}:`, error);
            throw error;
        }
    }

    async update(endpoint, id, data) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error `, error);
            throw error;
        }
    }

    async delete(endpoint, id) {
        try {
            const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error(` error ${response.status}`);
            return { success: true };
        } catch (error) {
            console.error(`Error:`, error);
            throw error;
        }
    }

    validateProduct(data, type = "edit") {
    let errors = {};
    let isValid = true;

    let name = data.name?.trim();
    let sku = data.sku;
    let price = data.price;
    let quantity = data.quantity;
    let recorder = data.reorderLevel;
    let category = data.categoryId;
    let supplier = data.supplierId;
    
    let recorderValue = Number(recorder);

    if (!name) {
        errors.name = "Required";
        isValid = false;
    } else if (!isNaN(name)) {
        errors.name = "Cannot be only numbers";
        isValid = false;
    } else if (name.length < 2) {
        errors.name = "Min 2 chars";
        isValid = false;
    }

    if (!category) {
        errors.category = "Required";
        isValid = false;
    }

    if (!supplier) {
        errors.supplier = "Required";
        isValid = false;
    }

    if (!price || isNaN(price) || Number(price) <= 0) {
        errors.price = "Invalid";
        isValid = false;
    }

    if (quantity === "" ) {
        errors.quantity = "Invalid";
        isValid = false;
    }else if(isNaN(quantity)){
        errors.quantity = "Quantity Must be a Number"
        isValid = false;

    }else if(Number(quantity) < 0){
        errors.quantity ="Quantity cannot be negative";
        isValid = false;
    }

    if (recorder === "" || isNaN(recorderValue)) {
        errors.recorder = "Invalid";
        isValid = false;
    }else if (recorderValue < 0){
        errors.recorder ="Recorder Mustn't Be Negative";
        isValid= false ;
    }

    if (type === "add") {
        if (sku === "") {
            errors.sku = "Required";
            isValid = false;
        } else if (!isNaN(sku)) {
            errors.sku = "Cannot be only numbers";
            isValid = false;
        }
    }


    return { isValid, errors };
}

}

export default ProductService;