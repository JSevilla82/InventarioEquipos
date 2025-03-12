//Variables - Elementos del DOM
var proveedorSelect = document.getElementById('proveedor');
var marcaSelect = document.getElementById('marca');
var modeloSelect = document.getElementById('modelo');
var serialInput = document.getElementById('serial');
var placaInput = document.getElementById('placa');
var tipoEquipoSelect = document.getElementById('tipoEquipo');
var sistemaOperativoSelect = document.getElementById('sistemaOperativo');
var capacidadDiscoDuroSelect = document.getElementById('capacidadDiscoDuro');
var memoriaRAMSelect = document.getElementById('memoriaRAM');

const formularioInventarioEquipos = document.querySelector('.containerFormularioEquipos');

var botonReiniciar = document.getElementById("botonReiniciar");
var botonRegistrar = document.getElementById("botonRegistrar");

const iconoActualizarEquipos = document.getElementById('iconActualizarEI');

var listaEquiposInformaticos = "EquiposInformaticos";
var urlSitio = `${_spPageContextInfo.webAbsoluteUrl}`;

const titulo = document.querySelector('.tituloContainerInfo');

document.addEventListener('DOMContentLoaded', async function() {


	document.querySelector('.containerFormularioEquipos').style.display = 'none';

	placaInput.addEventListener('input', function() {
		placaInput.value = placaInput.value.substring(0, 20).toUpperCase();
	});

	serialInput.addEventListener('input', function() {
		serialInput.value = serialInput.value.substring(0, 20).toUpperCase();
	});

	$('#tablaDatos').DataTable();
});

/* ---------------- Controlar los contenedores - Menú Principal -------------- */

document.addEventListener("DOMContentLoaded", function () {

    const menuLinks = document.querySelectorAll(".nav-menu a");

    menuLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); 

            const targetId = this.getAttribute("data-target");

            const allContents = document.querySelectorAll(".content");
            allContents.forEach(content => {
                content.classList.remove("active");
            });

            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });

    const firstContent = document.querySelector(".content");
    if (firstContent) {
        firstContent.classList.add("active");
    }
});


document.querySelector('.btn-Nuevo').addEventListener('click', function() {
	titulo.textContent = 'Nuevo Registro';
    establecerBotonesRegistro();
	formularioInventarioEquipos.style.display = 'grid';
});


document.querySelector('.btn-Actualizar').addEventListener('click', async function() {
	await actualizarTablaInventario();
    mostrarMensajeExito('El contenido de la tabla ha sido actualizado.');
});

document.querySelector('.btn-SubirArchivo').addEventListener('click', function(){
    mostrarAlerta('Subir Archivo', 'Funcionalidad en desarrollo. Próximamente disponible.', 'warning');
})


/*--------------- Función para Controlar la rotación de iconos ----------------*/
function controlRotation(iconElement, shouldRotate) {
   
    if (shouldRotate) {
        iconElement.classList.add('rotating');
    } else {
        iconElement.classList.remove('rotating');
    }
}

async function verificarCampo(input, campoFiltro, urlSitio, listaEquiposInformaticos) {

	const valor = input.value.trim();

	if (valor === '') {
		input.classList.remove("input-Existe", "input-NoExiste");
		return;
	}

	const urlVerificar = `${urlSitio}/_api/Web/Lists/GetByTitle('${listaEquiposInformaticos}')/items?$select=ID&$filter=${campoFiltro} eq '${valor}'`;
	const validarValor = await verificarExistencia(urlVerificar);

	if (validarValor) {
		input.classList.add("input-Existe");
		input.classList.remove("input-NoExiste");
	} else {
		input.classList.add("input-NoExiste");
		input.classList.remove("input-Existe");
	}
}


serialInput.addEventListener('input', async function(event) {
	await verificarCampo(event.target, 'serial', urlSitio, listaEquiposInformaticos);
});


placaInput.addEventListener('input', async function(event) {
	await verificarCampo(event.target, 'placa_inventario', urlSitio, listaEquiposInformaticos);
});


function mostrarAlerta(titulo, texto, icono) {
	Swal.fire({
		title: titulo,
		text: texto,
		icon: icono,
		confirmButtonColor: '#0086CB',
		confirmButtonText: 'Aceptar'
	});
}


function mostrarMensajeExito(mensaje) {
	Swal.fire({
		title: 'Éxito',
		text: mensaje,
		icon: 'success',
		showConfirmButton: false,
		timer: 2000
	});
}


function limpiarCampos() {

	const camposSelect = document.querySelectorAll('select');
	const camposInput = document.querySelectorAll('input[type="text"]');

	camposSelect.forEach(function(select) {
		select.selectedIndex = 0;
		select.classList.remove('input-error');
	});

	camposInput.forEach(function(input) {
		input.value = '';
		input.classList.remove('input-error');
	});

	serialInput.classList.remove("input-Existe", "input-NoExiste", "input-error");
	placaInput.classList.remove("input-Existe", "input-NoExiste", "input-error");

	console.log("Campos reiniciados y errores eliminados.");
}


function validarCamposEquipos(campos) {
	let validacionCorrecta = true;
	let camposVacios = [];

	campos.forEach(campo => {
		if (!campo.valor || (campo.elemento.tagName === 'SELECT' && campo.valor === 'Seleccionar')) {
			camposVacios.push(campo.elemento);
			validacionCorrecta = false;

			// Agregar event listener para eliminar la clase cuando el usuario escribe o cambia el valor
			campo.elemento.addEventListener('input', () => campo.elemento.classList.remove('input-error'));
			campo.elemento.addEventListener('change', () => campo.elemento.classList.remove('input-error'));
		} else {
			campo.elemento.classList.remove('input-error');
		}

		if (campo.elemento.tagName === 'INPUT' && campo.valor.trim() === '' && campo.elemento !== placaInput) {
			camposVacios.push(campo.elemento);
			validacionCorrecta = false;

			// Agregar el mismo listener para inputs vacíos
			campo.elemento.addEventListener('input', () => campo.elemento.classList.remove('input-error'));
		}
	});

	if (!validacionCorrecta) {
		camposVacios.forEach(campo => {
			campo.classList.add('input-error');
		});

		mostrarAlerta("¡Atención!", "Por favor, asegúrate de completar todos los campos antes de continuar.", "warning");
	}

	return validacionCorrecta;
}


document.addEventListener('click', async function (event) {
    if (event.target && event.target.id === 'botonReiniciar') {
        limpiarCampos();
    }
});


/* ---------------- Botones del formulario - Inventario Equipos -------------- */

function establecerBotonesRegistro() {
    const container = document.querySelector(".containerBotones");
    container.innerHTML = `
        <button class="boton" id="botonReiniciar">Reiniciar</button>
        <button class="boton" id="botonRegistrar">Registrar</button>
    `;
}

function establecerBotonesModificacion() {
    const container = document.querySelector(".containerBotones");
    container.innerHTML = `
        <button class="boton" id="botonCancelar">Cancelar</button>
        <button class="boton" id="botonActualizar">Actualizar</button>
    `;
}

document.querySelector(".containerBotones").addEventListener("click", function(event) {
    if (event.target.classList.contains("boton")) {
        event.preventDefault();
    }
});

function cargarTablaInventario(datos) {
    
    $('#tablaDatos').DataTable().destroy();
    $('#tablaDatos tbody').empty();

    const columnas = [{
            data: 'ID', title: 'ID'
        }, {
            data: 'Title', title: 'Proveedor'
        }, {
            data: 'marca', title: 'Marca'
        }, {
            data: 'modelo', title: 'Modelo'
        }, {
            data: 'serial', title: 'Serial'
        }, {
            data: 'placa_inventario', title: 'Placa'
        }, {
            data: 'tipo_equipo', title: 'Tipo'
        }, {
            data: 'sistema_operativo', title: 'SO'
        }, {
            data: 'capacidad_disco', title: 'Disco'
        }, {
            data: 'capacidad_memoria', title: 'Ram'
        }, {
            data: null, title: 'Acciones', render: function(data, type, row) {
                return `<button class="btn btn-sm btn-edit" data-id="${row.ID}"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-delete" data-id="${row.ID}"><i class="fas fa-trash-alt"></i></button>`;
            }
        }
    ];

    $('#tablaDatos').DataTable({
        data: datos,
        columns: columnas,
        language: {
            url: '//cdn.datatables.net/plug-ins/1.10.21/i18n/Spanish.json'
        },
    });
}


// Escuchar los clics de los botones de editar y eliminar Inventario Equipos
$(document).on('click', '.btn-edit, .btn-delete', function(event) {
    event.preventDefault(); 
    const id = $(this).data('id');
    if ($(this).hasClass('btn-edit')) {
        modificarRegistro(id);
    } else if ($(this).hasClass('btn-delete')) {
        eliminarRegistro(id); 
    }
});


function modificarRegistro(id) {
    modificarRegistroInventario(id);
    titulo.textContent = `Modificando registro: ${id}`;
    establecerBotonesModificacion();
	formularioInventarioEquipos.style.display = 'grid';
}

async function llenarCamposConRegistro(registro) {
  proveedorSelect.value = registro.Title || '';
  marcaSelect.value = registro.marca || '';
  modeloSelect.value = registro.modelo || '';
  serialInput.value = registro.serial || '';
  placaInput.value = registro.placa_inventario || '';
  tipoEquipoSelect.value = registro.tipo_equipo || '';
  sistemaOperativoSelect.value = registro.sistema_operativo || '';
  capacidadDiscoDuroSelect.value = registro.capacidad_disco || '';
  memoriaRAMSelect.value = registro.capacidad_memoria || '';
}

function eliminarRegistro(id) {
}
