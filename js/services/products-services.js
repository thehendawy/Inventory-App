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

}

export default ProductService;