import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function cargarVideos() {

  const contenedor = document.getElementById("videos-dinamicos");

  if (!contenedor) return;

  contenedor.innerHTML = "";

  const videos = await getDocs(collection(db, "videos"));

  videos.forEach((video) => {

    const datos = video.data();

    const elemento = document.createElement("video");

    elemento.controls = true;
    elemento.width = 800;

    elemento.innerHTML = `
      <source src="${datos.url}" type="video/mp4">
      Tu navegador no soporta este video.
    `;

    contenedor.appendChild(elemento);

  });

}

cargarVideos();
