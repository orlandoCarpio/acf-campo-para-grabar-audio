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
var thisStop,thisStar;

const init = () => {
        const tieneSoporteUserMedia = () =>
            !!(navigator.mediaDevices.getUserMedia)

        // Si no soporta...
        // Amable aviso para que el mundo comience a usar navegadores decentes ;)
        if (typeof MediaRecorder === "undefined" || !tieneSoporteUserMedia())
            return alert("Tu navegador web no cumple los requisitos; por favor, actualiza a un navegador decente como Firefox o Google Chrome");
         // Declaración de elementos del DOM
           var $duracion = "2";
             var $audioInput=jQuery(".audio-input");
        // Algunas funciones útiles
        $audioInput.each(function(index,element){
            if(element.value!=""){
                console.log(element);
                element.nextElementSibling.classList.remove('ocultar-elemento');
                element.nextElementSibling.classList.add('mostrar-grid');

            }
        });
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
                $duracion[0].textContent = segundosATiempo((Date.now() - tiempoInicio) / 1000);
            }
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
                        const RUTA_SERVIDOR = "/peritajes/wp-content/plugins/acf-grabador-audio/guardar.php";
                        fetch(RUTA_SERVIDOR, {
                                method: "POST",
                                body: formData,
                            })
                            .then(respuestaRaw => respuestaRaw.text()) // Decodificar como texto
                            .then(respuestaComoTexto => {
                                // Aquí haz algo con la respuesta ;)
                                
                                  var inputValor=jQuery(thisStop).parent().next().next();
                               inputValor[0].value="https://elementaldesign.com.ar/peritajes/wp-content/plugins/acf-grabador-audio/"+respuestaComoTexto;
                                jQuery(thisStop).parent().removeClass('botones-grabar');
                                jQuery(thisStop).parent().addClass('ocultar-elemento');
                            	alert("Audio Guardado");
                                var repAudio=jQuery(thisStop).parent().next();
                                
                                repAudio[0].classList.remove('ocultar-elemento');
                                repAudio[0].classList.add('mostrar');
                                repAudio[0].attributes[2].value="https://elementaldesign.com.ar/peritajes/wp-content/plugins/acf-grabador-audio/"+respuestaComoTexto;
                                var botonesAccion=repAudio.next().next();
                                botonesAccion.removeClass('ocultar-elemento');
                                botonesAccion.addClass('mostrar-grid');
                               
                               
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
        }
        //nuevo
        const borrarAudio=(thisBorrarAudio)=>{
            var audio=jQuery(thisBorrarAudio).parent().prev().prev();
                audio[0].attributes[2].value=""; 
                audio[0].classList.remove("mostrar");
                audio[0].classList.add('ocultar-elemento');
                jQuery(thisBorrarAudio).parent().prev().prev().prev().removeClass('ocultar-elemento').addClass('botones-grabar');   
                //inicio
                 var buttonDisable=jQuery(thisBorrarAudio).parent().prev().prev().prev();    
                buttonDisable[0].children[0].disabled=false;
                buttonDisable[0].children[0].classList.remove('bloquear');
                buttonDisable[0].children[1].disabled=false;
                buttonDisable[0].children[1].classList.remove('bloquear');
                buttonDisable[0].children[2].classList.remove('duracion');
                buttonDisable[0].children[2].classList.add('ocultar-elemento');
                 buttonDisable[0].children[3].classList.remove('ocultar-elemento');
                buttonDisable[0].children[3].classList.add('mostrar');
                //fin
                
                jQuery(thisBorrarAudio).parent().removeClass('mostrar-grid').addClass('ocultar-elemento');
            var inputValor=jQuery(thisBorrarAudio).parent().prev(); 
                inputValor[0].value;
                if(inputValor[0].value!=""){
                    jQuery.get('/peritajes/wp-content/plugins/acf-image-mapping-hotspots/borrar-audio.php',{'url':inputValor[0].value},function(data){
                        console.log(data);
                    })
                }
                console.log(); 
                 $duracion.textContent = "";
            
        }
        const borrarFilaCompleta=(thisf,inputs)=>{
            var fila1=jQuery(thisf).parent().parent().parent().parent();
            var indice=fila1[0].children[0].children[0].textContent;
            var span=jQuery('.image_mapping-image span');
            var inputValor=inputs; //jQuery(thisBorrarFila).parent().prev(); 
                if(inputValor[0].value!=""){
                    jQuery.get('/peritajes/wp-content/plugins/acf-image-mapping-hotspots/borrar-audio.php',{'url':inputValor[0].value},function(data){
                        console.log(data);
                    })
                }
            span[indice-1].click();
        }
        const borrarFila=(thisBorrarFila)=>{
            var inputValor=jQuery(thisBorrarFila).parent().prev(); 
             borrarFilaCompleta(thisBorrarFila,inputValor);


        }
        //nuevo1
        const botonBorrarFila=(thisFila)=>{
            var inputValor=jQuery(thisFila).parent().next().next(); 
            borrarFilaCompleta(thisFila,inputValor);

        }

        jQuery('body').on('click','.btnComenzarGrabacion',function(e){
            e.preventDefault();
            thisStar=this;
             if(jQuery(this).next().next().next().hasClass('mostrar'))
                jQuery(this).next().next().next().removeClass('mostrar').addClass('ocultar-elemento');
            else
            	jQuery(this).next().next().next().addClass('ocultar-elemento'); 
            $duracion=jQuery(this).next().next();
           
            if($duracion.hasClass('ocultar-elemento'))
                $duracion.removeClass('ocultar-elemento');
            $duracion.addClass('duracion'); 
            this.disabled = true;
            this.classList.add('bloquear');
            comenzarAGrabar(e);
        }
        );
        jQuery('body').on('click','.btnDetenerGrabacion',function(e){
            e.preventDefault();
            thisStop=this;
            
            if (!mediaRecorder) 
                return alert("No se está grabando");
            else
                this.disabled = true;  
             this.classList.add('bloquear');   
            mediaRecorder.stop();
            mediaRecorder = null;
        });
        
        jQuery('body').on('click','.btnBorrarFila',function(){
            botonBorrarFila(this);
        });
        jQuery("body").on("click",".btn-borrar-audio",function(e){
            borrarAudio(this);
        });
        jQuery("body").on('click','.btn-borrar-fila',function(e){
            borrarFila(this);
        });
    }
    // Esperar a que el documento esté listo...
document.addEventListener("DOMContentLoaded", init);