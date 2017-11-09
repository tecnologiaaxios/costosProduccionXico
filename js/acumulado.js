const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

$('#tipoAcumulado').change(function() {
  let tipo = $(this).val();
  if(tipo == "CostoTotal") {
    $('#fechaInicio').attr('readonly', true);
    $('#fechaFin').attr('readonly', true);
    $('#fechaInicio').val('');
    $('#fechaFin').val('');
    
    
    $('#costoTotal').text('');
    calcularCostoTotal();
  }
  if(tipo == "CostoRango") {
    $('#fechaInicio').attr('readonly', false);
    $('#fechaFin').attr('readonly', false);
    
    let tabla = $(`#tabla-acumulado`).DataTable({
      destroy: true,
      "lengthChange": false,
      "scrollY": "300px",
      "scrollCollapse": true,
      "language": {
        "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
      },
      "ordering": false
    });
    tabla.clear();
    $('#costoTotal').text('');
  }
});

function calcularCostoTotal() {
  let tabla = $(`#tabla-acumulado`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "300px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "ordering": false
  });

  let rutaBatidas = db.ref('batidas');
  rutaBatidas.orderByChild('estado').equalTo('Finalizada').once('value', function(snapshot) {
    let batidas = snapshot.val();

    let filas = "";
    let costoTotal = 0;
    tabla.clear();

    for(let batida in batidas) {
      filas += `<tr>
                  <td>${batidas[batida].claveBatida}</td>
                  <td>${batidas[batida].claveProducto}</td>
                  <td>${batidas[batida].fechaCaptura}</td>
                  <td>${batidas[batida].kilos}</td>
                  <td>$ ${batidas[batida].costo}</td>
                  <td>$ ${batidas[batida].kilos * batidas[batida].costo}</td>
               </tr>`;
      costoTotal += (batidas[batida].kilos * batidas[batida].costo);
    }
    tabla.rows.add($(filas)).columns.adjust().draw();

    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
    $('#costoTotal').text(`$ ${costoTotal}`);
  });
}

$('#btnBuscar').click(function () {
  let fechaInicio = $('#fechaInicio').val();
  let fechaFin = $('#fechaFin').val();
  costoRango(fechaInicio, fechaFin);
});

function costoRango(fechaInicio, fechaFin) {
  let desde = fechaInicio.split('-');
  let hasta = fechaFin.split('-');

  let fechaDesde = new Date(`${desde[1]}/${desde[2]}/${desde[0]}`);
  let fechaHasta = new Date(`${hasta[1]}/${hasta[2]}/${hasta[0]}`);

  let tabla = $(`#tabla-acumulado`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "300px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "ordering": false
  });

  let rutaBatidas = db.ref('batidas');
  rutaBatidas.orderByChild('estado').equalTo('Finalizada').once('value', function(snapshot) {
    let batidas = snapshot.val();

    let filas = "";
    let costoTotal = 0;
    tabla.clear();

    for(let batida in batidas) {
      let fechaBatida = batidas[batida].fechaCaptura;
      let date = fechaBatida.split('/');
      let dateBatida = new Date(`${date[1]}/${date[0]}/${date[2]}`);
      //let rango = moment.range(fechaDesde, fechaHasta);
      
      if(dateBatida >= fechaDesde && dateBatida <= fechaHasta) {
        filas += `<tr>
                    <td>${batidas[batida].claveBatida}</td>
                    <td>${batidas[batida].claveProducto}</td>
                    <td>${batidas[batida].fechaCaptura}</td>
                    <td>${batidas[batida].kilos}</td>
                    <td>$ ${batidas[batida].costo}</td>
                    <td>$ ${batidas[batida].kilos * batidas[batida].costo}</td>
                  </tr>`;
        costoTotal += (batidas[batida].kilos * batidas[batida].costo);
      }
    }
    tabla.rows.add($(filas)).columns.adjust().draw(); 
    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
    $('#costoTotal').text(`$ ${costoTotal}`);
  });
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

  $('#tabla-acumulado').DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "300px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/a5734b29083/i18n/Spanish.json"
    },
    "ordering": false
  });

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
