const db = firebase.database();
const auth = firebase.auth();

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
      { "width": "35%" },
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
                </tr>`;
    }

    tabla.rows.add($(filas)).columns.adjust().draw();
  });
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
}

function agregarSubProducto() {
  let clave = $('#clave').val();
  let nombre = $('#nombre').val();
  let moneda = $('#moneda').val();
  let descripcion = $('#descripcion').val();
  let categoria = $('#categoria').val();
  let unidad = $('#unidad').val();
  let nombreProveedor = $('#nombreProveedor').val();
  let precio = Number($('#precio').val());
  let precioPesos = Number($('#precioPesos').val());
  let codigoBarras = $('#codigoBarras').val();

  let rutaSubProductos = db.ref(`subProductos/${clave}`);
  let nuevoSubProducto = {
    nombre: nombre,
    moneda: moneda,
    descripcion: descripcion,
    categoria: categoria,
    unidad: unidad,
    nombreProveedor: nombreProveedor,
    precio: precio,
    precioPesos: precioPesos,
    codigoBarras: codigoBarras
  }

  rutaSubProductos.set(nuevoSubProducto);
  $.toaster({priority: 'success', title: 'Mensaje:', message: `El sub producto se ha guardado`});

  cerrarModalAgregar();
}

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

function actualizarSubProducto() {
  let clave = $('#clave-ver').val();
  let nombre = $('#nombre-ver').val();
  let codigoBarras = $('#codigoBarras').val();
  let nombreProveedor = $('#nombreProveedor').val();
  let categoria = $('#categoria').val();
  let unidad = $('#unidad').val();
  let descripcion = $('#descripcion').val();

  let rutaSubProducto = db.ref(`subProductos/${clave}`);
  rutaSubProducto.update({
    nombre: nombre,
    codigoBarras: codigoBarras,
    nombreProveedor: nombreProveedor,
    categoria: categoria,
    unidad: unidad,
    descripcion: descripcion
  });

  $('#modal-ver').modal('hide');
  $.toaster({priority: 'success', title: 'Mensaje:', message: `El sub producto se ha actualizado`});
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
}

function guardarPrecio(claveSubProducto, idInput) {
  let precio = Number($(`#${idInput}`).val());

  let rutaSubProducto = db.ref(`subProductos/${claveSubProducto}`);
  rutaSubProducto.once('value', function(snap) {
    let moneda = snap.val().moneda;
    let rutaTipoCambio = db.ref('tipoCambio');

    if(moneda == "PESO") {
      console.log("PESO");
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
        let precioDolar = Number((precio * ultimo.dolar).toFixed(4));

        rutaSubProducto.update({
          precio: precio,
          precioPesos: precioDolar
        });
        $.toaster({priority: 'info', title: 'Info:', message: `Se actualizó el precio del subProducto ${claveSubProducto}`});
      });
    }
    else if(moneda == "EURO") {
      console.log("EURO");
      rutaTipoCambio.once('value', function(snapshot) {
        let tiposCambio = snap.val();
        let claveUltimo = Object.keys(tiposCambio)[Object.keys(tiposCambio).length -1];
        let ultimo = tiposCambio[claveUltimo];
        let euro = ultimo.euro;
        let precioEuro = Number((precio * euro).toFixed(4));

        rutaSubProducto.update({
          precio: precio,
          precioPesos: precioEuro
        });
        $.toaster({priority: 'info', title: 'Info:', message: `Se actualizó el precio del subProducto ${claveSubProducto}`});
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
