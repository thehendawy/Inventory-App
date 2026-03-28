export class CategoriesService {
  static async getAll() {
    try {
      const response = await fetch(
        "http://localhost:3000/categories?_embed=products",
      );

      if (!response.ok) {
        throw new Error(
          `Something wrong! status : ${response.status} ${response.statusText} `,
        );
      }

      let data = await response.json();
      // console.log("Data fetched successfully:", data);
      return data;
    } catch (err) {
      throw err;
    }
  }

  static async addNewCategory(categoryData) {
    try {
      await fetch(`http://localhost:3000/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
    } catch (err) {
      throw err;
    }
  }

  static async updateCategory(id, newData) {
    try {
      await fetch(`http://localhost:3000/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "Application/json" },
        body: JSON.stringify(newData),
      });
    } catch (err) {
      throw err;
    }
  }

  static async deleteCategory(id) {
    try {
      const response = await fetch(`http://localhost:3000/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  }
}
