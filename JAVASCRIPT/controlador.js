document.addEventListener('DOMContentLoaded', async function () {
  await actualizarTablaInventario();
});

async function actualizarTablaInventario() {
    controlRotation(iconoActualizarEquipos, true);
    const datosInventario = await buscarDataInventarioEquipos();
    cargarTablaInventario(datosInventario);
    controlRotation(iconoActualizarEquipos, false);
}

async function modificarRegistroInventario(id){
    const registro = await buscarRegistroInventarioEquipos(id);
    llenarCamposConRegistro(registro);
}

document.addEventListener('click', async function (event) {
    if (event.target && (event.target.id === 'botonRegistrar' || event.target.id === 'botonActualizar')) {
        
        const esRegistro = event.target.id === 'botonRegistrar';
        const PROVEEDOR = proveedorSelect.value;
        const MARCA = marcaSelect.value;
        const MODELO = modeloSelect.value;
        const SERIAL = serialInput.value;
        const PLACA = placaInput.value;
        const TIPO_EQUIPO = tipoEquipoSelect.value;
        const SISTEMA_OPERATIVO = sistemaOperativoSelect.value;
        const CAPACIDAD_DISCO = capacidadDiscoDuroSelect.value;
        const MEMORIA_RAM = memoriaRAMSelect.value;
        
        const campos = [
            { valor: PROVEEDOR, elemento: proveedorSelect },
            { valor: MARCA, elemento: marcaSelect },
            { valor: MODELO, elemento: modeloSelect },
            { valor: SERIAL, elemento: serialInput },
            { valor: PLACA, elemento: placaInput },
            { valor: TIPO_EQUIPO, elemento: tipoEquipoSelect },
            { valor: SISTEMA_OPERATIVO, elemento: sistemaOperativoSelect },
            { valor: CAPACIDAD_DISCO, elemento: capacidadDiscoDuroSelect },
            { valor: MEMORIA_RAM, elemento: memoriaRAMSelect }
        ];

        if (!validarCamposEquipos(campos)) return;

        if (esRegistro) {
            if (await verificarExistencia(`${urlSitio}/_api/Web/Lists/GetByTitle('${listaEquiposInformaticos}')/items?$select=ID&$filter=serial eq '${SERIAL}'`)) {
                mostrarAlerta('Serial', 'El equipo no puede ser registrado porque el Serial ya existe en la base de datos.', 'warning');
                return;
            }
            
            if (await verificarExistencia(`${urlSitio}/_api/Web/Lists/GetByTitle('${listaEquiposInformaticos}')/items?$select=ID&$filter=placa_inventario eq '${PLACA}'`)) {
                mostrarAlerta('Placa Inventario', 'El equipo no puede ser registrado porque la Placa Inventario ya existe en la base de datos.', 'warning');
                return;
            }
        }

        const objetoEquipos = {
            Title: PROVEEDOR,
            marca: MARCA,
            modelo: MODELO,
            serial: SERIAL,
            placa_inventario: PLACA,
            tipo_equipo: TIPO_EQUIPO,
            sistema_operativo: SISTEMA_OPERATIVO,
            capacidad_disco: CAPACIDAD_DISCO,
            capacidad_memoria: MEMORIA_RAM
        };
        
        if (esRegistro) {
            await insertarDatos(`${urlSitio}/_api/Web/Lists/GetByTitle('${listaEquiposInformaticos}')/items`, objetoEquipos, listaEquiposInformaticos);
            mostrarMensajeExito('El registro se guardó correctamente.');
        } else {
            const idRegistro = sessionStorage.getItem('idEliminacion');
            actualizarDatos(urlSitio, objetoEquipos, listaEquiposInformaticos, idRegistro);
            sessionStorage.removeItem('idEliminacion');
            mostrarMensajeExito('El registro se ha actualizado correctamente.');
        }

        limpiarCampos();
        document.querySelector('.containerFormularioEquipos').style.display = 'none';
        await actualizarTablaInventario();
    }
});




