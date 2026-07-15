console.log("Leitmix Producciones web cargada");

fetch("content/galeria.json")
.then(res => res.json())
.then(data => {

const galeria = document.getElementById("galeria-dinamica");

if(!galeria) return;

galeria.innerHTML = "";

data.forEach(item => {

galeria.innerHTML += `
<img src="${item.image}" alt="${item.title}">
`;

});

})
.catch(error => {

console.log(error);

document.getElementById("galeria-dinamica").innerHTML =
"Error cargando galería";

});
