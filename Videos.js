async function cargarVideos() {

  const contenedor = document.getElementById("videos-dinamicos");

  if (!contenedor) return;

  contenedor.innerHTML = "";

const videos = [
  {
    titulo: "Leitmix Video",
    url: "assets/video/leitmix-video.mp4"
  },
  {
  
{
  titulo: "Fiesta Marcos Ungaro",
  url: "assets/video/Fiesta.mp4"
}
  videos.forEach((video) => {

    const elemento = document.createElement("video");

    elemento.controls = true;
    elemento.width = 800;

    elemento.innerHTML = `
      <source src="${video.url}" type="video/mp4">
      Tu navegador no soporta este video.
    `;

    contenedor.appendChild(elemento);

  });

}

cargarVideos();
