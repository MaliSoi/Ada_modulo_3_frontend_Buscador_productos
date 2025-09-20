
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
const closeDeleteModal = $("closeDeleteModal");
const confirmDelete = $("confirmDelete");
const cancelDelete = $("cancelDelete");
const deleteProductName = $("deleteProductName");

// Resultados

let products = []; // lista completa de productos desde la API
let editId = null; // id del producto que se está editando
let deleteId = null; //id del producto a eliminar


console.log("Inicializando aplicación...");
console.log("URL de la API:", API_URL);

//Funciones de la API (CRUD)

//Obtener todos los productos desde MockAPI

async function fetchProducts() {
    console.log("Iniciando carga de productos...");
    showLoader();

    try {
        const response = await fetch(API_URL);
        if(!response.ok) throw new Error(`Error HTTP: ${response.status}`);

       const data = await response.json();
       console.log("Productos cargados:", data.length);

        products = data;
        displayProducts(products);

        // ✅ Poblar filtros después de tener productos
        populateFilters();
       
        
    } catch (error) {
        console.log ("Error al cargar productos:", error);
        showError("Error al cargar los productos. Por favor, intenta nuevamente");
    } finally {
        hideLoader();
    }
}

     // Crear un nuevo producto
     async function createProduct(productData) {
        console.log("Creando nuevo producto:", productData);
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
        console.log("Producto creado:", newProduct);

        //Actualizar lista local
        products.push(newProduct);
        applyFilters();
        showSuccess("Producto agregado correctamente");

     } catch (error) {
        console.log ("Error al crear producto:", error);
        showError("Error al crear el producto. Por favor, intenta nuevamente.");

     }finally{
        hideLoader();
     }
}   

 // Actualizar un producto existente

 async function updateProduct(id, productData) {
    console.log(`Actualizando producto ID: ${id}`, productData);
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
        console.log("Producto actualizado:", updateProduct);

        //Actualizar la lista local
        const index = products.findIndex(p => p.id === id);
                if (index !== -1) {
                    products[index] = updateProduct;
                    applyFilters();
                }
                showSuccess("Producto actualizado correctamente");

    } catch (error) {
        console.error("Error al actualizar producto:", error);
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
            console.error("Error al eliminar producto:", error);
            showError("Error al eliminar el producto. Por favor, intenta nuevamente.");    
            } finally {
            hideLoader();
        }
    }

    //Mostrar productos en el DOM
    function displayProducts(productsToShow){
        console.log ("Mostrando", productsToShow.length,"productos");

        if(productsToShow.length === 0) {
            productList.innerHTML = '';
            noResults.classList.remove('is-hidden');
            return;
        }

        noResults.classList.add('is-hidden');

        productList.innerHTML = productsToShow.map(product =>`
            <div class="column is-one-quarter">
            <div class="card">
            <div class="card-image">
                <figure class="image is-4by3">
                <img src="${product.image || 'https://placehold.co/300x225?text=Sin+Imagen'}"
                alt="${product.name}" 
                onerror="this.src='https://placehold.co/300x225?text=Sin+Imagen'">
                </figure>
                </div>
                <div class="card-content">
                <div class="media">
                <div class="media-content">
                      <p class="title is-5">${product.name}</p>
                       <p class="title is-6">
                       <span class="tag is-info">${product.category || 'Sin categoría'}</span>
                       </p>
                       </div>
                        </div>
                        <div class="content">
                        <p class="title is-4 has-text-success">
                        $${parseFloat(product.price || 0).toFixed(2)}
                        </p>
                        </div>  
                    </div>
                <footer class="card-footer">
                <a href="#" class="card-footer-item has-text-info" onclick="editProduct('${product.id}')">
                <span class="icon"><i class="fas fa-edit"></i></span>
                <span>Editar</span>
                </a>
                <a href="#" class="card-footer-item has-text-danger" onclick="openDeleteModal('${product.id}', '${product.name}')">
                <span class="icon"><i class="fas fa-trash"></i></span>
                <span>Eliminar</span>
                </a>
                </footer>
                </div>    
               </div>
           `).join('');

           }



      // Poblar filtros con categorías únicas
        function populateFilters() {
            console.log("Poblando filtros...");
            
            const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
            console.log("📋 Categorías encontradas:", categories);
            
            categoryFilter.innerHTML = '<option value="">Todas las categorías</option>' + 
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }

       //Aplicar filtros de búsqueda
       function applyFilters() {
        console.log("Aplicando filtros...");

        const searchItem = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        const selectedPriceRange = priceFilter.value;

        console.log("Criterios de b;usqueda:", {
            searchItem,
            selectedCategory,
            selectedPriceRange,
        });

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

         console.log("Productos filtrados:",filtered.length);
         
         // Mostrar productos filtrados
         displayProducts(filtered);
   }

         //Limpiar todos los filtros

         function clearFilters(){
            console.log("Limpiando Filtros ...");

            searchInput.value= '';
            categoryFilter.value='';
            priceFilter.value='';

            displayProducts(products);
         }
        
         // Funciones del modal
        
         // Abrir modal para agregar producto
        function openAddModal(){
            console.log("Abriendo modal para agregar producto");
            
            editId = null;
            modalTitle.textContent = 'Agregar Producto';
            //clearForm();
            productModal.classList.add('is-active');
        }
        
        //Editar producto existente
        function editProduct(id) {
            console.log("Abriendo modal para editar el producto ID:",id);

            const product = products.find(p => p.id === id);
            if(!product){
                console.error("Producto no encomtrado para editar:",id)
                return;
            }
            console.log("Datos del producto a editar:", product);

            editId = id;
            modalTitle.textContent ='Editar Producto';

            productName.value = product.name ||'';
            productCategory.value = product.category || '';
            productPrice.value = product.price || '';
            productImage.value = product.image || '';

            productModal.classList.add('is-active');
        }




           //Funciones de utilidad 
          function showLoader() { loader.classList.remove('is-hidden'); }
          function hideLoader() { loader.classList.add('is-hidden'); }

          function showSuccess(message) {
          console.log("Éxito:", message);
          alert(message); // temporal
     }
           
           function showError(message) {
            //console.error("Error:", message);
            alert(message); // Temporal
        }

 

    //Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
         console.log ("DOM cargado, configurando event Listeners...");

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
                    

   //Poblar categorías automáticamente
   populateFilters();

});


    //Cargar productos inicial
    fetchProducts();
  









