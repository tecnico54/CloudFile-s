  // Reemplaza con tu CLIENT_ID y API_KEY de Google Cloud
        const CLIENT_ID = '912686271635-i10kugum31bvcbftv7n87ifi8o8gtoh5.apps.googleusercontent.com';
        const API_KEY = '110573165611184535579';
        // Alcances de permisos para Google Drive
        const SCOPES = 'https://www.googleapis.com/auth/drive.file';
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
        function subirArchivo(){
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];

            if(!file){
                alert("Selecciona un archivo primero");
                return;
            }
            const metadata = {
                name: file.name,
                mimeType: file.type
            };
            const formData = new FormData();
            formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
            formData.append("file", file);
            fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ "Authorization": "Bearer " + gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token }),
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log("Archivo subido: ", data);
                alert("Archivo subido con éxito a Google Drive");
            })
            .catch(error => console.error("Error al subir archivo:", error));
        }