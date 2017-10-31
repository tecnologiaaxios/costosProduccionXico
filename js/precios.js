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
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "ordering": false
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
                      <span class="input-group-addon">$</span>
                      <input id="precio-${subProducto}" readonly type="number" class="form-control" value="${subProductos[subProducto].precio}">
                      <span class="input-group-btn">
                        <button onclick="habilitarEdicion('precio-${subProducto}')" class="btn btn-warning" type="button"><i class="fa fa-pencil" aria-hidden="true"></i></button>
                      </span>
                      <span class="input-group-btn">
                        <button onclick="guardarPrecio('${subProducto}', 'precio-${subProducto}')" class="btn btn-success" type="button"><i class="fa fa-floppy-o" aria-hidden="true"></i></button>
                      </span>
                    </div>     
                  </td>
                </tr>`;
    }
  
    tabla.rows.add($(filas)).columns.adjust().draw();
  });
}

function habilitarEdicion(idInput) {
  $(`#${idInput}`).attr('readonly', false);
}

function guardarPrecio(claveSubProducto, idInput) {
  let precio = $(`#${idInput}`).val();

  let rutaSubProducto = db.ref(`subProductos/${claveSubProducto}`);
  rutaSubProducto.update({
    precio: precio
  });

  $(`#${idInput}`).attr('readonly', true);
}

$(document).ready(function() {
  $('[data-toggle="tooltip"]').tooltip();

  mostrarSubProductos();

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});