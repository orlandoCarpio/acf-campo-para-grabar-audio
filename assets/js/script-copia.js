/**
 * Grabar audio obtenido del micrófono con JavaScript, seleccionando
 * un dispositivo de grabación de una lista; usando MediaRecorder
 * y getUserMedia
 * 
 * Extra: no descargar el audio, sino enviarlo a un servidor con PHP y guardarlo en la nube
 * Recomendado: https://parzibyte.me/blog/2018/11/06/cargar-archivo-php-javascript-formdata/
 * 
 * 
 * @author parzibyte
 * @see https://parzibyte.me/blog
 */
const init = () => {
    const tieneSoporteUserMedia = () =>
        !!(navigator.mediaDevices.getUserMedia)

    // Si no soporta...
    // Amable aviso para que el mundo comience a usar navegadores decentes ;)
    if (typeof MediaRecorder === "undefined" || !tieneSoporteUserMedia())
        return alert("Tu navegador web no cumple los requisitos; por favor, actualiza a un navegador decente como Firefox o Google Chrome");


    // Declaración de elementos del DOM
    const 
       $btnComenzarGrabacion = document.querySelector("#btnComenzarGrabacion"),
        $btnDetenerGrabacion = document.querySelector("#btnDetenerGrabacion"),
        $duracion = document.querySelector("#duracion");

    // Algunas funciones útiles
   
    const segundosATiempo = numeroDeSegundos => {
        let horas = Math.floor(numeroDeSegundos / 60 / 60);
        numeroDeSegundos -= horas * 60 * 60;
        let minutos = Math.floor(numeroDeSegundos / 60);
        numeroDeSegundos -= minutos * 60;
        numeroDeSegundos = parseInt(numeroDeSegundos);
        if (horas < 10) horas = "0" + horas;
        if (minutos < 10) minutos = "0" + minutos;
        if (numeroDeSegundos < 10) numeroDeSegundos = "0" + numeroDeSegundos;

        return `${horas}:${minutos}:${numeroDeSegundos}`;
    };
    // Variables "globales"
    let tiempoInicio, mediaRecorder, idIntervalo;
    const refrescar = () => {
            $duracion.textContent = segundosATiempo((Date.now() - tiempoInicio) / 1000);
        }
        // Consulta la lista de dispositivos de entrada de audio y llena el select
   
    // Ayudante para la duración; no ayuda en nada pero muestra algo informativo
    const comenzarAContar = () => {
        tiempoInicio = Date.now();
        idIntervalo = setInterval(refrescar, 500);
    };

    // Comienza a grabar el audio con el dispositivo seleccionado
    const comenzarAGrabar = (e) => {
        e.preventDefault();
        navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId:"defalut",// $listaDeDispositivos.value,
                }
            })
            .then(stream => {
                // Comenzar a grabar con el stream
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                comenzarAContar();
                // En el arreglo pondremos los datos que traiga el evento dataavailable
                const fragmentosDeAudio = [];
                // Escuchar cuando haya datos disponibles
                mediaRecorder.addEventListener("dataavailable", evento => {
                    // Y agregarlos a los fragmentos
                    fragmentosDeAudio.push(evento.data);
                });
                // Cuando se detenga (haciendo click en el botón) se ejecuta esto
                mediaRecorder.addEventListener("stop", (e) => {
                    e.preventDefault();
                    // Detener el stream
                    stream.getTracks().forEach(track => track.stop());
                    // Detener la cuenta regresiva
                    detenerConteo();
                    // Convertir los fragmentos a un objeto binario
                    const blobAudio = new Blob(fragmentosDeAudio);
                    const formData = new FormData();
                    // Enviar el BinaryLargeObject con FormData
                    formData.append("audio", blobAudio);
                    const RUTA_SERVIDOR = "/concesionaria/wp-content/plugins/acf-grabador-audio/guardar.php";
                    fetch(RUTA_SERVIDOR, {
                            method: "POST",
                            body: formData,
                        })
                        .then(respuestaRaw => respuestaRaw.text()) // Decodificar como texto
                        .then(respuestaComoTexto => {
                            // Aquí haz algo con la respuesta ;)
                            console.log("La respuesta: ", respuestaComoTexto);
                            console.log( $btnDetenerGrabacion.dataset.idinput);
                            var input_url=document.getElementById($btnDetenerGrabacion.dataset.idinput);
                            input_url.value="/wp-content/plugins/acf-grabador-audio/"+respuestaComoTexto;
                            //wp-content/plugins/acf-grabador-audio/ agregar para guardar la ruta
                            // Abrir el archivo, es opcional y solo lo pongo como demostración
                            $duracion.innerHTML = `<strong>Audio subido correctamente.</strong>&nbsp; <a href="${respuestaComoTexto}">Abrir</a>`
                        })
                });
            })
            .catch(error => {
                // Aquí maneja el error, tal vez no dieron permiso
                console.log(error)
            });
    };


    const detenerConteo = () => {
        clearInterval(idIntervalo);
        tiempoInicio = null;
        $duracion.textContent = "";
    }

    const detenerGrabacion = (e) => {
        e.preventDefault();
        if (!mediaRecorder) return alert("No se está grabando");
        mediaRecorder.stop();
        mediaRecorder = null;
    };


    $btnComenzarGrabacion.addEventListener("click", comenzarAGrabar);
    $btnDetenerGrabacion.addEventListener("click", detenerGrabacion);

    // Cuando ya hemos configurado lo necesario allá arriba llenamos la lista

    llenarLista();
}
// Esperar a que el documento esté listo...
document.addEventListener("DOMContentLoaded", init);