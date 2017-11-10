const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function mostrarProductos() {
  let costos = db.ref('costosProduccion');
  costos.on('value', function(datos) {
    let productos = datos.val();
    let thumbnailsXs = "", thumbnailsSm = "", thumbnailsMd = "", thumbnailsLg = "";

    for(let producto in productos) {
      thumbnailsXs += `<div class="col-xs-12">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${producto}</h3>
                            </div>
                            <img src="img/${producto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsSm += `<div class="col-sm-6">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${producto}</h3>
                            </div>
                            <img src="img/${producto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsMd += `<div class="col-md-3">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${producto}</h3>
                            </div>
                            <img src="img/${producto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsLg += `<div class="col-lg-2">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${producto}</h3>
                            </div>
                            <img src="img/${producto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;   
    }

    $('#fila-xs').html(thumbnailsXs);
    $('#fila-sm').html(thumbnailsSm);
    $('#fila-md').html(thumbnailsMd);
    $('#fila-lg').html(thumbnailsLg);
    $('[data-toggle="tooltip"]').tooltip();
  });
}

function abrirModalProducto(claveProducto) {
  let tabla = $(`#tabla-subProductos`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "300px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "ordering": false
  });
  $('#modalProducto').modal('show');

  let costosProduccion = db.ref(`costosProduccion/${claveProducto}`);
  costosProduccion.once('value', function(snap) {
    let nombreProducto = snap.val().nombre;
    let kilos = snap.val().kilos;
    let piezas = snap.val().piezas;
    let costo = snap.val().costo;
    let subProductos = snap.val().subProductos;

    $('#img-producto').attr('src', `img/${claveProducto}.jpg`);
    $('#claveProducto').val(claveProducto);
    $('#nombreProducto').val(nombreProducto);
    $('#costo').val(costo);
    $('#kilos').val(kilos);
    $('#piezas').val(piezas);

    //let filas = "";
    tabla.clear();

    for(let subProducto in subProductos) {
      let rutaSubProducto = db.ref(`subProductos/${subProducto}`);
      rutaSubProducto.once('value', function(datos) {
        if(datos.hasChildren()) {
          let precio = datos.val().precio;

          let fila = `<tr>
                      <td>${subProducto}</td>
                      <td>${subProductos[subProducto].nombre}</td>
                      <td>${subProductos[subProducto].valorConstante}</td>
                      <td>${precio}</td>
                      <td>${(subProductos[subProducto].valorConstante * precio).toFixed(4)}</td>
                    </tr>`;

          tabla.rows.add($(fila))
          tabla.columns.adjust().draw();
        }
      });

    }

  })
}

$('#modalProducto').on('shown.bs.modal', function() {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
});

$('#collapseSubProductos').on('shown.bs.collapse', function () {
  $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
})

$('#collapseSubProductos').on('show.bs.collapse', function () {
  $('#verSubProductos').text('Ocultar sub productos');
})

$('#collapseSubProductos').on('hide.bs.collapse', function () {
  $('#verSubProductos').text('Ver sub productos');
})

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

function llenarSelectCategorias() {
  let rutaCategorias = db.ref('categoriasPT');
  rutaCategorias.on('value', function(snap) {
    let categorias = snap.val();
    let options = '<option selected disabled value="">Categoría</option>';

    for(let i in categorias) {
      options += `<option value="${categorias[i].nombre}">${categorias[i].nombre}</option>`;
    }

    $('#categoria').html(options);
  });
}

$('#categoria').change(function() {
  let categoria = $(this).val();

  let costos = db.ref('costosProduccion');
  costos.orderByChild('categoria').equalTo(categoria).on('value', function(datos) {
    let productos = datos.val();
    let thumbnailsXs = "", thumbnailsSm = "", thumbnailsMd = "", thumbnailsLg = "";

    for(let producto in productos) {
      thumbnailsXs += `<div class="col-xs-12">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${producto}</h3>
                            </div>
                            <img src="img/${producto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsSm += `<div class="col-sm-6">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${producto}</h3>
                            </div>
                            <img src="img/${producto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsMd += `<div class="col-md-3">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${producto}</h3>
                            </div>
                            <img src="img/${producto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsLg += `<div class="col-lg-2">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${producto}</h3>
                            </div>
                            <img src="img/${producto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;   
    }

    $('#fila-xs').html(thumbnailsXs);
    $('#fila-sm').html(thumbnailsSm);
    $('#fila-md').html(thumbnailsMd);
    $('#fila-lg').html(thumbnailsLg);
    $('[data-toggle="tooltip"]').tooltip();
  });
});

$('#producto').change(function() {
  let claveProducto = $(this).val();

  let costos = db.ref(`costosProduccion/${claveProducto}`);
  costos.on('value', function(datos) {
    let producto = datos.val();
    let thumbnailsXs = "", thumbnailsSm = "", thumbnailsMd = "", thumbnailsLg = "";

    
      thumbnailsXs += `<div class="col-xs-12">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${claveProducto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${producto.nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${claveProducto}</h3>
                            </div>
                            <img src="img/${claveProducto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${producto.kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${producto.costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsSm += `<div class="col-sm-6">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${claveProducto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${producto.nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${claveProducto}</h3>
                            </div>
                            <img src="img/${claveProducto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${producto.kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${producto.costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsMd += `<div class="col-md-3">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${claveProducto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${producto.nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${claveProducto}</h3>
                            </div>
                            <img src="img/${claveProducto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${producto.kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${producto.costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;

      thumbnailsLg += `<div class="col-lg-2">
                        <a class="thumbnail-a" onclick="abrirModalProducto('${claveProducto}')">
                          <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${producto.nombre}">
                            <div class="panel-heading">
                              <h3 class="text-center">${claveProducto}</h3>
                            </div>
                            <img src="img/${claveProducto}.jpg" style="height: 200px;">
                            <div class="panel-footer">
                              <h4 class="text-center">Peso: ${producto.kilos} Kg</h4>
                              <h4 class="text-center">Costo: $ ${producto.costo}</h4>
                            </div>
                          </div>
                        </a>
                      </div>`;   
    

    $('#fila-xs').html(thumbnailsXs);
    $('#fila-sm').html(thumbnailsSm);
    $('#fila-md').html(thumbnailsMd);
    $('#fila-lg').html(thumbnailsLg);
    $('[data-toggle="tooltip"]').tooltip();
  });
});


function llenarSelectProductos() {
  let rutaCostosProduccion = db.ref('costosProduccion');
  rutaCostosProduccion.on('value', function(snap) {
    let productos = snap.val();
    let options = '<option selected disabled value="">Producto</option>';

    for(let producto in productos) {
      options += `<option value="${producto}">${producto} - ${productos[producto].nombre}</option>`;
    }
    $('#producto').html(options);
  });
}

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  $('#fecha').val(moment().format('YYYY-MM-DD'));

  mostrarProductos();
  llenarSelectCategorias();
  llenarSelectProductos();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});