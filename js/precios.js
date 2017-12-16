const db = firebase.database();
const auth = firebase.auth();

var pagina = 0;

function logout() {
  auth.signOut();
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
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

function mostrarSubProductos() {
  let tabla = $(`#tabla-subProductos`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "500px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "ordering": false,
    "columns": [
      null,
      { "width": "25%" },
      null,
      null,
      null,
      null,
      null
    ]
  });

  let rutaSubProductos = db.ref('subProductos');
  rutaSubProductos.on('value', function(snapshot) {
    let subProductos = snapshot.val();
    let filas = "";
    tabla.clear();

    for(let subProducto in subProductos) {
      filas += `<tr>
                  <td>${subProducto}</td>
                  <td>${subProductos[subProducto].nombre}</td>
                  <td class="text-center">
                    <div class="input-group input-group-sm">
                      <select class="form-control" id="moneda-${subProducto}">
                        <option ${(subProductos[subProducto].moneda == "PESO") ? "selected" : "" } value="PESO">Peso</option>
                        <option ${(subProductos[subProducto].moneda == "DOLAR") ? "selected" : "" } value="DOLAR">Dolar</option>
                        <option ${(subProductos[subProducto].moneda == "EURO") ? "selected" : "" } value="EURO">Euro</option>
                      </select>
                      <span class="input-group-btn">
                        <button onclick="cambiarMoneda('${subProducto}', 'moneda-${subProducto}')" class="btn btn-info">Cambiar</button>
                      </span>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="input-group input-group-sm">
                      <span class="input-group-addon">${(subProductos[subProducto].moneda == "PESO" || subProductos[subProducto].moneda == "DOLAR") ? "$" : "&#8364;" }</span>
                      <input id="precio-${subProducto}" readonly type="number" class="form-control" value="${subProductos[subProducto].precio}">
                      <span class="input-group-btn">
                        <button onclick="habilitarEdicion('precio-${subProducto}')" class="btn btn-warning" type="button"><i class="fa fa-pencil" aria-hidden="true"></i></button>
                      </span>
                      <span class="input-group-btn">
                        <button onclick="guardarPrecio('${subProducto}', 'precio-${subProducto}')" class="btn btn-success" type="button"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
                      </span>
                    </div>
                  </td>
                  <td class="text-right">$ ${subProductos[subProducto].precioPesos}</td>
                  <td class="text-center">
                    <button class="btn btn-default btn-sm" type="button" onclick="abrirModalVer('${subProducto}')">Ver más <i class="glyphicon glyphicon-eye-open" aria-hidden="true"></i></button>
                  </td>
                  <td class="text-center"><button onclick="abrirModalConfirmar('${subProducto}')" class="btn btn-danger btn-sm"><i class="fa fa-times"></i></button></td>
                </tr>`;
    }

    tabla.rows.add($(filas)).columns.adjust().draw();
    tabla.page(pagina).draw('page');
  });
}

function abrirModalConfirmar(claveSubProducto) {
  $('#modal-confirmar').modal('show');
  $('#btnSi').attr('onclick', `eliminarSubProducto("${claveSubProducto}")`);
}

function eliminarSubProducto(claveSubProducto) {
  let rutaSubProductos = db.ref('subProductos');
  rutaSubProductos.child(claveSubProducto).remove();
  $('#modal-confirmar').modal('hide');
}

function abrirModalAgregar() {
  $('#modal-agregar').modal('show');
}

function cerrarModalAgregar() {
  $('#modal-agregar').modal('hide');

  $('#clave').val('');
  $('#nombre').val('');
  $('#moneda').val('');
  $('#descripcion').val('');
  $('#categoria').val('');
  $('#unidad').val('');
  $('#nombreProveedor').val('');
  $('#precio').val('');
  $('#precioPesos').val('');
  $('#codigoBarras').val('');

  $('#clave').parent().removeClass('has-error');
  $('#nombre').parent().removeClass('has-error');
  $('#moneda').parent().removeClass('has-error');
  $('#categoria').parent().removeClass('has-error');
  $('#unidad').parent().removeClass('has-error');
  $('#precio').parent().removeClass('has-error');

  $('#modal-agregar .modal-body span .help-block').addClass('hidden');
}

function permitirEditar() {
  $('#nombre-ver').removeAttr('readonly');
  $('#codigoBarras-ver').removeAttr('readonly');
  $('#nombreProveedor-ver').removeAttr('readonly');
  $('#categoria-ver').removeAttr('disabled');
  $('#unidad-ver').removeAttr('disabled');
  $('#descripcion-ver').removeAttr('readonly');

  $('#btnGuardar').removeClass('disabled');
}

$('#modal-ver').on('hide.bs.modal', function() {
  $('#nombre-ver').attr('readonly', true);
  $('#codigoBarras-ver').attr('readonly', true);
  $('#nombreProveedor-ver').attr('readonly', true);
  $('#categoria-ver').attr('disabled', true);
  $('#unidad-ver').attr('disabled', true);
  $('#descripcion-ver').attr('readonly', true);

  $('#nombre-ver').parent().removeClass('has-error');
  $('#moneda-ver').parent().removeClass('has-error');
  $('#categoria-ver').parent().removeClass('has-error');
  $('#unidad-ver').parent().removeClass('has-error');
  $('#precio-ver').parent().removeClass('has-error');

  $('#modal-ver .modal-body span .help-block').addClass('hidden');
});

function agregarSubProducto() {
  let clave = $('#clave').val();
  let nombre = $('#nombre').val();
  let moneda = $('#moneda').val();
  let descripcion = $('#descripcion').val();
  let categoria = $('#categoria').val();
  let unidad = $('#unidad').val();
  let nombreProveedor = $('#nombreProveedor').val();
  let precio = $('#precio').val();
  let precioPesos = Number($('#precioPesos').val());
  let codigoBarras = $('#codigoBarras').val();

  if(clave.length > 0 && nombre.length > 0 && moneda != null && moneda != undefined && categoria != null &&
    categoria != undefined && unidad != null && unidad != undefined && precio.length > 0) {

    let rutaSubProducto = db.ref(`subProductos/${clave}`);
    rutaSubProducto.once('value', function(snap) {
      if( !snap.hasChildren()) {
        if(nombreProveedor.length < 1) {
          nombreProveedor = "";
        }
        if(codigoBarras.length < 1) {
          codigoBarras = "";
        }
        if(descripcion.length < 1) {
          descripcion = "";
        }

        let nuevoSubProducto = {
          nombre: nombre,
          moneda: moneda,
          descripcion: descripcion,
          categoria: categoria,
          unidad: unidad,
          nombreProveedor: nombreProveedor,
          precio: Number(precio),
          precioPesos: precioPesos,
          codigoBarras: codigoBarras
        }

        rutaSubProducto.set(nuevoSubProducto);
        $.toaster({priority: 'success', title: 'Mensaje', message: `El sub producto se ha guardado`});

        cerrarModalAgregar();
      }
      else {
        $.toaster({priority: 'warning', title: 'Mensaje', message: `Ya hay un subproducto con esa clave`});

        $('#clave').val('');
        $('#nombre').val('');
        $('#moneda').val('');
        $('#descripcion').val('');
        $('#categoria').val('');
        $('#unidad').val('');
        $('#nombreProveedor').val('');
        $('#precio').val('');
        $('#precioPesos').val('');
        $('#codigoBarras').val('');
      }
    });


  }
  else {
    if(clave.length > 0) {
      $('#clave').parent().removeClass('has-error');
      $('#helpBlockClave').addClass('hidden');
    }
    else {
      $('#clave').parent().addClass('has-error');
      $('#helpBlockClave').removeClass('hidden');
    }
    if(nombre.length > 0) {
      $('#nombre').parent().removeClass('has-error');
      $('#helpBlockNombre').addClass('hidden');
    }
    else {
      $('#nombre').parent().addClass('has-error');
      $('#helpBlockNombre').removeClass('hidden');
    }
    if(moneda != undefined) {
      $('#moneda').parent().removeClass('has-error');
      $('#helpBlockMoneda').addClass('hidden');
    }
    else {
      $('#moneda').parent().addClass('has-error');
      $('#helpBlockMoneda').removeClass('hidden');
    }
    if(unidad != undefined) {
      $('#unidad').parent().removeClass('has-error');
      $('#helpBlockUnidad').addClass('hidden');
    }
    else {
      $('#unidad').parent().addClass('has-error');
      $('#helpBlockUnidad').removeClass('hidden');
    }
    if(categoria != undefined) {
      $('#categoria').parent().removeClass('has-error');
      $('#helpBlockCategoria').addClass('hidden');
    }
    else {
      $('#categoria').parent().addClass('has-error');
      $('#helpBlockCategoria').removeClass('hidden');
    }
    if(precio.length > 0) {
      $('#precio').parent().removeClass('has-error');
      $('#helpBlockPrecio').addClass('hidden');
    }
    else {
      $('#precio').parent().addClass('has-error');
      $('#helpBlockPrecio').removeClass('hidden');
    }
  }
}

function actualizarSubProducto() {
  let clave = $('#clave-ver').val(),
      nombre = $('#nombre-ver').val(),
      codigoBarras = $('#codigoBarras-ver').val(),
      nombreProveedor = $('#nombreProveedor-ver').val();
      categoria = $('#categoria-ver').val(),
      unidad = $('#unidad-ver').val(),
      descripcion = $('#descripcion-ver').val();

  if(nombre.length > 0 && categoria != undefined && categoria != null && unidad != undefined && unidad != null) {
    let rutaSubProducto = db.ref(`subProductos/${clave}`);

    if(nombreProveedor.length < 1) {
      nombreProveedor = "";
    }
    if(descripcion.length < 1) {
      descripcion = "";
    }
    if(codigoBarras.length < 1) {
      codigoBarras = "";
    }

    rutaSubProducto.update({
      nombre: nombre,
      nombreProveedor: nombreProveedor,
      codigoBarras: codigoBarras,
      categoria: categoria,
      unidad: unidad,
      descripcion: descripcion
    });

    $('#modal-ver').modal('hide');
    $.toaster({priority: 'info', title: 'Info:', message: `Se guardaron los cambios de este subproducto`});
  }
  else {
    if(nombre.length > 0) {
      $('#nombre-ver').parent().removeClass('has-error');
      $('#helpBlockNombreVer').addClass('hidden');
    }
    else {
      $('#nombre-ver').parent().addClass('has-error');
      $('#helpBlockNombreVer').removeClass('hidden');
    }
    if(unidad != undefined) {
      $('#unidad').parent().removeClass('has-error');
      $('#helpBlockUnidadVer').addClass('hidden');
    }
    else {
      $('#unidad-ver').parent().addClass('has-error');
      $('#helpBlockUnidadVer').removeClass('hidden');
    }
    if(categoria != undefined) {
      $('#categoria-ver').parent().removeClass('has-error');
      $('#helpBlockCategoriaVer').addClass('hidden');
    }
    else {
      $('#categoria-ver').parent().addClass('has-error');
      $('#helpBlockCategoriaVer').removeClass('hidden');
    }
  }
}

$('#nombre-ver').keyup(function () {
  let nombre = $(this).val();

  if(nombre.length > 0) {
    $('#nombre-ver').parent().removeClass('has-error');
    $('#helpBlockNombreVer').addClass('hidden');
  }
  else {
    $('#nombre-ver').parent().addClass('has-error');
    $('#helpBlockNombreVer').removeClass('hidden');
  }
});

$('#unidad-ver').change(function () {
  let unidad = $(this).val();

  if(unidad != undefined) {
    $('#unidad-ver').parent().removeClass('has-error');
    $('#helpBlockUnidadVer').addClass('hidden');
  }
  else {
    $('#unidad-ver').parent().addClass('has-error');
    $('#helpBlockUnidadVer').removeClass('hidden');
  }
});

$('#categoria-ver').change(function () {
  let categoria = $(this).val();

  if(categoria != undefined) {
    $('#categoria-ver').parent().removeClass('has-error');
    $('#helpBlockCategoriaVer').addClass('hidden');
  }
  else {
    $('#categoria-ver').parent().addClass('has-error');
    $('#helpBlockCategoriaVer').removeClass('hidden');
  }
});


$('#clave').keyup(function () {
  let clave = $(this).val();

  if(clave.length > 0) {
    $('#clave').parent().removeClass('has-error');
    $('#helpBlockClave').addClass('hidden');
  }
  else {
    $('#clave').parent().addClass('has-error');
    $('#helpBlockClave').removeClass('hidden');
  }
});

$('#nombre').keyup(function () {
  let nombre = $(this).val();

  if(nombre.length > 0) {
    $('#nombre').parent().removeClass('has-error');
    $('#helpBlockNombre').addClass('hidden');
  }
  else {
    $('#nombre').parent().addClass('has-error');
    $('#helpBlockNombre').removeClass('hidden');
  }
});

$('#moneda').change(function () {
  let moneda = $(this).val();

  if(moneda != undefined) {
    $('#moneda').parent().removeClass('has-error');
    $('#helpBlockMoneda').addClass('hidden');
  }
  else {
    $('#moneda').parent().addClass('has-error');
    $('#helpBlockMoneda').removeClass('hidden');
  }
});

$('#unidad').change(function () {
  let unidad = $(this).val();

  if(unidad != undefined) {
    $('#unidad').parent().removeClass('has-error');
    $('#helpBlockUnidad').addClass('hidden');
  }
  else {
    $('#unidad').parent().addClass('has-error');
    $('#helpBlockUnidad').removeClass('hidden');
  }
});

$('#categoria').change(function () {
  let categoria = $(this).val();

  if(categoria != undefined) {
    $('#categoria').parent().removeClass('has-error');
    $('#helpBlockCategoria').addClass('hidden');
  }
  else {
    $('#categoria').parent().addClass('has-error');
    $('#helpBlockCategoria').removeClass('hidden');
  }
});

function abrirModalVer(claveSubProducto) {
  let rutaSubProducto = db.ref(`subProductos/${claveSubProducto}`);
  rutaSubProducto.once('value', function(snapshot) {
    let subProducto = snapshot.val();

    $('#clave-ver').val(claveSubProducto);
    $('#nombre-ver').val(subProducto.nombre);
    // $('#moneda-ver').val(subProducto.moneda);
    $('#descripcion-ver').val(subProducto.descripcion);
    $('#categoria-ver').val(subProducto.categoria);
    $('#unidad-ver').val(subProducto.unidad);
    $('#nombreProveedor-ver').val(subProducto.nombreProveedor);
    // $('#precio-ver').val(subProducto.precio);
    // $('#precioPesos-ver').val(subProducto.precioPesos);
    $('#codigoBarras-ver').val(subProducto.codigoBarras);

    $('#modal-ver').modal('show');
  });
}

function llenarSelectCategoria() {
  let rutaCategorias = db.ref('categorias');
  rutaCategorias.on('value', function(snap) {
    let categorias = snap.val();
    let options = "";

    for(let i in categorias) {
      options += `<option value="${categorias[i]}">${categorias[i]}</option>`;
    }

    $('#categoria').html(options);
    $('#categoria-ver').html(options);
  })
}

function cambiarMoneda(claveSubProducto, idSelect) {
  let moneda = $(`#${idSelect}`).val();
  let subProducto = db.ref(`subProductos/${claveSubProducto}`);
  subProducto.update({
    moneda: moneda
  });
  $.toaster({priority: 'info', title: 'Info:', message: `La moneda del subProducto ${claveSubProducto} se actualizó`});
}

function habilitarEdicion(idInput) {
  $(`#${idInput}`).attr('readonly', false);
  $(`#${idInput}`).select();
}

$('#precio').keyup(function () {
  let moneda = $('#moneda').val();
  let precio = $(this).val();
  let rutaTipoCambio = db.ref('tipoCambio');

  if(precio.length > 0) {
    $('#precio').parent().removeClass('has-error');
    $('#helpBlockPrecio').addClass('hidden');

    if(moneda == "PESO") {
      $('#precioPesos').val(precio);
      $('#helpBlockPrecioMoneda').addClass('hidden');
    }
    else if (moneda == "DOLAR") {
      rutaTipoCambio.once('value').then(function(snapshot) {
        let tiposCambio = snapshot.val();
        let claveUltimo = Object.keys(tiposCambio)[Object.keys(tiposCambio).length -1];
        let ultimo = tiposCambio[claveUltimo];
        let dolar = ultimo.dolar;
        let precioPesos = Number((precio * dolar).toFixed(4));

        $('#precioPesos').val(precioPesos);
        $('#helpBlockPrecioMoneda').addClass('hidden');
      });
    }
    else if (moneda == "EURO") {
      rutaTipoCambio.once('value').then(function(snapshot) {
        let tiposCambio = snapshot.val();
        let claveUltimo = Object.keys(tiposCambio)[Object.keys(tiposCambio).length -1];
        let ultimo = tiposCambio[claveUltimo];
        let euro = ultimo.euro;
        let precioPesos = Number((precio * euro).toFixed(4));

        $('#precioPesos').val(precioPesos);
        $('#helpBlockPrecioMoneda').addClass('hidden');
      });
    }
    else {
      $('#precio').parent().parent().addClass('has-error');
      $('#helpBlockPrecioMoneda').removeClass('hidden');
    }
  }
  else {
    $('#precio').parent().addClass('has-error');
    $('#helpBlockPrecio').removeClass('hidden');
    $('#helpBlockPrecioMoneda').addClass('hidden');
  }
});

$('#tabla-subProductos').on( 'page.dt', function () {
    var table = $(this).DataTable();
    pagina = table.page();
});

function guardarPrecio(claveSubProducto, idInput) {
  let precio = Number($(`#${idInput}`).val());

  let rutaSubProducto = db.ref(`subProductos/${claveSubProducto}`);
  rutaSubProducto.once('value', function(snap) {
    let moneda = snap.val().moneda;
    let rutaTipoCambio = db.ref('tipoCambio');

    // var table = $('#tabla-subProductos').DataTable();
    // pagina = table.page();
    // console.log(pagina)

    if(moneda == "PESO") {
      rutaSubProducto.update({
        precio: precio,
        precioPesos: precio
      });
      $.toaster({priority: 'info', title: 'Info:', message: `Se actualizó el precio del subProducto ${claveSubProducto}`});
    }
    else if(moneda == "DOLAR") {
      rutaTipoCambio.once('value').then(function(snapshot) {
        let tiposCambio = snapshot.val();
        let claveUltimo = Object.keys(tiposCambio)[Object.keys(tiposCambio).length -1];
        let ultimo = tiposCambio[claveUltimo];
        let dolar = ultimo.dolar
        let precioPesos = Number((precio * ultimo.dolar).toFixed(4));

        // var table = $('#tabla-subProductos').DataTable();
        // pagina = table.page();

        rutaSubProducto.update({
          precio: precio,
          precioPesos: precioPesos
        });
        $.toaster({priority: 'info', title: 'Info:', message: `Se actualizó el precio del subProducto ${claveSubProducto}`});
      });
    }
    else if(moneda == "EURO") {
      rutaTipoCambio.once('value', function(snapshot) {
        let tiposCambio = snapshot.val();
        let claveUltimo = Object.keys(tiposCambio)[Object.keys(tiposCambio).length -1];
        let ultimo = tiposCambio[claveUltimo];

        let euro = ultimo.euro;
        let precioPesos = Number((precio * euro).toFixed(4));

        rutaSubProducto.update({
          precio: precio,
          precioPesos: precioPesos
        });
        $.toaster({priority: 'info', title: 'Info:', message: `Se actualizó el precio del subProducto ${claveSubProducto}`});

        // var table = $('#tabla-subProductos').DataTable();
        // pagina = table.page;
      });
    }
  });


  $(`#${idInput}`).attr('readonly', true);
}

function actualizarPrecioPesos() {
  let rutaTiposCambio = db.ref('tipoCambio');
  rutaTiposCambio.on('value', function(snap) {
    let tiposCambio = snap.val();
    let claveUltimo = Object.keys(tiposCambio)[Object.keys(tiposCambio).length -1];
    let ultimo = tiposCambio[claveUltimo];
    let dolar = ultimo.dolar;
    let euro = ultimo.euro;

    let rutaSubProductos = db.ref('subProductos');
    rutaSubProductos.once('value', function(snapshot) {
      let subProductos = snapshot.val();

      for(let subProducto in subProductos) {
        let precio = subProductos[subProducto].precio;
        let moneda = subProductos[subProducto].moneda;
        let rutaSubProducto = db.ref(`subProductos/${subProducto}`);

        if(moneda == "DOLAR") {
          let precioPesos = precio * dolar;

          rutaSubProducto.update({
            precioPesos: precioPesos
          });
        }
        else if(moneda == "EURO") {
          let precioPesos = precio * euro;
          rutaSubProducto.update({
            precioPesos: precioPesos
          });
        }
      }
    });
  });
}

actualizarPrecioPesos();

$('#modal-subproductos').on('shown.bs.modal', function() {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

function prepararPDF() {

  let tabla = $(`#tablaImprimir`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "500px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "ordering": false,
    "searching": false,
    "paginating": false,
    dom: 'Bfrtip',
    buttons: ['excel', 'pdf']
    // [
    //   {
    //     extend: 'print',
    //     text: 'Imprimir <i class="glyphicon glyphicon-print"></i>',
    //     className: "btn btn-default",
    //     autoPrint: true
    //   }
    // ]
  });

  let rutaSubProductos = db.ref('subProductos');
  rutaSubProductos.once('value', function(snap) {
    let subProductos = snap.val();
    let filas = "";
    tabla.clear();

    for(let subProducto in subProductos) {
      filas += `<tr>
                  <td>${subProducto}</td>
                  <td>${subProductos[subProducto].nombre}</td>
                  <td>${subProductos[subProducto].precio}</td>
                  <td>${subProductos[subProducto].precioPesos}</td>
                </tr>`;
    }

    tabla.rows.add($(filas)).columns.adjust().draw();
  });

  $('#modal-subproductos').modal('show');
}

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  mostrarSubProductos();
  llenarSelectCategoria();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
