const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function mostrarProductos() {
  let fecha = moment().format('DD/MM/YYYY');

  let rutaBatidas = db.ref('batidas');
  rutaBatidas.orderByChild('fechaCaptura').equalTo(fecha).on('value', function(datos) {
    let productos = datos.val();
    let thumbnailsXs = "", thumbnailsSm = "", thumbnailsMd = "", thumbnailsLg = "";

    for(let producto in productos) {
      let finalizada = (productos[producto].estado === "Finalizada") ? true : false;

      if(finalizada) {
        thumbnailsXs += `<div class="col-xs-12">
                          <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                            <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombreProducto}">
                              <h3 class="text-center">${productos[producto].claveProducto}</h3>
                              <img src="img/1JAMON DE PAVO.jpg" style="height: 200px;">
                              <div class="panel-footer">
                                <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                                <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                              </div>
                            </div>
                          </a>
                        </div>`; 

        thumbnailsSm += `<div class="col-sm-6">
                          <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                            <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombreProducto}">
                              <h3 class="text-center">${productos[producto].claveProducto}</h3>
                              <img src="img/1JAMON DE PAVO.jpg" style="height: 200px;">
                              <div class="panel-footer">
                                <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                                <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                              </div>
                            </div>
                          </a>
                        </div>`;
        
        thumbnailsMd += `<div class="col-md-3">
                          <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                            <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombreProducto}">
                              <h3 class="text-center">${productos[producto].claveProducto}</h3>
                              <img src="img/1JAMON DE PAVO.jpg" style="height: 200px;">
                              <div class="panel-footer">
                                <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                                <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                              </div>
                            </div>
                          </a>
                        </div>`;

        thumbnailsLg += `<div class="col-lg-2">
                          <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                            <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombreProducto}">
                              <h3 class="text-center">${productos[producto].claveProducto}</h3>
                              <img src="img/1JAMON DE PAVO.jpg" style="height: 200px;">
                              <div class="panel-footer">
                                <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                                <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                              </div>
                            </div>
                          </a>
                        </div>`;
      }
    }

    $('#fila-xs').html(thumbnailsXs);
    $('#fila-sm').html(thumbnailsSm);
    $('#fila-md').html(thumbnailsMd);
    $('#fila-lg').html(thumbnailsLg);
    $('[data-toggle="tooltip"]').tooltip();
  });
}

function filtrarPorFecha() {
  let fechaString = $('#fecha').val();
  var date = fechaString.split("-");
  let dia = date[2];
  let mes = date[1];
  let año = date[0];

  let dateObj = new Date(`${mes}/${dia}/${año}`);
  let fecha = moment(dateObj).format('DD/MM/YYYY');

  let rutaBatidas = db.ref('batidas');
  rutaBatidas.orderByChild('fechaCaptura').equalTo(fecha).once('value', function(snap) {
    let productos = snap.val();
    let thumbnailsXs = "", thumbnailsSm = "", thumbnailsMd = "", thumbnailsLg = "";

    for(let producto in productos) {
      let finalizada = (productos[producto].estado === "Finalizada") ? true : false;

      if(finalizada) {
        thumbnailsXs += `<div class="col-xs-12">
                          <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                            <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombreProducto}">
                              <h3 class="text-center">${productos[producto].claveProducto}</h3>
                              <img src="img/1JAMON DE PAVO.jpg" style="height: 200px;">
                              <div class="panel-footer">
                                <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                                <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                              </div>
                            </div>
                          </a>
                        </div>`; 

        thumbnailsSm += `<div class="col-sm-6">
                          <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                            <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombreProducto}">
                              <h3 class="text-center">${productos[producto].claveProducto}</h3>
                              <img src="img/1JAMON DE PAVO.jpg" style="height: 200px;">
                              <div class="panel-footer">
                                <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                                <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                              </div>
                            </div>
                          </a>
                        </div>`;
        
        thumbnailsMd += `<div class="col-md-3">
                          <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                            <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombreProducto}">
                              <h3 class="text-center">${productos[producto].claveProducto}</h3>
                              <img src="img/1JAMON DE PAVO.jpg" style="height: 200px;">
                              <div class="panel-footer">
                                <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                                <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                              </div>
                            </div>
                          </a>
                        </div>`;

        thumbnailsLg += `<div class="col-lg-2">
                          <a class="thumbnail-a" onclick="abrirModalProducto('${producto}')">
                            <div class="thumbnail card" data-toggle="tooltip" data-placement="bottom" title="${productos[producto].nombreProducto}">
                              <h3 class="text-center">${productos[producto].claveProducto}</h3>
                              <img src="img/1JAMON DE PAVO.jpg" style="height: 200px;">
                              <div class="panel-footer">
                                <h4 class="text-center">Peso: ${productos[producto].kilos} Kg</h4>
                                <h4 class="text-center">Costo: $ ${productos[producto].costo}</h4>
                              </div>
                            </div>
                          </a>
                        </div>`;
      }
    }

    $('#fila-xs').html(thumbnailsXs);
    $('#fila-sm').html(thumbnailsSm);
    $('#fila-md').html(thumbnailsMd);
    $('#fila-lg').html(thumbnailsLg);
    $('[data-toggle="tooltip"]').tooltip();
  });

}


function abrirModalProducto(idBatida) {
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

  let rutaSubProductos = db.ref(`batidas/${idBatida}`);
  rutaSubProductos.once('value', function(snap) {
    let claveProducto = snap.val().claveProducto;
    let nombreProducto = snap.val().nombreProducto;
    let kilos = snap.val().kilos;
    let piezas = snap.val().piezas;
    let costo = snap.val().costo;
    let subProductos = snap.val().subProductos;

    $('#claveProductoLg').val(claveProducto);
    $('#nombreProductoLg').val(nombreProducto);
    $('#costoLg').val(costo);
    $('#kilosLg').val(kilos);
    $('#piezasLg').val(piezas);

    $('#claveProductoMd').val(claveProducto);
    $('#nombreProductoMd').val(nombreProducto);
    $('#costoMd').val(costo);
    $('#kilosMd').val(kilos);
    $('#piezasMd').val(piezas);

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

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  $('#fecha').val(moment().format('YYYY-MM-DD'));

  mostrarProductos();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
