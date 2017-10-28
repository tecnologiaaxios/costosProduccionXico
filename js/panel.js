const db = firebase.database();
const auth = firebase.auth();
var listaSubProductos = [];
var clavesSubProductos = [];

function logout() {
  auth.signOut();
}

$('#producto').keyup(function () {
  $(this).val($(this).val().toUpperCase());
});

$('#subProductos').change(function () {
  let id = $(this).val();

  let subProductosRef = db.ref(`subProductos/${id}`);
  subProductosRef.once('value', function(snap) {
    let subProducto = snap.val();
    $('#nombreSubProducto').val(subProducto.nombre);
  });
});

$('#tabla-subProductos-editar td').on('change', function(evt, newValue) {
	let formulasRef = db.ref('formulaciones');

});

function llenarSelectSubProductos() {
  let subProd = db.ref('subProductos');
  subProd.on('value', function(snap) {
    let subProductos = snap.val();
    let options = "";
    for(let subProducto in subProductos) {
      options += `<option value="${subProducto}">${subProducto} - ${subProductos[subProducto].nombre}</option>`;
    }
    $('#subProductos').html(options);
  });
}

function llenarSelectCategorias() {
  let cat = db.ref('categoriasPT');
  cat.on('value', function(snap) {
    let categorias = snap.val();
    let options = "";
    for (let categoria in categorias) {
      options += `<option value="${categorias[categoria].nombre}">${categorias[categoria].nombre}</option>`;
    }
    $('#categoria').html(options);
  })
}

function llenarSelectTiposFormulaciones() {
  let tF = db.ref('tiposFormulaciones');
  tF.on('value', function(snap) {
    let tipos = snap.val();
      let options = "";
      for(let tipo in tipos) {
        options += `<option value="${tipos[tipo].nombre}">${tipos[tipo].nombre}</option>`;
      }
      $('#tipoFormulacion').html(options);
  });
}

function llenarSelectTiposFormulacionesModalEditar() {
  let tF = db.ref('tiposFormulaciones');
  tF.on('value', function(snap) {
    let tipos = snap.val();
      let options = "";
      for(let tipo in tipos) {
        options += `<option value="${tipos[tipo].nombre}">${tipos[tipo].nombre}</option>`;
      }
      $('#tipoFormulacionSPEditar').html(options);
  });
}

function agregarSubProducto() {
  let id = $('#subProductos').val();
  let nombre = $('#subProductos option:selected').text();
  let valorConstante = $('#cantidad').val();
  let tipoFormulacion = $('#tipoFormulacion').val();

  let fila = `<tr>
                <td>${id}</td>
                <td>${nombre}</td>
                <td>${tipoFormulacion}</td>
                <td>${valorConstante}</td>
              </tr>`;

  $('#tabla-subProductos tbody').append(fila);

  let datos = {
    nombre: nombre,
    valorConstante: valorConstante,
    tipoFormulacion: tipoFormulacion
  }

  listaSubProductos.push(datos);
  clavesSubProductos.push(id);
  $('#cantidad').val('');
  $('#tipoFormulacion').val('');
}

function guardarSubProducto() {
  let id = $('#idSubProducto').val();
  let nombre = $('#nombreSubProducto').val();

  let subProductosRef = db.ref(`subProductos/${id}`);
  subProductosRef.once('value', function(snapshot) {
    if(snapshot.hasChildren()) {
      alert("Ya existe un subproducto con ese id");
    }
    else {
      let datos = {
        nombre: nombre
      }
      subProductosRef.set(datos);
      $('#idSubProducto').val('');
      $('#nombreSubProducto').val('');
    }
  });
}

function guardarFormula() {
  let producto = $('#producto').val();
  let nombre = $('#nombre').val();
  let categoria = $('#categoria').val();

  let formulacionesRef = db.ref(`formulaciones/${producto}`);
  formulacionesRef.once('value', function(snapshot) {
    if(snapshot.hasChildren()) {
      //Ya esta la formula
      $.toaster({ priority : 'danger', title : 'Mensaje de información', message : 'Este producto ya tiene una fórmula'});
    }
    else {
      let datos = {
        nombre: nombre,
        categoria: categoria
      }
      formulacionesRef.set(datos);

      for(let i in listaSubProductos) {
        let ruta = db.ref(`formulaciones/subProductos/${producto}/${clavesSubProductos[i]}`);
        ruta.set(listaSubProductos[i]);
      }
      listaSubProductos = [];
      clavesSubProductos = [];

      $.toaster({ priority : 'success', title : 'Mensaje de información', message : 'La fórmula se guardó correctamente'});
      $('#producto').val('');
      $('#nombre').val('');
      $('#categoria').val('');
    }
  });
}

function mostrarProductos(categoria) {
  let tabla = $(`#tabla-${categoria}`).DataTable({
    "lengthChange": false,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "pageLength": 5
  });

  let jamonesRef = db.ref('formulaciones');
  jamonesRef.orderByChild('categoria').equalTo(categoria.toUpperCase()).on('value', function(snapshot) {
    let productos = snapshot.val();
    let filas = "";

    tabla.clear();

    for(let producto in productos) {
      filas += `<tr>
                  <td>${producto}</td>
                  <td>${productos[producto].nombre}</td>
                  <td class="text-center"><button class="btn btn-warning btn-sm" onclick="abrirModalEditar('${producto}')"><i class="fa fa-pencil" aria-hidden="true"></i></button></td>
                  <td class="text-center"><button class="btn btn-danger btn-sm" onclick="abrirModalEliminar('${producto}')"><i class="fa fa-times" aria-hidden="true"></i></button></td>
                </tr>`;
    }
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

/*function mostrarSubProductos() {
  let subProductosRef = db.ref('subProductos');
  subProductosRef.on('value', function(snapshot) {
    let subProductos = snapshot.val();
    let filas = "";

    for(let subProducto in subProductos) {
      filas += `<tr>
                  <td><input type="checkbox"</td>
                  <td>${subProducto}</td>
                  <td>${subProductos[subProducto].nombre}</td>
                  <td><select class="form-control input-sm tipoFormulacion"></select></td>
                  <td><input class="form-control input-sm" type="number"</td>
                </tr>
               `
    }

    $('#tabla-subProductos tbody').html(filas);
  });
}*/

function abrirModalAgregrar() {
  $('#modalAgregarFormula').modal('show');
  //mostrarSubProductos();

  llenarSelectSubProductos();
  llenarSelectCategorias();
  llenarSelectTiposFormulaciones();
}

function abrirModalEditar(claveProducto) {
  $('#modalEditarFormula').modal('show');
  $(`#nombreEditar`).attr('readonly', false);
  $(`#categoriaEditar`).attr('readonly', false);
  let formulaRef = db.ref(`formulaciones/${claveProducto}`);
  formulaRef.on('value', function(snapshot) {
    let formula = snapshot.val();

    $('#productoEditar').val(claveProducto);
    $('#nombreEditar').val(formula.nombre);
    $('#categoriaEditar').val(formula.categoria);

    let subProductos = formula.subProductos;
    let filas = "";

    for(let subProducto in subProductos) {
      filas += `<tr id="tr-${subProducto}">
                  <td>${subProducto}</td>
                  <td><input id="nombre-${subProducto}" readonly class="form-control input-sm" value="${subProductos[subProducto].nombre}"></td>
                  <td><input id="tipoFormulacion-${subProducto}" readonly class="form-control input-sm" value="${subProductos[subProducto].tipoFormulacion}"></td>
                  <td><input id="valorConstante-${subProducto}" readonly class="form-control input-sm" value="${subProductos[subProducto].valorConstante}"></td>
                  <td class=text-center><button class="btn btn-warning btn-sm" onclick="habilitarEditado('nombre-${subProducto}', 'tipoFormulacion-${subProducto}', 'valorConstante-${subProducto}')"><i class="fa fa-pencil" aria-hidden="true"></i></button></td>
                  <td class=text-center><button class="btn btn-success btn-sm" onclick="guardarEditado('${subProducto}', 'nombre-${subProducto}', 'tipoFormulacion-${subProducto}', 'valorConstante-${subProducto}')"><i class="fa fa-floppy-o" aria-hidden="true"></i></button></td>
                </tr>`;
    }

    $('#tabla-subProductos-editar tbody').html(filas);
    $('#btnGuardarCambios').attr('onclick', `guardarCambiosFormula()`);
    //$('#tabla-subProductos-editar').editableTableWidget();
  });
}

function habilitarEditado(idCampoNombre, idCampoTipoFormulacion, idCampoValorConstante) {
  $(`#${idCampoNombre}`).attr('readonly', false);
  $(`#${idCampoTipoFormulacion}`).attr('readonly', false);
  $(`#${idCampoValorConstante}`).attr('readonly', false);
  //console.log($(`#${idCampoNombre}`).val());
}

function guardarEditado(idSubProducto, idCampoNombre, idCampoTipoFormulacion, idCampoValorConstante){
  let campoNombre = $(`#${idCampoNombre}`).val()
  let campoTipoFormulacion = $(`#${idCampoTipoFormulacion}`).val()
  let campoValorConstante = $(`#${idCampoValorConstante}`).val()
  $('#modalConfirmarGuardar').modal('show');
  $('#btnGuardar').attr('onclick', `guardarSubProductoEditado('${idSubProducto}', '${campoNombre}', '${campoTipoFormulacion}', '${campoValorConstante}')`);
  //console.log(idSubProducto);

}



function abrirModalEliminar(claveProducto) {
  $('#modalConfirmarEliminar').modal('show');
  $('#btnEliminar').attr('onclick', `eliminarFormula('${claveProducto}')`);
}

function guardarSubProductoEditado(idSubProducto, campoNombre, campoTipoFormulacion, campoValorConstante){
  let producto = $('#productoEditar').val();
  let rutaFormula = db.ref(`formulaciones/${producto}/subProductos/${idSubProducto}`);
  //console.log(rutaFormula);
  let datos = {
    nombre: campoNombre,
    tipoFormulacion: campoTipoFormulacion,
    valorConstante: campoValorConstante
  }
  rutaFormula.set(datos);
  $.toaster({ priority : 'success', title : 'Mensaje de información', message : 'La fórmula se guardó correctamente'});
  $('#modalConfirmarGuardar').modal('hide');
}

function guardarCambiosFormula() {
  let claveProducto = $('#productoEditar').val();
  let nombreProducto = $('#nombreEditar').val();
  let categoriaProducto = $('#categoriaEditar').val();

  let refEditarProducto = db.ref(`formulaciones/${claveProducto}`)
  refEditarProducto.update({
    nombre: nombreProducto,
    categoria: categoriaEditar
  });
}

/*function abrirModalEditarSubProducto(claveProducto, idSubProducto) {
  $('#modalEditarSubProducto').modal('show');
  llenarSelectTiposFormulacionesModalEditar();

  let ruta = db.ref(`formulaciones/${claveProducto}/subProductos/${idSubProducto}`);
  ruta.on('value', function(snapshot) {
    let datos = snapshot.val();
    $('#nombreSPEditar').val(datos.nombre);
    $('#tipoFormulacionSPEditar').val(datos.tipoFormulacion);
    $('#valorConstanteSPEditar').val(datos.valorConstante);
  })
}*/

function eliminarFormula(claveProducto) {
  let formulasRef = db.ref('formulaciones');
  formulasRef.child(claveProducto).remove();
  $.toaster({ priority : 'success', title : 'Mensaje de información', message : 'La fórmula se eliminó correctamente'});
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();

      mostrarProductos("jamones");
      mostrarProductos("salchichas");
      mostrarProductos("chorizos");
      mostrarProductos("delicatessen");
      mostrarProductos("otros");
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+usuario+'/lista');
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    let lis = "";

    let arrayNotificaciones = [];
    for(let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    arrayNotificaciones.reverse();

    for(let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>' +
               '<a>' +
                '<div>' +
                  '<i class="fa fa-comment fa-fw"></i> ' + arrayNotificaciones[i].mensaje +
                    '<span class="pull-right text-muted small">'+fecha+'</span>' +
                '</div>' +
               '</a>' +
             '</li>';
    }

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
  });
}

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+uid);
  notificacionesRef.on('value', function(snapshot) {
    let cont = snapshot.val().cont;

    if(cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+uid);
  notificacionesRef.update({cont: 0});
}

$('#campana').click(function() {
  verNotificaciones();
});

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
