console.log("Leitmix Producciones cargado");

async function cargarGaleria(){

    const galeria = document.getElementById("galeria-dinamica");

    if(!galeria) return;

    try {

        const respuesta = await fetch("./content/galeria.json");

        const imagenes = await respuesta.json();

        galeria.innerHTML = "";

        imagenes.forEach(item => {

            galeria.innerHTML += `
                <div class="foto-galeria">
                    <img src="${item.image}" alt="${item.title}">
                    <p>${item.title}</p>
                </div>
            `;

        });

    } catch(error){

        console.log(error);

        galeria.innerHTML = "Error cargando galería";

    }

}


cargarGaleria();
