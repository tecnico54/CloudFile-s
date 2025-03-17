// Definir credenciales de Google Cloud
const CLIENT_ID = '912686271635-p667k06j46kqgfqu5bg5stfhq09t53bj.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCM2Rn9D70WBDYSPHbFXAviSPFSzeMXyHc';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
// Cargar la API de Google y autenticar al usuario
window.onload = function (){
    handleClientLoad();
};
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}
function initClient() {
    gapi.client.init({
        apiKey: 'AIzaSyCM2Rn9D70WBDYSPHbFXAviSPFSzeMXyHc',
        clientId: '912686271635-p667k06j46kqgfqu5bg5stfhq09t53bj.apps.googleusercontent.com',
        scope: SCOPES,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    }).then(() => {
        console.log("Google API cargada");
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch((error) => {
        console.error("Error al cargar la API de Google", error);
    });
}
function updateSigninStatus(isSignedIn) {
    console.log("Estado de autenticación cambiado: ", isSignedIn);
    if (isSignedIn) {
        console.log("Usuario autenticado");
    } else {
        console.log("Usuario no autenticado. Pidiendo inicio de sesión...");
        gapi.auth2.getAuthInstance().signIn().then(() => {
            console.log("Usuario autenticado después de iniciar sesión");
        }).catch(error => {
            console.error("Error al iniciar sesión:", error);
        });
    }
}
//Verificación de autenticación
function checkAuth() {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance || !authInstance.isSignedIn.get()) {
        console.log("No autenticado. Pidiendo inicio de sesión...");
        alert("Por favor, inicia sesión para subir archivos.");
        return false;
    }
    console.log("Usuario autenticado: ", authInstance.currentUser.get().getBasicProfile().getName());
    return true;
}
//Función para subir archivo
function subirArchivo(inputId) {
    const fileInput = document.getElementById(inputId);
    if (!fileInput || !fileInput.files.length) {
        alert("Selecciona un archivo primero.");
        return;
    }
    const file = fileInput.files[0];
    if (!checkAuth()) {
        return;
    }
    const uploadStatus = document.getElementById("uploadStatus");
    uploadStatus.innerText = "Subiendo archivo...";
    uploadStatus.style.color = "blue";
    //Obtener token de autenticación
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const token = user.getAuthResponse().access_token;
    //Verificar tamaño del archivo
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
    if (file.size > MAX_FILE_SIZE) {
        alert("El archivo es demasiado grande. El límite es de 100 MB.");
        return;
    }
    //Preparar metadata y FormData
    const metadata = {
        name: file.name,
        mimeType: file.type
    };
    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);
    //Subir el archivo a Google Drive
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
            console.error("Error en la respuesta de la API:", data);
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
