export class CategoriesService {
  static async getAll() {
    try {
      const response = await fetch("http://localhost:3000/categories");

      if (!response.ok) {
        throw new Error(`Something wrong! status : ${response.status} `);
      }

      let data = await response.json();
    //   console.log("Data fetched successfully:", data);
      return data;
    } catch (err) {
      console.log(err.message);
    }
  }
}
CategoriesService.getAll();
