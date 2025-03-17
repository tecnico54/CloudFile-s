//Definir credenciales de Google Cloud
const CLIENT_ID = '912686271635-i10kugum31bvcbftv7n87ifi8o8gtoh5.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCM2Rn9D70WBDYSPHbFXAviSPFSzeMXyHc'; 
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
//Cargar la API al iniciar la página
window.onload = function (){
    handleClientLoad();
};
function handleClientLoad(){
    gapi.load('client:auth2', initClient);
}
function initClient(){
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
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
function updateSigninStatus(isSignedIn){
    if (isSignedIn) {
        console.log("Usuario autenticado");
    } else {
        console.log("Usuario no autenticado. Pidiendo inicio de sesión...");
        gapi.auth2.getAuthInstance().signIn().catch(error => {
            console.error("Error al iniciar sesión:", error);
        });
    }
}
function checkAuth(){
    if (!gapi.auth2 || !gapi.auth2.getAuthInstance()){
        alert("La página no está lista. Intenta de nuevo en unos segundos.");
        return false;
    }
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
        alert("Por favor, inicia sesión para subir archivos.");
        return false;
    }
    return true;
}
function subirArchivo(){
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file){
        alert("Selecciona un archivo primero");
        return;
    }
    if (!checkAuth()){
        return;
    }
    //Mostrar estado de carga
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
    //Obtener token de acceso de forma segura
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const token = user.getAuthResponse().access_token;
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
            console.log("Archivo subido: ", data);
            uploadStatus.innerText = `Archivo subido: ${file.name}`;
            uploadStatus.style.color = "green";
            alert("Archivo subido con éxito a Google Drive");
        } else {
            console.error("Error al subir archivo: Respuesta sin ID de archivo");
            uploadStatus.innerText = "Error al subir archivo";
            uploadStatus.style.color = "red";
        }
    })
    .catch(error => {
        console.error("Error al subir archivo:", error);
        uploadStatus.innerText = "Error al subir archivo";
        uploadStatus.style.color = "red";
    });
}