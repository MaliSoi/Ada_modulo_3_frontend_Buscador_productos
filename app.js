
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
        populateFilters();
        displayProducts(products);
        updateResultsCount(products.length);
        
    } catch (error) {
        console.log ("Error al cargar prodcutos:",error);
        showError("Error al cargar los productos. Por favor, intenta nuevamente");
    }finally{
        hideLoader();
    }
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

    //Event Listeners
    document.addEventListener('DOMContentLoaded', function(){
        console.log ("Don cargado, configurando event Listeners...");

        //Filtros de búsqueda

    });



    //Cargar productos inicial
    fetchProducts();








