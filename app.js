
//URL del MockApi
const API_URL = "https://68c7410c442c663bd0291346.mockapi.io/api/v1/productos";


const $ = id => document.getElementById(id);

//Referencias a elementos del DOM
const productList = $("productList");
const searchInput = $("searchInput");
const categoryFilter = $("categoryFilter");
const priceFilter = $("priceFilter");
const clearFiltersBtn = $("clearFilters");
const noResults = $("noResults");
const loader = $("loader");

//Modal y formulario de agregar/editar

const productModal = $("productModal");
const modalTitle = $("modalTitle");
const closeModal = $("closeModal");
const cancelModal = $("cancelModal");
const saveProduct = $("saveProduct");
const addProductBtn = $("addProductBtn");
const productName = $("productName");
const productCategory = $("productCategory");
const productPrice = $("productPrice");
const productImage = $("productImage");

//Modal de eliminación
const deleteModal = $("deleteModal");
const closeDeleteModalBtn = $("closeDeleteModal");
const confirmDelete = $("confirmDelete");
const cancelDelete = $("cancelDelete");
const deleteProductName = $("deleteProductName");

// Resultados

let products = []; // lista completa de productos desde la API
let editId = null; // id del producto que se está editando
let deleteId = null; //id del producto a eliminar



//Funciones de la API (CRUD)

//Obtener todos los productos desde MockAPI

async function fetchProducts() {
    
    showLoader();

    try {
        const response = await fetch(API_URL);
        if(!response.ok) throw new Error(`Error HTTP: ${response.status}`);

       const data = await response.json();
      
      
        products = data;
        displayProducts(products);

        // Poblar filtros después de tener productos
        populateFilters();
       
        
    } catch (error) {
       
        showError("Error al cargar los productos. Por favor, intenta nuevamente");
    } finally {
        hideLoader();
    }
}

     // Crear un nuevo producto
     async function createProduct(productData) {
        
        showLoader();
       
        try {
             // Si no trae imagen, usamos un placeholder seguro
             const imageUrl = productData.image && productData.image.trim() !== "" 
            ? productData.image 
            : "https://placehold.co/300x225?text=Sin+Imagen";


            const response = await fetch(API_URL, {
            method:"POST",
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({
                 ...productData,
                price: productData.price.toString(), // price siempre como string
                image: imageUrl
        })
    });

        if(!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status}, Detalle: ${errorText}`);
        }

        const newProduct = await response.json();
      
        //Actualizar lista local
        products.push(newProduct);
        applyFilters();
        showSuccess("Producto agregado correctamente");

     } catch (error) {
       
        showError("Error al crear el producto. Por favor, intenta nuevamente.");

     }finally{
        hideLoader();
     }
}   

 // Actualizar un producto existente

 async function updateProduct(id, productData) {
    
    showLoader();
    
    try {

        const imageUrl = productData.image && productData.image.trim() !== "" 
            ? productData.image 
            : "https://placehold.co/300x225?text=Sin+Imagen";

        const response = await fetch (`${API_URL}/${id}`, {
            method: "PUT",
             headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({
                ...productData,
                price: productData.price.toString(),
                image: imageUrl
            })
        });

        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`Error HTTP:${response.status},Detalle: ${errorText}`);
            }

        const updateProduct = await response.json();
       

        //Actualizar la lista local
        const index = products.findIndex(p => p.id === id);
                if (index !== -1) {
                    products[index] = updateProduct;
                    applyFilters();
                }
                showSuccess("Producto actualizado correctamente");

    } catch (error) {
        
                showError("Error al actualizar el producto. Por favor, intenta nuevamente.");
            } finally {
                hideLoader();
            }
        }

    //Eliminar producto
    async function deleteProduct(id, name) {
        if (!confirm (`¿Deseas eliminar el producto "${name}"?`))return;
        showLoader();

        try {
            const response = await fetch (`${API_URL}/${id}`, {method: "DELETE"});
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            products = products.filter(p => p.id !== id);
            applyFilters();
            showSuccess(`Producto "${name}" eliminado`);

            } catch (error) {
            
            showError("Error al eliminar el producto. Por favor, intenta nuevamente.");    
            } finally {
            hideLoader();
        }
    }


// Tonos de azul de más oscuro a más claro
const blueShades = [
    'is-text',   
    'is-link',      
    'is-info',
    'is-warning'      
];

// Objeto para mapear categoría a color
const categoryColors = {};

    //Mostrar productos en el DOM
    function displayProducts(productsToShow) {
    

    if (productsToShow.length === 0) {
        productList.innerHTML = '';
        noResults.classList.remove('is-hidden');
        return;
    }

    noResults.classList.add('is-hidden');

    productList.innerHTML = productsToShow.map(product => {
        const { id, name, category, price, image } = product; // destructuring
        const imageUrl = image || 'https://placehold.co/300x225?text=Sin+Imagen';
        const priceFormatted = parseFloat(price || 0).toFixed(2);

       // Asignar color azul a cada categoría
        if (category && !categoryColors[category]) {
            const usedColors = Object.values(categoryColors);
            const availableColors = blueShades.filter(c => !usedColors.includes(c));
            categoryColors[category] = availableColors[0] || 'is-info';
        }

        const colorClass = categoryColors[category] || 'is-info';


        return `
        <div class="column is-one-quarter">
            <div class="card">
                <div class="card-image">
                    <figure class="image is-4by3">
                        <img src="${imageUrl}" alt="${name}" 
                             onerror="this.src='https://placehold.co/300x225?text=Sin+Imagen'">
                    </figure>
                </div>
                <div class="card-content">
                    <p class="title is-5">${name}</p>
                    <div class="tags">
                       
                      <span class="tag is-medium ${colorClass}">${category || 'Sin categoría'}</span>
                        <span class="tag is-success is-medium">$${priceFormatted}</span>
                    </div>
                </div>
                <footer class="card-footer">
                    <a href="#" class="card-footer-item has-text-info" onclick="editProduct('${id}')">
                        <span class="icon"><i class="fas fa-edit"></i></span>
                        <span>Editar</span>
                    </a>
                    <a href="#" class="card-footer-item has-text-danger" onclick="openDeleteModal('${id}', '${name}')">
                        <span class="icon"><i class="fas fa-trash"></i></span>
                        <span>Eliminar</span>
                    </a>
                </footer>
            </div>
        </div>
        `;
    }).join('');
}


      // Poblar filtros con categorías únicas
        function populateFilters() {
            
            
            const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
           
            
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + 
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }

       //Aplicar filtros de búsqueda
       function applyFilters() {
       

        const searchItem = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        const selectedPriceRange = priceFilter.value;

         let filtered = products.filter(product => {
            //Filtro por nombre
            const matchesSearch = !searchItem ||
            product.name.toLowerCase().includes(searchItem);

            //Filtro por categoria
            const matchesCategory = !selectedCategory ||
            product.category === selectedCategory;

            //Filtro por precio
            let matchesPrice = true;
            if(selectedPriceRange) {
                const price = parseFloat(product.price || 0);
                switch (selectedPriceRange) {
                    case '0-50':
                        matchesPrice = price >= 0 && price <= 50;
                        break;
                    case '51-100':
                        matchesPrice = price >= 51 && price <= 100;
                        break;
                    case '101-200':
                        matchesPrice = price >= 101 && price <= 200;
                        break;
                    case '201+':
                        matchesPrice = price >= 201;
                        break;
                }
            }

            return matchesSearch && matchesCategory && matchesPrice;
         });

        
         
         // Mostrar productos filtrados
         displayProducts(filtered);
        }

         //Limpiar todos los filtros

         function clearFilters(){
            

            searchInput.value= '';
            categoryFilter.value='';
            priceFilter.value='';

            displayProducts(products);
         }
        
         // Funciones del modal
        
         // Abrir modal para agregar producto
        function openAddModal(){
            
            
            editId = null;
            modalTitle.textContent = 'Agregar Producto';
            clearForm();
            productModal.classList.add('is-active');
        }
        
        //Editar producto existente
        function editProduct(id) {
           
            const product = products.find(p => p.id === id);
            if(!product){
               
                return;
            }
           

            editId = id;
            modalTitle.textContent ='Editar Producto';

            productName.value = product.name ||'';
            productCategory.value = product.category || '';
            productPrice.value = product.price || '';
            productImage.value = product.image || '';

            productModal.classList.add('is-active');
        }

        // Cerrar modal
        function closeProductModal() {
           
            productModal.classList.remove('is-active');
            clearForm();
            editId = null;
        }

        //Limpiar formluario 
        function clearForm(){
           

            productName.value = '';
            productCategory.value='';
            productPrice.value= '';
            productImage.value = '';
        }

        //Guardar producto(crear o actualizar)
        async function handleSaveProduct(){
           

            const formData = {
                name: productName.value.trim(),
                category: productCategory.value.trim(),
                price:productPrice.value.trim(),
                image:productImage.value.trim(),
            };
            //console.log("Datos del formulario:",formData);

            //Validación básica
            if(!formData.name || !formData.category || !formData.price){
                
                showError("Por favor, completa todos los campos requeridos.");
                return;
            }

            if(editId){
                await updateProduct (editId, formData);
            } else {
                await createProduct(formData);
            }
            closeProductModal();
        }

        //Funciones para eliminar
        // Abrir modal de eliminación
        function openDeleteModal(id, name) {
        deleteId = id;
        deleteProductName.textContent = name;
        deleteModal.classList.add('is-active');
        }
        
        // Cerrar modal de eliminación
        function closeDeleteModal() {
        deleteModal.classList.remove('is-active');
        deleteId = null;
        }

        // Confirmar eliminación
        async function handleConfirmDelete() {
        if (!deleteId) return;
        const product = products.find(p => p.id === deleteId);
        await deleteProduct(deleteId, product?.name || "");
        closeDeleteModal();
        }

        // Cerrar modal al hacer click en el fondo de cada modal
        document.querySelectorAll('.modal').forEach(modal => {
        const bg = modal.querySelector('.modal-background');
        if(bg){
        bg.addEventListener('click', () => {
            modal.classList.remove('is-active');
            if(modal.id === 'productModal') clearForm();
            if(modal.id === 'deleteModal') deleteId = null;
        });
        }
        });
    

           //Funciones de utilidad 
          function showLoader() { loader.classList.remove('is-hidden'); }
          function hideLoader() { loader.classList.add('is-hidden'); }

          function showSuccess(message) {
          
          alert(message); // temporal
     }
           
           function showError(message) {
            
            alert(message); // Temporal
        }

 

    //Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
        

    // Filtros y búsqueda
            searchInput.addEventListener('input', applyFilters);
            categoryFilter.addEventListener('change', applyFilters);
            priceFilter.addEventListener('change', applyFilters);
            clearFiltersBtn.addEventListener('click', ()=>{
                searchInput.value = '';
                categoryFilter.value= '';
                priceFilter.value = '';
                displayProducts(products);
            });

     // Modal de producto
            addProductBtn.addEventListener('click',openAddModal);
            closeModal.addEventListener('click', closeProductModal);
            cancelModal.addEventListener('click', closeProductModal);
            saveProduct.addEventListener('click', handleSaveProduct);
    
     //Modal de eliminación
      if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
     cancelDelete.addEventListener('click', closeDeleteModal);
     confirmDelete.addEventListener('click', handleConfirmDelete);

     //Cerrar modales al hacer click en el fondo
     document.querySelectorAll('.modal').forEach(modal => {
       const bg = modal.querySelector('.modal-background');
       if(bg){
            bg.addEventListener('click', () => {
                modal.classList.remove('is-active');
                if(modal.id === 'productModal') clearForm();
                if(modal.id === 'deleteModal') deleteId = null;
            });
        }
    });
});
     
                    

   //Poblar categorías automáticamente
   populateFilters();




    //Cargar productos inicial
    fetchProducts();
  

    







