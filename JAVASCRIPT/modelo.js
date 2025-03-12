const UmbralMaximo = 5000;

async function buscarDataInventarioEquipos() {
  const filter = "";
  const adicionales = '$select=ID,Title,marca,modelo,serial,placa_inventario,tipo_equipo,sistema_operativo,capacidad_disco,capacidad_memoria';
  try {
      const datos = await consultarListaSobreUmbral(listaEquiposInformaticos, filter, adicionales);
      return datos;
  } catch (error) {
      console.error('Error al buscar datos:', error);
  }
}


async function buscarRegistroInventarioEquipos(id){

  sessionStorage.setItem('idEliminacion', id);

  const filter = "";
  const campos = ["ID", "Title", "marca", "modelo", "serial", "placa_inventario", "tipo_equipo", "sistema_operativo", "capacidad_disco", "capacidad_memoria"];
  
  try {
    const datos = await consultarUnRegistro(listaEquiposInformaticos, filter, campos, id)
    return datos;
  }catch (error){
    console.error('Error al buscar datos:', error);
  }
}


async function consultarListaSobreUmbral(ListName, filtro, adicionales) {
    
    direccion = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('${ListName}')/items`;
    if (adicionales) { adicionales = "&" + adicionales; }
    const DireccionLongitudMaximalista = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('${ListName}')/ItemCount`;

    try {
      const LongitudRegistros = await LongitudMaximaLista(DireccionLongitudMaximalista);
      const IdFinal = await CountMaxItems(direccion);
  
      const ciclo = Math.ceil(LongitudRegistros / UmbralMaximo);
      const datosListaModificada = [];

      for (let i = 0; i < ciclo; i++) {
        let cantidadMinima = Math.max(IdFinal - UmbralMaximo + 1, 1);
        const cantidadMaxima = IdFinal;
  
        const Filter = (!filtro)
          ? `?$filter=(Id ge ${cantidadMinima}) and (Id le ${cantidadMaxima})${adicionales}`
          : `?$filter=(Id ge ${cantidadMinima}) and (Id le ${cantidadMaxima}) and ${filtro}${adicionales}`;
  
        const urlListaModificada = `${direccion}${Filter}`;
  
        const data = await consumirServicio(urlListaModificada);
        datosListaModificada.push(...data.d.results);
  
        cantidadMinima = Math.max(cantidadMaxima - UmbralMaximo + 1, 1);
      }
  
      return datosListaModificada;
  
    } catch (error) {
      console.error('Error al consultar lista sobre umbral:', error);
      throw error;
    }
  }

  

  async function CountMaxItems(direccion) {
    try {
      const direcciondesc = `${direccion}?$Top=1&$OrderBy=Id desc&$Select=ID`;
      const datadesc = await consumirServicio(direcciondesc);
      return datadesc.d.results[0] ? datadesc.d.results[0].Id : 0;
    } catch (error) {
      console.error('Error al obtener el máximo ID de la lista:', error);
      throw error;
    }
  }
  
  async function LongitudMaximaLista(DireccionLongitudMaximalista) {
    try {
      const datatotal = await consumirServicio(DireccionLongitudMaximalista);
      if (datatotal && datatotal.d && datatotal.d.ItemCount !== undefined) {
        return datatotal.d.ItemCount;
      } else {
        console.error('Error inesperado LongitudMaximaLista:', datatotal);
        throw new Error('Error inesperado al obtener la longitud máxima de la lista.');
      }
    } catch (error) {
      console.error('Error al obtener la longitud máxima de la lista:', error);
      throw error;
    }
  }


  async function consumirServicio(direccion, funcionexitosa, funcionError) {
    try {
      const response = await fetch(direccion, {
        method: "GET",
        headers: {
          "Accept": "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose"
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al consumir el servicio:', error);
      throw error;
    }
  }

/* -------------------------------- FUNCIONES (CRUD), SHAREPOINT -------------------------------- */


async function insertarDatos(url, objetoDatos, nombreLista) {
    const spdata = `SP.Data.${nombreLista}ListItem`;
    objetoDatos.__metadata = { type: spdata };
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Accept: "application/json;odata=verbose",
                "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
                "Content-Type": "application/json;odata=verbose"
            },
            body: JSON.stringify(objetoDatos)
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error(`Error HTTP: ${response.status}`);
        }
    } catch (error) {
        throw error;
    }
}


async function verificarExistencia(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json;odata=verbose"
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.d.results.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}


async function consultarUnRegistro(ListName, filtro, campos, ID) {
    
  const direccion = `${_spPageContextInfo.webAbsoluteUrl}/_api/web/lists/getbytitle('${ListName}')/items?$filter=ID eq ${ID}${filtro ? ` and ${filtro}` : ''}`;

  const camposSelect = campos.length > 0 ? `$select=${campos.join(',')}` : '';
  const url = `${direccion}&${camposSelect}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json;odata=verbose"
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.d.results.length > 0) {
        return data.d.results[0]; 
      } else {
        return null;
      }
    } else {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}



async function actualizarDatos(urlBase, datosActualizar, lista, idRegistro) {
  try {
    const response = await fetch(`${urlBase}/_api/Web/Lists/GetByTitle('${lista}')/items?$filter=ID eq ${idRegistro}`, {
      method: "GET",
      headers: {
        Accept: "application/json;odata=verbose"
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.d.results.length > 0) {
        const registroID = data.d.results[0].ID; 

        const spdata = `SP.Data.${lista}ListItem`;
        const dataActualizar = {};

        for (const campo in datosActualizar) {
          dataActualizar[campo] = datosActualizar[campo];
        }
        dataActualizar.__metadata = { type: `${spdata}` };

        const actualizarUrl = `${urlBase}/_api/Web/Lists/GetByTitle('${lista}')/items(${registroID})`;
        const actualizarResponse = await fetch(actualizarUrl, {
          method: "MERGE",
          headers: {
            Accept: "application/json;odata=verbose",
            "X-RequestDigest": document.getElementById("__REQUESTDIGEST").value,
            "Content-Type": "application/json;odata=verbose",
            "IF-MATCH": "*"
          },
          body: JSON.stringify(dataActualizar)
        });

        if (actualizarResponse.ok) {
          return true;
        } else {
          throw new Error(`Error al actualizar: ${actualizarResponse.status}`);
        }
      } else {
        return false;
      }
    } else {
      throw new Error(`Error HTTP: ${response.status}`);
    }
  } catch (error) {
    console.error("Error", error);
    throw error;
  }
}