const SCOPES = "https://www.googleapis.com/auth/drive.file"; 
function handleClientLoad(){
    gapi.load('client:auth2', initClient);
}
function initClient(){
    gapi.client.init({
        apiKey: '110573165611184535579',
        clientId: '912686271635-i10kugum31bvcbftv7n87ifi8o8gtoh5.apps.googleusercontent.com',
        scope: SCOPES,
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
    }).then(() => {
        console.log("Google API cargada");
        // Manejo de autenticación
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }).catch(error => {
        console.error("Error al inicializar el cliente de Google:", error);
    });
}
function updateSigninStatus(isSignedIn){
    if(isSignedIn){
        console.log("Usuario autenticado");
    } else {
        console.log("Usuario no autenticado. Pidiendo inicio de sesión...");
        gapi.auth2.getAuthInstance()?.signIn().catch(error => {
            console.error("Error al iniciar sesión:", error);
        });
    }
}