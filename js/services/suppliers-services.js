export class SupplierService {
  constructor(Url) {
    this.Url = Url;
  }

  // validation

  validate(data) {
      
      // 1. التأكد من وجود الاسم (على الأقل 3 حروف)
      const supplierName = document.getElementById("supplierName")
      if (data.name == "" || data.name.trim().length < 3) {
        supplierName.classList.add('is-invalid');
        return false
      } else {
        supplierName.classList.remove('is-invalid');
      }

      // 2. التأكد من رقم التليفون (11 رقم مصري مثلاً)
      const phoneRegex = /^01[0125][0-9]{8}$/;
      const supplierPhone = document.getElementById("supplierPhone")
      if (!phoneRegex.test(data.phone)) {
          supplierPhone.classList.add('is-invalid');
        return false
      } else {
        supplierPhone.classList.remove('is-invalid');
      }

      // 3. التأكد من صيغة الإيميل
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const supplierEmail = document.getElementById("supplierEmail")
      if (!emailRegex.test(data.email)) {
          supplierEmail.classList.add('is-invalid');
        return false
      } else {
        supplierEmail.classList.remove('is-invalid');
      }

      // 4. التأكد من العنوان
      const supplierAddress = document.getElementById("supplierAddress")
      if (data.address == "" || data.address.trim().length < 5) {
          supplierAddress.classList.add('is-invalid');
        return false
      } else {
        supplierAddress.classList.remove('is-invalid');
      }
  }


  async addSupplier(formData) {

    let erroeMassage = this.validate(formData);
    if (erroeMassage == false ) return false

    try {
      // 2. استخدام fetch لإرسال البيانات (POST)
    const suppliersnumbers = await fetch(this.Url);
    const data = await suppliersnumbers.json();
    console.log(data)

      const response = await fetch(this.Url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("could not connect to server");

      const result = await response.json();
      console.log("supplier had added correctly ✅");
      return result;
    } catch (error) {
      console.error("error had happended ❌", error.message);
    }
  }

  // delete supplier method
  async deleteSupplier(id) {
        try {
            const response = await fetch(`${this.Url}/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("فشل حذف المورد من السيرفر");
            }

            alert(`suppliers of ${id} id has been deleted succesfully✅`);
            return true; // عشان تعرف في الـ UI إن العملية تمت

        } catch (error) {
            console.error("❌ خطأ في عملية الحذف:", error.message);
            return false;
        }
    }

  // Edit existing supplier method
  async getSupplierById(id) {
      const response = await fetch(`${this.Url}/${id}`);
      return await response.json();
  }

  async updateSupplier(id, updatedData) {

    let erroeMassage = this.validate(updatedData);
    if (erroeMassage == false ) return false;

      const response = await fetch(`${this.Url}/${id}`, {
          method: 'PUT', // PUT بتعدل العنصر بالكامل
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
      });
  }


}

export class SupplierTable {
    constructor(Url, tableBodyId) {
        this.Url = Url;
        this.tableBody = document.getElementById(tableBodyId);
    }

    // 1. جلب البيانات من الـ JSON
    async render() {
        const response = await fetch(this.Url);
        const data = await response.json();
        console.log(data)

        // 2. بناء الصفوف في الجدول
        this.tableBody.innerHTML = data.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.phone}</td>
                <td><a href="mailto:${s.email}">${s.email}</a></td>
                <td>${s.address}</td>
                <td class="text-end">
                    <i
                        class="fa-solid fa-edit mx-2 text-secondary"
                        style="cursor: pointer"
                        data-bs-toggle="modal"
                        data-bs-target="#supplierInputs"
                        data-bs-whatever="add-supplier"
                        onclick="prepareEdit('${s.id}')"
                      ></i>
                    <i
                        class="fa-solid fa-trash mx-2 text-danger"
                        style="cursor: pointer"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteSupplierModal"
                        onclick="prepareDelete('${s.id}')"
                      ></i>
                </td>
            </tr>
        `).join('');
        
        // تحديث العدد الإجمالي (suppliersLength)
        document.getElementById('countofsuppleries').textContent = `Your supplier network (${data.length} suppliers)`;
    }

    // search method
    // جوه كلاس SupplierTable
    async search(query) {
        let response = await fetch(this.Url);
        let data = await response.json();
        console.log(query)

        // فلترة الموردين بناءً على الاسم أو التليفون
        let filtered = data.filter(s => {
            return s.name.toLowerCase().includes(query.toLowerCase()) || 
            s.phone.includes(query)
        });

        // إعادة رسم الجدول بالنتائج المفلترة فقط
        this.renderData(filtered); 
    }

    // دالة مساعدة للرسم (عشان م نكررش الكود)
    renderData(suppliers) {
        this.tableBody.innerHTML = suppliers.map(s => `
            <tr>
                <td>${s.name}</td>
                <td>${s.phone}</td>
                <td><a href="mailto:${s.email}">${s.email}</a></td>
                <td>${s.address}</td>
                <td class="text-end">
                      <button class="btn btn-sm text-secondary"><i class="fa-regular fa-pen-to-square"></i></button>
                      <i
                          class="fa-solid fa-trash mx-2 text-danger"
                          style="cursor: pointer"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteSupplierModal"
                          onclick="prepareDelete('${s.id}')"
                        ></i>
                  </td>
            </tr>
        `).join('');
        
        // تحديث عداد البحث
        const countLabel = document.getElementById('countofsuppleries');
        if (countLabel) countLabel.innerText = `Search results: (${suppliers.length})`;
    }

}



