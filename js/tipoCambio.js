const db = firebase.database();
const auth = firebase.auth();

function logout() {
   auth.signOut();
}

function registrarTipoCambio() {
  let fechaString = $('#fecha').val();
  let date = fechaString.split("-");
  let dia = date[2];
  let mes = date[1];
  let año = date[0];

  let dateObj = new Date(`${mes}/${dia}/${año}`);
  let fecha = moment(dateObj).format('DD/MM/YYYY');
  let dolar = Number($('#dolar').val());
  let euro = Number($('#euro').val());

  let refGuardarTipoCambio = db.ref(`tipoCambio`)
  refGuardarTipoCambio.push({
      dolar: dolar,
      euro: euro,
      fecha: fecha
  });

  $('#dolar').val("");
  $('#euro').val("");
}

$('#euro').keyup(function(){
  let euro = $(this).val();
  if(euro.length<1){
    $('#euro').parent().parent().addClass('has-error');
    $('#helpBlockEuro').removeClass('hidden');
  }else{
    $('#euro').parent().parent().removeClass('has-error');
    $('#helpBlockEuro').addClass('hidden');
  }
});

$('#dolar').keyup(function(){
  let dolar = $(this).val();

  if(dolar.length<1){
    $('#dolar').parent().parent().addClass('has-error');
    $('#helpBlockDolar').removeClass('hidden');
  }else{
    $('#dolar').parent().parent().removeClass('has-error');
    $('#helpBlockDolar').addClass('hidden');
  }
});

$('#btnModalGuardar').click(function(){
  let dolar = $('#dolar').val();
  let euro = $('#euro').val();

  if(dolar.length>0 && euro.length>0){
    $('#modalConfirmarGuardar').modal('show');
  }else{
    if(dolar.length<1){
      $('#dolar').parent().parent().addClass('has-error');
      $('#helpBlockDolar').removeClass('hidden');
    }else{
      $('#dolar').parent().parent().removeClass('has-error');
      $('#helpBlockDolar').addClass('hidden');
    }
    if(euro.length<1){
      $('#euro').parent().parent().addClass('has-error');
      $('#helpBlockEuro').removeClass('hidden');
    }else{
      $('#euro').parent().parent().removeClass('has-error');
      $('#helpBlockEuro').addClass('hidden');
    }

    $('#tabla-tipoCambio').columns.adjust();
  }
});

function mostrarTipoCambio() {
  let tabla = $(`#tabla-tipoCambio`).DataTable({
    destroy: true,
    "lengthChange": false,
    "scrollY": "500px",
    "scrollCollapse": true,
    "language": {
      "url": "//cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
    },
    "ordering": false
  });

  let tipoCambioRef = db.ref(`tipoCambio`);
  tipoCambioRef.on('value', function(snapshot) {
    let tiposCambios = snapshot.val();
    let filas = "";
    tabla.clear();

    let arrayTiposCambios = [];
    for(let tipoCambio in tiposCambios) {
      arrayTiposCambios.push(tiposCambios[tipoCambio]);
    }

    arrayTiposCambios.reverse();

    for(let tipoCambio in arrayTiposCambios) {
    filas += `<tr>
                <td>${arrayTiposCambios[tipoCambio].fecha}</td>
                <td class="text-right">$ ${arrayTiposCambios[tipoCambio].dolar}</td>
                <td class="text-right">&#8364; ${arrayTiposCambios[tipoCambio].euro}</td>
              </tr>`;
      //$('#table-tipoCambio tbody').html(filas);
    }
    tabla.rows.add($(filas)).columns.adjust().draw();

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
  mostrarTipoCambio();
  $('#dolar').focus();

  $('#fecha').val(moment().format('YYYY-MM-DD'));

  $.toaster({
    settings: {
      'timeout': 3000
    }
  });
});
