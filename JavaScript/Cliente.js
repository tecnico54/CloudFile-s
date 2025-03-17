function handleClientLoad(){
    gapi.load('client:auth2', initClient);
}
function initClient(){
    gapi.client.init({
        apiKey: 'AIzaSyCM2Rn9D70WBDYSPHbFXAviSPFSzeMXyHc', 
        clientId: '912686271635-i10kugum31bvcbftv7n87ifi8o8gtoh5.apps.googleusercontent.com',
        scope: SCOPES,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    }).then(() => {
        console.log("✅ Google API cargada correctamente.");
        
        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance) {
            console.error("❌ Error: gapi.auth2 no está inicializado correctamente.");
            return;
        }
        authInstance.isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(authInstance.isSignedIn.get());
    }).catch(error => {
        console.error("❌ Error al inicializar el cliente de Google:", error);
    });
}
function updateSigninStatus(isSignedIn){
    if (isSignedIn){
        console.log("🔹 Usuario autenticado correctamente.");
    } else {
        console.warn("⚠️ Usuario no autenticado. Solicitando inicio de sesión...");
        
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
            authInstance.signIn().catch(error => {
                console.error("❌ Error al iniciar sesión:", error);
            });
        } else {
            console.error("❌ Error: gapi.auth2 no está inicializado correctamente.");
        }
    }
}
function subirArchivo(inputId) {
    const fileInput = document.getElementById(inputId);
    const file = fileInput.files[0];
    if (!file) {
        alert("⚠️ Selecciona un archivo primero.");
        return;
    }
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance || !authInstance.isSignedIn.get()){
        alert("⚠️ Debes iniciar sesión para subir archivos a Google Drive.");
        return;
    }
    const user = authInstance.currentUser.get();
    const token = user.getAuthResponse().access_token;
    if (!token) {
        alert("⚠️ No se pudo obtener el token de autenticación.");
        return;
    }
    //Verificación del tamaño del archivo
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_FILE_SIZE){
        alert("⚠️ El archivo es demasiado grande. El límite es de 100 MB.");
        return;
    }
    //Mostrar mensaje de carga
    const uploadStatus = document.getElementById("uploadStatus");
    uploadStatus.innerText = "⏳ Subiendo archivo...";
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
        if (data.id){
            console.log("✅ Archivo subido correctamente:", data);
            uploadStatus.innerText = `✅ Archivo subido: ${file.name}`;
            uploadStatus.style.color = "green";
        } else {
            console.error("❌ La respuesta no contiene un ID de archivo.");
            uploadStatus.innerText = "❌ Error al subir el archivo.";
            uploadStatus.style.color = "red";
        }
    })
    .catch(error => {
        console.error("❌ Error al subir archivo:", error);
        uploadStatus.innerText = "❌ Error al subir el archivo.";
        uploadStatus.style.color = "red";
    });
}