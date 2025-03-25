document.addEventListener("DOMContentLoaded", function(){
    const fileInput1 = document.getElementById("fileInput-1");
    const fileInput2 = document.getElementById("fileInput-2");
    const fileInput3 = document.getElementById("fileInput-3");
    const btnDescargar1 = document.getElementById("btnDescargar-1");
    const btnDescargar2 = document.getElementById("btnDescargar-2");
    const btnDescargar3 = document.getElementById("btnDescargar-3");
    let db;
    const request = indexedDB.open("ArchivosDB", 1);
    // Base de datos IndexedDB
    request.onupgradeneeded = function (event){
        db = event.target.result;
        if (!db.objectStoreNames.contains("archivos")){
            db.createObjectStore("archivos", { keyPath: "id" });
        }
    };
    request.onsuccess = function (event){
        db = event.target.result;
        // Función para guardar archivos en IndexedDB
        function guardarArchivo(file, key){
            if (!db){
                alert("Error: Base de datos no inicializada.");
                return;
            }
            if (file){
                const reader = new FileReader();
                reader.onload = function (e) {
                    const transaction = db.transaction(["archivos"], "readwrite");
                    const store = transaction.objectStore("archivos");
                    store.put({ id: key, data: e.target.result, type: file.type, name: file.name });
                    alert(`Trabajo: "${file.name}" guardado.`);
                };
                reader.readAsDataURL(file);
            }
        }
        // Función para guardar archivos en Google Cloud Storage
       async function guardarArchivoEnGoogleDrive(file) {
        const token = "TU_TOKEN_DE_ACCESO"; // Pega aquí tu token de acceso
        const metadata = {
        name: file.name,
        mimeType: file.type
    };
    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", file);
    try {
        const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
        const data = await response.json();
        if (data.id) {
            alert(`Trabajo "${file.name}" guardado en Google Drive con ID: ${data.id}`);
        } else {
            alert("Error al subir el archivo a Google Drive.");
        }
    } catch (error) {
        console.error("Error al subir a Google Drive:", error);
        alert("Error al conectar con Google Drive.");
    }
}
        // Función para descargar archivos desde IndexedDB
        function descargarArchivo(key){
            if (!db){
                alert("Error: Base de datos no inicializada.");
                return;
            }
            const transaction = db.transaction(["archivos"], "readonly");
            const store = transaction.objectStore("archivos");
            const request = store.get(key);

            request.onsuccess = function (event){
                const result = event.target.result;
                if (!result || !result.data) {
                    alert(`No hay trabajo guardado en: "${key}".`);
                    return;
                }
                const enlace = document.createElement("a");
                enlace.href = result.data;
                enlace.download = result.name;
                document.body.appendChild(enlace);
                enlace.click();
                document.body.removeChild(enlace);
            };
        }
        // Eventos para subir los trabajos
        fileInput1.addEventListener("change", function(event){
            const file = event.target.files[0];
            guardarArchivo(file, "archivo1");
            guardarArchivoEnGoogleCloud(file);
        });
        fileInput2.addEventListener("change", function(event){
            const file = event.target.files[0];
            guardarArchivo(file, "archivo2");
            guardarArchivoEnGoogleCloud(file);
        });
        fileInput3.addEventListener("change", function(event){
            const file = event.target.files[0];
            guardarArchivo(file, "archivo3");
            guardarArchivoEnGoogleCloud(file);
        });
        // Eventos para descargar archivos
        btnDescargar1.addEventListener("click", function(){
            descargarArchivo("archivo1");
        });
        btnDescargar2.addEventListener("click", function(){
            descargarArchivo("archivo2");
        });
        btnDescargar3.addEventListener("click", function(){
            descargarArchivo("archivo3");
        });
    };
    request.onerror = function(event){
        console.error("Error al abrir IndexedDB", event);
    };
});
