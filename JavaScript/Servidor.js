//La función handleClientLoad ya no necesita el onload en el HTML.
window.onload = function(){
    handleClientLoad();  //Ahora esta función se ejecutará cuando todo esté cargado
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
    });
}
function checkAuth(){
    const authInstance = gapi.auth2.getAuthInstance();
    const isSignedIn = authInstance.isSignedIn.get();
    if (!isSignedIn) {
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
    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({
            "Authorization": "Bearer " + gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token
        }),
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.id){
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
