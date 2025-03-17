function subirArchivo(inputId) {
    const fileInput = document.getElementById(inputId);
    if (!fileInput || !fileInput.files.length){
        alert("Selecciona un archivo primero.");
        return;
    }
    const file = fileInput.files[0];
    //Verificación de carga de la API de Google
    if (!gapi.auth2 || !gapi.auth2.getAuthInstance()){
        alert("La página no está lista. Intenta de nuevo en unos segundos.");
        return;
    }
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
        alert("Error al obtener la instancia de autenticación.");
        return;
    }
    const user = authInstance.currentUser.get();
    const token = user.getAuthResponse().access_token;
    if (!token) {
        alert("Debes iniciar sesión para subir archivos a Google Drive.");
        return;
    }
    //Verificación de tamaño de archivo (Límite: 100 MB)
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_FILE_SIZE) {
        alert("El archivo es demasiado grande. El límite es de 100 MB.");
        return;
    }
    //Mostrar mensaje de carga
    const uploadStatus = document.getElementById("uploadStatus");
    uploadStatus.innerText = "Subiendo archivo...";
    uploadStatus.style.color = "blue";
    //Preparar metadata y FormData para la subida
    const metadata = {
        name: file.name,
        mimeType: file.type
    };
    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);
    //Subida del archivo usando la API de Google Drive
    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.id){
            console.log("Trabajo subido con éxito:", data);
            uploadStatus.innerText = `Trabajo subido: ${file.name}`;
            uploadStatus.style.color = "green";
            alert("El archivo se subió con éxito a Google Drive.");
        } else {
            console.error("Error en la respuesta de la API. No se recibió un ID de archivo:", data);
            uploadStatus.innerText = "Error al subir el archivo.";
            uploadStatus.style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error al subir archivo:", error);
        uploadStatus.innerText = "Error al subir el archivo.";
        uploadStatus.style.color = "red";
    });
}
