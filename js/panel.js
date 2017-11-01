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
    let cantidadProductos = Object.keys(productos).length;
    let numFilas = cantidadProductos / 6;

    for(let producto in productos) {
      let thumnail = ``;
    }
  });
}

function abrirModalProducto(idProducto) {
  let tabla = $(`#tabla-subProductos`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "500px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "ordering": false
  });
  $('#modalProducto').modal('show');

  let rutaSubProductos = db.ref(`subProductos/${idProducto}`);
  rutaSubProductos.once('value', function(snap) {
    let subProductos = snap.val();
    let filas = "";
    tabla.clear();

    for(let subProducto in subProductos) {
      filas += `<tr>
                  <td>${subProducto}</td>
                  <td>${subProductos[subProducto].nombre}</td>
                  <td>${subProductos[subProducto].valorConstante}</td>
                  <td>${subProductos[subProducto].precio}</td>
                  <td>${(subProductos[subProducto].valorConstante * subProductos[subProducto].precio).toFixed(4)}</td<
               </tr>`;
    }
    tabla.rows.add($(filas)).columns.adjust().draw();
  })
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

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  mostrarProductos();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
