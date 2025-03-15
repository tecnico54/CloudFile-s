document.addEventListener("DOMContentLoaded", function(){
    const fileInput1 = document.getElementById("fileInput-1");
    const fileInput2 = document.getElementById("fileInput-2");
    const fileInput3 = document.getElementById("fileInput-3");
    const btnDescargar1 = document.getElementById("btnDescargar-1");
    const btnDescargar2 = document.getElementById("btnDescargar-2");
    const btnDescargar3 = document.getElementById("btnDescargar-3");
    let db;
    //Configuración de Firebase (obtén estos datos desde la consola de Firebase)
    const firebaseConfig = {
        apiKey: "TU_API_KEY",
        authDomain: "TU_AUTH_DOMAIN",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_STORAGE_BUCKET",
        messagingSenderId: "TU_MESSAGING_SENDER_ID",
        appId: "TU_APP_ID"
    };
    //Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    //Obtener referencia al servicio de almacenamiento
    const storage = firebase.storage();
    const storageRef = storage.ref();
    const request = indexedDB.open("ArchivosDB", 1);
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains("archivos")){
            db.createObjectStore("archivos", { keyPath: "id" });
        }
    };
    request.onsuccess = function(event){
        db = event.target.result;
        //Función para guardar archivo en IndexedDB
        function guardarArchivo(file, key){
            if (!db) {
                alert("Error: Base de datos no inicializada.");
                return;
            }
            if(file){
                const reader = new FileReader();
                reader.onload = function(e) {
                    const transaction = db.transaction(["archivos"], "readwrite");
                    const store = transaction.objectStore("archivos");
                    store.put({ id: key, data: e.target.result, type: file.type, name: file.name });
                    alert(`Trabajo: ${file.name} guardado correctamente en IndexedDB.`);
                };
                reader.readAsDataURL(file);
            }
        }
        //Función para subir archivo a Firebase Storage
        async function guardarArchivoEnFirebase(file, key){
            if(!file){
                alert("No hay archivo para subir.");
                return;
            }
            const fileRef = storageRef.child("archivos/" + file.name);  //Ruta en Firebase Storage
            try {
                await fileRef.put(file);  //Subir archivo
                alert(`Trabajo "${file.name}" guardado correctamente en Firebase Storage.`);
            } catch (error) {
                console.error("Error al subir archivo a Firebase:", error);
                alert("Error al subir archivo.");
            }
        //Función para descargar archivo desde Firebase Storage
        async function descargarArchivoDesdeFirebase(fileName){
            const fileRef = storageRef.child("archivos/" + fileName);
            try {
                const url = await fileRef.getDownloadURL();  // Obtener URL del archivo
                const enlace = document.createElement("a");
                enlace.href = url;
                enlace.download = fileName;
                document.body.appendChild(enlace);
                enlace.click();
                document.body.removeChild(enlace);
            } catch (error) {
                console.error("Error al descargar archivo desde Firebase:", error);
                alert("Error al descargar el archivo.");
            }
        }
        //Función para descargar archivo desde IndexedDB
        function descargarArchivo(key){
            if(!db){
                alert("Error: Base de datos no inicializada.");
                return;
            }
            const transaction = db.transaction(["archivos"], "readonly");
            const store = transaction.objectStore("archivos");
            const request = store.get(key);
            request.onsuccess = function(event) {
                const result = event.target.result;
                if (result) {
                    const enlace = document.createElement("a");
                    enlace.href = result.data;
                    enlace.download = result.name;
                    document.body.appendChild(enlace);
                    enlace.click();
                    document.body.removeChild(enlace);
                } else {
                    alert(`No hay trabajo guardado en: ${key}.`);
                }
            };
        }
        //Eventos para subir archivos
        fileInput1.addEventListener("change", function(event){
            const archivo = event.target.files[0];
            guardarArchivo(archivo, "archivo1");  //Guardar en IndexedDB
            guardarArchivoEnFirebase(archivo, "archivo1");  //Subir a Firebase Storage
        });
        fileInput2.addEventListener("change", function(event){
            const archivo = event.target.files[0];
            guardarArchivo(archivo, "archivo2");
            guardarArchivoEnFirebase(archivo, "archivo2");
        });
        fileInput3.addEventListener("change", function(event){
            const archivo = event.target.files[0];
            guardarArchivo(archivo, "archivo3");
            guardarArchivoEnFirebase(archivo, "archivo3");
        });
        //Eventos para descargar archivos
        btnDescargar1.addEventListener("click", function(){
            descargarArchivo("archivo1");  //Descargar desde IndexedDB
            descargarArchivoDesdeFirebase("archivo1");  //Descargar desde Firebase Storage
        });
        btnDescargar2.addEventListener("click", function(){
            descargarArchivo("archivo2");
            descargarArchivoDesdeFirebase("archivo2");
        });
        btnDescargar3.addEventListener("click", function(){
            descargarArchivo("archivo3");
            descargarArchivoDesdeFirebase("archivo3");
        });
    };
    request.onerror = function(event){
        console.error("Error al abrir IndexedDB", event);
    };
});
