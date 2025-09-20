
//URL del MockApi
const API_URL = "https://68c7410c442c663bd0291346.mockapi.io/api/v1/products/productos";




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
const resultsCount = $("resultsCount"); 

let products = []; // lista completa de productos desde la API
let editId = null; // id del producto que se está editando
let deleteId = null; //id del producto a eliminar


console.log("Inicializando aplicación...");
console.log("URL de la API:", API_URL);
console.log("Referencias DOM obtenidas correctamente");

//Funciones de la API (CRUD)

//Obtener todos los productos desde MockAPI

async function fetchProducts() {
    console.log("Iniciando carga de productos...");
    showLoader();

    try {
        const response = await fetch(API_URL);
        console.log("Respuesta recibida:", response.status);

        if(!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Productos cargados:", data.length, "elementos");
        console.log("Datos recibidos:", data);

        products = data;
        //populateFilters();
        displayProducts(products);
        updateResultsCount(products.length);
        
    } catch (error) {
        console.log ("Error al cargar productos:",error);
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
        const response = await fetch(API_URL, {
            method:"POST",
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });

        console.log("Respuesta de creación:", response.status);
        if(!response.ok) {
            throw new Error (`Error HTTP: ${response.status}`);
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



    //Mostrar productos en el DOM
    function displayProducts(productsToShow){
        console.log ("Mostrando", productsToShow.length,"productos");

        if(productsToShow.length === 0) {
            productList.innerHTML = '';
            noResults.classList.remove('is-hidden');
            updateResultsCount(0);
            return;
        }

        noResults.classList.add('is-hidden');

        productList.innerHTML = productsToShow.map(product =>`
            <div class="column is-one-third">
            <div class="card">
            <div class="card-image">
                <figure class="image is-4by3">
                <img src="${product.image || 'https://placehold.co/300x225?text=Sin+Imagen'}"alt="${product.name}"
                onerror="this.src='https://placehold.co/300x225?text=Sin+Imagen'">
                </figure>
                </div>
                <div class="card-content">
                <div class="media">
                <div class="media-content">
                      <p class="title is-5">${product.name}</p>
                       <p class="title is-6">
                          <span> class="tag is-info">${productCategory}</span></p>
                          </div>
                        </div>
                        <div class="content">
                        <p class="title is-4 has-text-success">$${parseFloat(product.price || 0).toFixed(2)}</p>
                        </div>  
                </div>
                <footer class="card-footer">
                <button class="card-footer-item button is-ghost has-text-primary" onclick="edirProduct('${product.id}'. '${product.name}')">
                <span class="icon"><i class="fas fa-trash"></i></span>
                <span>Eliminar</span>
                            </button>
                     </footer>    
                 </div>    
               </div>
           `).join('');
          
           updateResultsCount(productsToShow.length);

           }



         
      
    //Funciones de utilidad (para ir testeando)

    function showLoader() {
        loader.classList.remove('is-hidden');
    }

    function hideLoader() {
       loader.classList.add('is-hidden');
    }

    function updateResultsCount(count) {
        updateResultsCount.textContent = `${count} producto${count !== 1? 's': '' }`;
    }

    function showSuccess(message) {
        console.log("Éxito:", message);
        alert(message);//temporal
    }


    function showError(message) {
        console.error("Error:", message);
        alert(message); // temporal
    }

    function applyFilters() {
        // Por ahora mostramos todo
        displayProducts(products);
}



    //Event Listeners
    document.addEventListener('DOMContentLoaded', function(){
        console.log ("Don cargado, configurando event Listeners...");

        //Filtros de búsqueda

    });



    //Cargar productos inicial
    fetchProducts();








