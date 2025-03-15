function subirArchivo(inputId){
    const fileInput = document.getElementById(inputId);
    const file = fileInput.files[0];
    if (!file){
        alert("Selecciona un archivo primero");
        return;
    }
    if (!gapi.auth2 || !gapi.auth2.getAuthInstance()){
        alert("La página no está lista. Intenta de nuevo en unos segundos.");
        return;
    }
    const user = gapi.auth2.getAuthInstance().currentUser.get();
    const token = user.getAuthResponse().access_token;
    if (!token){
        alert("Debes iniciar sesión para subir archivos en Google Drive.");
        return;
    }
    //Verificación de tamaño de archivo
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_FILE_SIZE) {
        alert("El archivo es demasiado grande. El límite es de 100 MB.");
        return;
    }
    //Mostrar mensaje de carga
    const uploadStatus = document.getElementById("uploadStatus");
    uploadStatus.innerText = "Subiendo archivo...";
    uploadStatus.style.color = "blue";

    const metadata = {
        name: file.name,
        mimeType: file.type
    };
    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            console.log("Trabajo subido: ", data);
            uploadStatus.innerText = `Trabajo subido: ${file.name}`;
            uploadStatus.style.color = "green";
        } else {
            console.error("La respuesta no contiene un ID de archivo. Verifique la carga.");
            uploadStatus.innerText = "Error al subir el trabajo.";
            uploadStatus.style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error al subir trabajo:", error);
        uploadStatus.innerText = "Error al subir el trabajo.";
        uploadStatus.style.color = "red";
    });
}
