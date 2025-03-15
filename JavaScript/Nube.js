document.addEventListener("DOMContentLoaded", function(){
    const fileInput1 = document.getElementById("fileInput-1");
    const fileInput2 = document.getElementById("fileInput-2");
    const fileInput3 = document.getElementById("fileInput-3");
    const btnDescargar1 = document.getElementById("btnDescargar-1");
    const btnDescargar2 = document.getElementById("btnDescargar-2");
    const btnDescargar3 = document.getElementById("btnDescargar-3");

    let db;
    const request = indexedDB.open("ArchivosDB", 1);

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains("archivos")) {
            db.createObjectStore("archivos", { keyPath: "id" });
        }
    };

    request.onsuccess = function (event) {
        db = event.target.result;

        // Función para guardar archivos en IndexedDB
        function guardarArchivo(file, key) {
            if (!db) {
                alert("Error: Base de datos no inicializada.");
                return;
            }
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const transaction = db.transaction(["archivos"], "readwrite");
                    const store = transaction.objectStore("archivos");
                    store.put({ id: key, data: e.target.result, type: file.type, name: file.name });
                    alert(`Trabajo: "${file.name}" guardado correctamente.`);
                };
                reader.readAsDataURL(file);
            }
        }

        // Función para descargar archivos desde IndexedDB
        function descargarArchivo(key) {
            if (!db) {
                alert("Error: Base de datos no inicializada.");
                return;
            }
            const transaction = db.transaction(["archivos"], "readonly");
            const store = transaction.objectStore("archivos");
            const request = store.get(key);

            request.onsuccess = function (event) {
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
            guardarArchivo(event.target.files[0], "archivo1");
        });
        fileInput2.addEventListener("change", function(event){
            guardarArchivo(event.target.files[0], "archivo2");
        });
        fileInput3.addEventListener("change", function(event){
            guardarArchivo(event.target.files[0], "archivo3");
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
