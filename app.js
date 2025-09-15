
document.addEventListener("DOMContentLoaded", () => {
//URL del MockApi

const API_URL = "https://68c7410c442c663bd0291346.mockapi.io/api/v1/products/productos";

const $ = id => document.getElementById(id);

//Referencias a elementos del DOM
const productList = $("productList");
const searchInput = $("searchInput");
const categoryFilter = $("categoryFilter");
const priceFilter = $("priceFilter");
const clearFiltersBtn = $("clearFiltersBtn");
const noResults = $("noResults");
const loader = $("loader");

//Modal y formulario de agregar/editar

const productModal = $("productModal");
const modalTitle = $("modalTitle");
const closeModal = $("closeModal");
const cancelModal = $("cancelModal");
const saveProduct = $("saveProduct");

const productName = $("productName");
const productCategory = $("productCategory");
const productPrice = $("productPrice");
const productImage = $("productImage");

let productos = []; // lista completa de productos desde la API
let editId = null; // id del producto que se está editando

console.log("URL de la API:", API_URL);
console.log("Referencias DOM:", productList, searchInput, categoryFilter);

});



