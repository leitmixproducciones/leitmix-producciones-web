async function cargarGaleria(){

    const galeria = document.getElementById("galeria-dinamica");

    if (!galeria) return;

    galeria.innerHTML = "";

    try {

        const respuesta = await fetch("./content/galeria.json?v=2");

        const imagenes = await respuesta.json();

        imagenes.forEach(item => {

            const img = document.createElement("img");
            img.src = item.image;
            img.alt = item.title;

            galeria.appendChild(img);

        });

    } catch(error){

        galeria.innerHTML = "Error cargando galería";

        console.log(error);

    }

}

cargarGaleria();
