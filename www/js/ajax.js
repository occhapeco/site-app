var xhrTimeout=1000;
var url='http://clubedeofertas.net/rest/api.php';
var urn='urn:service';
var classe = 'usuario';
var ultimo_carregado = 0;
var glb = 0;

var myApp = new Framework7({
  pushState: true,
  animatePages: true,
  modalTitle: "Clube de Ofertas",
  modalButtonCancel: "Cancelar",
  modalButtonOk: "Confirmar",
  modalPreloaderTitle: "Carregando...",
  smartSelectBackText: 'Voltar',
  smartSelectPopupCloseText: 'Fechar',
  smartSelectPickerCloseText: 'Definir',
  preloadPreviousPage : false,
  uniqueHistory : true,
  modalCloseByOutside : true,
  popupCloseByOutside : true,
  actionsCloseByOutside : true
});
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

var taba=1;
var resg = 0;

function tabas(id){
  taba = id;
}

function token(token){
  if (localStorage.getItem("user_id") != null || localStorage.getItem("user_id") != 'null') {
    var data = {
      access_token:localStorage.getItem("access_token"),
      classe:classe,
      metodo:"update_token",
      id:localStorage.getItem("user_id"),
      token:token
    };
    $.post(url,data);
  }
}

function resgate(){
    if (resg == 0) {
      resg = 1;
       myApp.modal({
          title:  'Clube de Ofertas',
          text: 'Você tem cupons a serem avaliados, deseja avaliá-los agora?',
          buttons: [
            {
              text: 'Mais tarde',
              onClick: function() {}
            },
            {
              text: 'Confirmar',
              onClick: function() {
                document.getElementById("botaocupons").click(); 
              }
            }
          ]
        });
    }
}

if (localStorage.getItem("user_id") == null || localStorage.getItem("user_id") == 'null') 
      {carregar_login();
      }
    else{
      document.getElementById('cupons').innerHTML = '';
      carregar_cupons(0,1,0,0,"");
      carregar_meus_cupons();
      carregar_perfil();
    }

$$(document).on('pageInit', function (e) {
    var page = e.detail.page;

    if (localStorage.getItem("user_id") === null && (page.name != "cadastro" && page.name != "cupons-no-login" && page.name != "oferta" )) {
      mainView.router.back();
      carregar_login();
    }else{
        if(page.name === 'opiniao'){
          document.getElementById('prod1').checked = true;
          document.getElementById('atend1').checked = true;
        }

        if(page.name === 'index'){
         setTimeout(function (){carregar_cupons(0,1,0,0,"");},150);     
        }

        if(page.name === 'cupons-no-login'){
         setTimeout(function (){carregar_cuponsa(0,1,0,0,"");},150);     
        }

        if(page.name === 'oferta'){
          detalhes_cupom(page.query.id,page.query.titulo,page.query.desconto,page.query.preco_normal,page.query.preco_cupom,page.query.prazo,page.query.quantidade,page.query.nome_fantasia,page.query.caminho);
        }

        if(page.name === 'opiniao'){
          detalhes_opiniao(page.query.id,page.query.titulo,page.query.desconto,page.query.preco_normal,page.query.preco_cupom,page.query.prazo,page.query.nome_fantasia,page.query.caminho);
        }

    }

});

$$(document).on('pageBack', function (e) {
    var page = e.detail.page;

    if(page.name === 'cupons-no-login'){
         setTimeout(function (){location.reload();},150);     
      }
});

var ptrContent = $$('.pull-to-refresh-content');
 
// Add 'refresh' listener on it
ptrContent.on('refresh', function (e) {
    ultimo_carregado = 0;
    carregar_cupons(ultimo_carregado,1,0,0,"");
    carregar_meus_cupons();
    carregar_perfil();
    myApp.pullToRefreshDone();
});

function cadastro(){
  if(document.getElementById("cad_nome").value.length > 2 && document.getElementById("cad_email").value.length > 2 && document.getElementById("cad_telefone_ddd").value.length > 1 && document.getElementById("cad_senha").value.length > 2 && document.getElementById("cad_telefone").value.length > 2 && document.getElementById("cad_nasc_dia").value != '-' && document.getElementById("cad_nasc_mes").value != '-' && document.getElementById("cad_nasc_ano").value != '-' )
  { 
    myApp.showPreloader("Realizando cadastro...");
    var data = {
      classe:classe,
      metodo:"insert",
      nome:document.getElementById("cad_nome").value,
      email:document.getElementById("cad_email").value,
      senha:document.getElementById("cad_senha").value,
      celular:document.getElementById("cad_telefone_ddd").value+document.getElementById("cad_telefone").value,
      genero:document.getElementById("cad_genero").value,
      nascimento:document.getElementById("cad_nasc_ano").value+'-'+document.getElementById("cad_nasc_mes").value+'-'+document.getElementById("cad_nasc_dia").value
    };

    $.post(url,data,
      function(result) {
        myApp.hidePreloader();
        console.log(result);
        if(result == -1)
          myApp.alert("Esse email já está em uso!");
        else
        {
          var usuario = JSON.parse(result);
          if(usuario.id != 0)
          {
            localStorage.setItem("user_id",usuario.id);
            localStorage.setItem("access_token",usuario.access_token);
            token(token);
            mainView.router.back();
            setTimeout(function () {location.reload();},50);
          }
          else
            myApp.alert("Seu perfil não pôde ser criado, reveja suas informações ou sua conexão por favor.");
        }
    });
  }
  else
    myApp.alert("Senhas não correspondem ou campo deixado em branco!");
}

function avaliar(id){
  myApp.showPreloader("Enviando avaliação...");

  var data = {
    access_token:localStorage.getItem("access_token"),
    classe:classe,
    metodo:"avaliar",
    id:id,
    produto:pegar_valor(document.getElementsByName('produto')),
    atendimento:pegar_valor(document.getElementsByName('atendimento')),
    ambiente:pegar_valor(document.getElementsByName('ambiente')),
    comentarios:document.getElementById('comentario').value
  };

  $.post(url,data,
    function(result) {
      myApp.hidePreloader();
      if (result)
      {
        myApp.confirm("Avaliação enviada com sucesso, obrigado.", function(){
          mainView.router.back();
          setTimeout(function (){location.reload();},150);
        });
      }
      else
        myApp.alert("Não foi possível enviar sua avaliação, tente novamente.");
  });
}

function pegar_valor(campo){
  for (var i = 0, length = campo.length; i < length; i++) {
      if (campo[i].checked) {
          return (campo[i].value);
      }
  }
}

function carregar_cuponsa(ultimo_carregado, cidade_id, delivery,pagamento,tipo_id){
  myApp.showPreloader();
  if (ultimo_carregado == 0) 
    document.getElementById('cuponsa').innerHTML = ' ';
  var data = {
    classe:classe,
    metodo:"select_cupons",
    cidade_id:cidade_id,
    delivery:delivery,
    pagamento:pagamento,
    tipo_id:tipo_id
  };

  $.post(url,data,
    function(result) {
      var cupons = JSON.parse(result);

      if (cupons.length >0) {
        glb = 0;
      }

      for (i = 0; i < cupons.length ; i++) {

        desconto = Math.round(100 - (cupons[i].preco_cupom * 100 / cupons[i].preco_normal));

        cupons[i].preco_cupom  =  parseFloat(cupons[i].preco_cupom).toFixed(2);

        cupons[i].preco_normal  =  parseFloat(cupons[i].preco_normal).toFixed(2);

        if (cupons[i].quantidade >=5)
          cor = '#007aff';
        else
          cor = 'red';

        document.getElementById('cuponsa').innerHTML += '<div class="card facebook-card" style="margin:0; margin-top:20px;font-family: Ubuntu">'+
                                                          '<div class="card-content">'+
                                                            '<a href="oferta.html?id='+cupons[i].id+'&titulo='+cupons[i].titulo+'&desconto='+desconto+'&preco_normal='+cupons[i].preco_normal+'&preco_cupom='+cupons[i].preco_cupom+'&prazo='+cupons[i].prazo+'&quantidade='+cupons[i].quantidade+'&nome_fantasia='+cupons[i].nome_fantasia+'&caminho=http://www.clubedeofertas.net/imgs/'+cupons[i].imagem+'">'+
                                                              '<img src="http://www.clubedeofertas.net/imgs/'+cupons[i].imagem+'" width="100%">'+
                                                              '<div style="position:absolute; left: 75%; z-index: 999998;top: 0px;padding: 0px; border-radius: 5px; font-weight: bold; ">'+
                                                                '<img src="img/triangulo.png" width="100%">'+                  
                                                              '</div>'+
                                                              '<div style="position:absolute; right: 0px; z-index: 999999;top: 2px;color: white; padding: 5px; border-radius: 5px; font-weight: bold; ">'+
                                                                '<diva style="font-size: 20px;">'+desconto+'%</diva><br>&nbsp&nbsp&nbsp off'+
                                                              '</div>'+
                                                            '</a>'+
                                                            '<div style="position:absolute; z-index: 999998;bottom: 3px; width:100%;color:white; background-color: rgba(0, 0, 0,0.70);font-size: 20px">'+
                                                                '<center style="font-weight: bold;font-family: Ubuntu;">'+cupons[i].nome_fantasia+'</center>'+
                                                            '</div>'+
                                                          '</div>'+
                                                          '<div>'+
                                                          '<div class="content-block" style="padding: 0;">'+
                                                              '<div class="row">'+
                                                              '<div class="col-65" style="border: solid;border-color: white;color: white;">'+
                                                                '<div class="list-block">'+
                                                                  '<ul style="font-size: 20px; font-weight: bold">'+
                                                                    '<a href="#" onclick="myApp.alert(\'Para pegar este cupom, faça login.\')" style="color:white">'+
                                                                    '<li class="item-content" style="background-color: #F44336; min-height: 0;height: 30px;">'+
                                                                      '<div class="item-media"><i class="fa fa-download"></i></div>'+
                                                                      '<div class="item-inner" style="min-height: 0;">'+
                                                                        '<div class="item-title" style="font-style: italic;"> Pegar Cupom</div>'+
                                                                      '</div>'+
                                                                    '</li>'+
                                                                    '</a>'+
                                                                  '</ul>'+
                                                                '</div>'+
                                                              '</div>'+
                                                              '<div class="col-35" style="border: solid;border-color: white;color: white; width: 35%;">'+
                                                                '<div class="list-block">'+
                                                                  '<ul style="font-size: 20px;">'+
                                                                    '<a href="oferta.html?id='+cupons[i].id+'&titulo='+cupons[i].titulo+'&desconto='+desconto+'&preco_normal='+cupons[i].preco_normal+'&preco_cupom='+cupons[i].preco_cupom+'&prazo='+cupons[i].prazo+'&quantidade='+cupons[i].quantidade+'&nome_fantasia='+cupons[i].nome_fantasia+'&caminho=http://www.clubedeofertas.net/imgs/'+cupons[i].imagem+'" style="color: white;">'+
                                                                    '<li class="item-content" style="background-color:#17a3b0 ; min-height: 0;height: 30px; ">'+
                                                                      '<div class="item-inner" style="min-height: 0;">'+
                                                                        '<div class="item-title" style="font-style: italic;">&nbspDetalhes</div>'+
                                                                      '</div>'+
                                                                    '</li>'+
                                                                    '</a>'+
                                                                  '</ul>'+
                                                                '</div>'+
                                                              '</div>'+
                                                              '</div>'+
                                                          '</div>'+
                                                          '<hr>'+
                                                          '<div class="facebook-name" style="font-size: 22px; color: black; font-family: Ubuntu;font-weight: bold;font-style: italic;">&nbsp'+cupons[i].titulo+'</div>'+
                                                            '<div class="content-block">'+
                                                              '<div class="row">'+
                                                                '<div class="col-36"><center><p style="font-weight: bold"><s style="font-size: 14px;">De: <divas style="font-size:18px">R$'+cupons[i].preco_normal+'</divas></s><br><diva style="font-size: 14px;color: red;">Por: <divas style="font-size:22px;">R$'+cupons[i].preco_cupom+'</divas></diva></p></center></div>'+
                                                                '<div class="col-33" style="border-right: thick solid #ccc;border-left: thick solid #ccc; border-right-width: 1px;border-left-width: 1px;"><center><p style="font-size: 15px;color: '+cor+';"> <diva style="color:black;">Disponíveis</diva><br><diva style="font-size: 18px;font-weight: bold;font-size: 22px;">'+cupons[i].quantidade+'</diva> </p></center></div>'+
                                                                '<div class="col-30"><center><p style="font-size: 15px;color: black"><i class="fa fa-clock-o"></i> Até <br> '+cupons[i].prazo+'</p></center></div>'+
                                                              '</div>'+
                                                          '</div>'+
                                                        '</div>'+
                                                    '</div>';
        }    
      myApp.hidePreloader();
  });
  
}

function carregar_cupons(ultimo_carregado, cidade_id, delivery,pagamento,tipo_id){
  myApp.showPreloader();
  if (ultimo_carregado == 0) 
    document.getElementById('cupons').innerHTML = ' ';

  var data = {
    access_token:localStorage.getItem("access_token"),
    classe:classe,
    metodo:"select_cupons",
    cidade_id:cidade_id,
    delivery:delivery,
    pagamento:pagamento,
    tipo_id:tipo_id
  };

  $.post(url,data,
    function(result) {
      myApp.hidePreloader();

      var cupons = JSON.parse(result);

      if (cupons.length >0)
        glb = 0;

        var html = "";

        for (i = 0; i < cupons.length ; i++) {

          desconto = Math.round(100 - (cupons[i].preco_cupom * 100 / cupons[i].preco_normal));

          cupons[i].preco_cupom  =  parseFloat(cupons[i].preco_cupom).toFixed(2);

          cupons[i].preco_normal  =  parseFloat(cupons[i].preco_normal).toFixed(2);

          if (cupons[i].quantidade >=5)
            cor = '#007aff';
          else
            cor = 'red';

          var abrir = "";
          var fechar = "";
          if(i % 2 == 0)
            abrir = '<div class="row">';
          else
            fechar = '</div>';

          html += abrir+'<div class="col-100 tablet-50 card facebook-card" style="margin:0; margin-top:20px;font-family: Ubuntu">'+
                          '<div class="card-content">'+
                            '<a href="oferta.html?id='+cupons[i].id+'&titulo='+cupons[i].titulo+'&desconto='+desconto+'&preco_normal='+cupons[i].preco_normal+'&preco_cupom='+cupons[i].preco_cupom+'&prazo='+cupons[i].prazo+'&quantidade='+cupons[i].quantidade+'&nome_fantasia='+cupons[i].nome_fantasia+'&caminho=http://www.clubedeofertas.net/imgs/'+cupons[i].imagem+'">'+
                              '<img src="http://www.clubedeofertas.net/imgs/'+cupons[i].imagem+'" width="100%" height="260">'+
                              '<div style="position:absolute; left: 75%; z-index: 999998;top: 0px;padding: 0px; border-radius: 5px; font-weight: bold; ">'+
                                '<img src="img/triangulo.png" width="100%">'+                  
                              '</div>'+
                              '<div style="position:absolute; right: 0px; z-index: 999999;top: 2px;color: white; padding: 5px; border-radius: 5px; font-weight: bold; ">'+
                                '<diva style="font-size: 20px;">'+desconto+'%</diva><br>&nbsp&nbsp&nbsp off'+
                              '</div>'+
                            '</a>'+
                            '<div style="position:absolute; z-index: 999998;bottom: 3px; width:100%;color:white; background-color: rgba(0, 0, 0,0.70);font-size: 20px">'+
                                '<center style="font-weight: bold;font-family: Ubuntu;">'+cupons[i].nome_fantasia+'</center>'+
                            '</div>'+
                          '</div>'+
                          '<div>'+
                          '<div class="content-block" style="padding: 0;">'+
                              '<div class="row">'+
                              '<div class="col-65" style="border: solid;border-color: white;color: white;">'+
                                '<div class="list-block">'+
                                  '<ul style="font-size: 20px; font-weight: bold">'+
                                    '<a href="#" onclick="pegar_cupom('+cupons[i].id+',\''+cupons[i].titulo+'\')" style="color:white">'+
                                    '<li class="item-content" style="background-color: #F44336; min-height: 0;height: 30px;">'+
                                      '<div class="item-media"><i class="fa fa-download"></i></div>'+
                                      '<div class="item-inner" style="min-height: 0;">'+
                                        '<div class="item-title" style="font-style: italic;"> Pegar Cupom</div>'+
                                      '</div>'+
                                    '</li>'+
                                    '</a>'+
                                  '</ul>'+
                                '</div>'+
                              '</div>'+
                              '<div class="col-35" style="border: solid;border-color: white;color: white; width: 35%;">'+
                                '<div class="list-block">'+
                                  '<ul style="font-size: 20px;">'+
                                    '<a href="oferta.html?id='+cupons[i].id+'&titulo='+cupons[i].titulo+'&desconto='+desconto+'&preco_normal='+cupons[i].preco_normal+'&preco_cupom='+cupons[i].preco_cupom+'&prazo='+cupons[i].prazo+'&quantidade='+cupons[i].quantidade+'&nome_fantasia='+cupons[i].nome_fantasia+'&caminho=http://www.clubedeofertas.net/imgs/'+cupons[i].imagem+'" style="color: white;">'+
                                    '<li class="item-content" style="background-color:#17a3b0 ; min-height: 0;height: 30px; ">'+
                                      '<div class="item-inner" style="min-height: 0;">'+
                                        '<div class="item-title" style="font-style: italic;">&nbspDetalhes</div>'+
                                      '</div>'+
                                    '</li>'+
                                    '</a>'+
                                  '</ul>'+
                                '</div>'+
                              '</div>'+
                              '</div>'+
                          '</div>'+
                          '<hr>'+
                          '<div class="facebook-name" style="font-size: 22px; color: black; font-family: Ubuntu;font-weight: bold;font-style: italic;">&nbsp'+cupons[i].titulo+'</div>'+
                            '<div class="content-block">'+
                              '<div class="row">'+
                                '<div class="col-36"><center><p style="font-weight: bold"><s style="font-size: 14px;">De: <divas style="font-size:18px">R$'+cupons[i].preco_normal+'</divas></s><br><diva style="font-size: 14px;color: red;">Por: <divas style="font-size:22px;">R$'+cupons[i].preco_cupom+'</divas></diva></p></center></div>'+
                                '<div class="col-33" style="border-right: thick solid #ccc;border-left: thick solid #ccc; border-right-width: 1px;border-left-width: 1px;"><center><p style="font-size: 15px;color: '+cor+';"> <diva style="color:black;">Disponíveis</diva><br><diva style="font-size: 18px;font-weight: bold;font-size: 22px;">'+cupons[i].quantidade+'</diva> </p></center></div>'+
                                '<div class="col-30"><center><p style="font-size: 15px;color: black"><i class="fa fa-clock-o"></i> Até <br> '+cupons[i].prazo+'</p></center></div>'+
                              '</div>'+
                          '</div>'+
                        '</div>'+
                    '</div>'+fechar;
          }
          document.getElementById('cupons').innerHTML += html;
      });
}

function carregar_meus_cupons(){
  myApp.showPreloader();
  var data = {
    access_token:localStorage.getItem("access_token"),
    classe:classe,
    metodo:"select_historico",
    id:localStorage.getItem("user_id")
  };

  $.post(url,data,
    function(result) {
      var cupons = JSON.parse(result);
      document.getElementById('meus_cupons_historico').innerHTML = ' ';
      var batatinea = ' ';
      var last = ' ';
      var lucro = 0;
      var resgatar = 0;

      for (i = 0;i < cupons.length ; i++) 
      {

        if (NData(cupons[i].data_resgate) != last) {
            last = NData(cupons[i].data_resgate);
            dat = NData(cupons[i].data_resgate);
            batatinea +=  '<div class="content-block-title" ><i class="fa fa-calendar"></i> '+dat+'</div>';
        }

        desconto = Math.round(100 - (cupons[i].preco_cupom * 100 / cupons[i].preco_normal));

        batatinea +=   '<div class="card">'+
                                                                         '<div class="card-content">'+
                                                                           '<div class="list-block media-list">'+
                                                                              '<ul>'+
                                                                                '<li>';
        if (cupons[i].estado == -1)
          batatinea += '<a href="#" class="item-content item-link" style="border-left: thick solid #FF0000;">'; 
        if (cupons[i].estado == 0) 
          batatinea += '<a href="#" class="item-content item-link" style="border-left: thick solid #007aff;">';
        if (cupons[i].estado == 1) {
          batatinea += '<a href="opiniao.html?id='+cupons[i].id+'&titulo='+cupons[i].titulo+'&desconto='+desconto+'&preco_normal='+cupons[i].preco_normal+'&preco_cupom='+cupons[i].preco_cupom+'&prazo='+cupons[i].prazo+'&nome_fantasia='+cupons[i].nome_fantasia+'&caminho=http://www.clubedeofertas.net/imgs/'+cupons[i].imagem+'" class="item-content item-link" style="border-left: thick solid #FFa500;">';
          lucro += cupons[i].preco_normal - cupons[i].preco_cupom;
        }
        if (cupons[i].estado == 2) {
          batatinea += '<a href="#" class="item-content item-link" style="border-left: thick solid #00FF00;">';
          lucro += cupons[i].preco_normal - cupons[i].preco_cupom;
        }

        batatinea +=                                                     '<div class="item-inner">'+
                                                                          '<div class="item-title-row">'+
                                                                            '<div class="item-title">'+cupons[i].titulo+'</div>'+
                                                                          '</div>'+
                                                                          '<div class="item-subtitle">'+cupons[i].nome_fantasia+'</div>'+
                                                                        '</div>'+
                                                                      '</a>'+
                                                                    '</li>'+
                                                                  '</ul>'+
                                                                '</div>'+
                                                             ' </div>'+
                                                              '<div class="card-footer">'+
                                                                '<span>'+desconto+'% Off</span>';
        if (cupons[i].estado == -1)
          batatinea += '<span>Cupom Não utilizado</span>';
        if (cupons[i].estado == 0)
          batatinea += '<span>Cupom aguardando resgate</span>';
        if (cupons[i].estado == 1){
          batatinea += '<span>Avaliação pendente</span>';
          resgatar = 1;
        }
        if (cupons[i].estado == 2)
          batatinea += '<span>Cupom Finalizado</span>';

        batatinea +=  '</div></div>';
      }   
      document.getElementById('meus_cupons_historico').innerHTML = batatinea;
      document.getElementById('economia').innerHTML = 'Você já economizou R$'+parseFloat(lucro).toFixed(2);
      if (resgatar == 1) {
        resgate();
      }
      myApp.hidePreloader();
    });
}

function novaData(n) {
  this.length = n
  return this
}
NMes = new novaData(12)
NMes[1] = "Janeiro"
NMes[2] = "Fevereiro"
NMes[3] = "Março"
NMes[4] = "Abril"
NMes[5] = "Maio"
NMes[6] = "Junho"
NMes[7] = "Julho"
NMes[8] = "Agosto"
NMes[9] = "Setembro"
NMes[10] = "Outubro"
NMes[11] = "Novembro"
NMes[12] = "Dezembro"
DDias = new novaData(7)
DDias[1] = "Domingo"
DDias[2] = "Segunda"
DDias[3] = "Terça"
DDias[4] = "Quarta"
DDias[5] = "Quinta"
DDias[6] = "Sexta"
DDias[7] = "Sábado"

function NData(data) {
  cDate = new Date(data)
  var Dia = DDias[cDate.getDay() + 1]
  var Mes = NMes[cDate.getMonth() + 1]
  msie4 = ((navigator.appName == "Microsoft Internet Explorer")
        && (parseInt(navigator.appVersion) >= 4 ));
  if (msie4) {
      var ano = cDate.getYear()
  }
  else {
       var ano = cDate.getYear() +1900
  }
  return Dia + ", " + cDate.getDate() + " de " + Mes + " " +  " de " + ano
}

function carregar_login(){
  $$("#ba").hide();
  document.getElementById('peige').innerHTML = '<div data-page="login-screen" class="page no-navbar">'+
                                                '<div class="page-content login-screen-content" style="background-image:url(\'img/pancue.jpg\');background-size: 100%">'+
                                                '<div style="padding-bottom: 5px; max-width: 480px; margin: auto;">'+
                                                  '<div class="login-screen-title" style="margin: 25px auto; "><img src="img/logo.png" width="150px"></div>'+
                                                    '<div class="list-block">'+
                                                      '<ul>'+
                                                        '<li class="item-content" style="padding-right: 15px;">'+
                                                          '<div class="item-inner" style="padding-right: 0;">'+
                                                              '<div class="item-input transp">'+
                                                                '<input type="email" name="login_email" id="login_email" placeholder="Email" required style="padding-left: 10px; color: white" onkeypress="next(event,this)">'+
                                                              '</div>'+
                                                          '</div>'+
                                                        '</li>'+
                                                        '<li class="item-content" style="padding-right: 15px;">'+
                                                          '<div class="item-inner" style="padding-right: 0;">'+
                                                              '<div class="item-input transp">'+
                                                                '<input type="password" name="login_senha" id="login_senha" placeholder="Senha" required style="padding-left: 10px; color: white" onkeypress="logar(event);">'+
                                                              '</div>'+
                                                          '</div>'+
                                                        '</li>'+
                                                      '</ul>'+
                                                    '</div>'+
                                                    '<div class="list-block-label" style="padding-left:15px;padding-right:15px;">'+
                                                        '<p><a onclick="login();" class="button button-fill color-blue">Entrar</a></p>'+
                                                        '<p><a href="cadastrar.html" class="button button-fill color-white" style="color:orange">Cadastre-se gratuitamente. Clique aqui</a></p>'+
                                                        '<p><a href="cupons-no-login.html" onclick="$$(\'#ba\').show();" class="button button-fill color-orange" style="color:white">Ver cupons sem login</a></p>'+
                                                        '<p><a href="#" onclick="esqueci_senha();" class="button button-fill color-white" style="color:orange">Esqueci minha senha</a></p>'+
                                                    '</div>'+
                                                    '</div>'+
                                                  '</div>'+
                                                '</div>'+
                                                '</div>'+
                                              '</div>';
}

function esqueci_senha()
{

  myApp.prompt('Digite seu email:', function (email) {
    myApp.showPreloader();

    var data = {
      metodo:"redefinir_senha",
      email:email
    };

    $.post(url,data,
      function(result)
      {
        myApp.hidePreloader();
        if(result)
          myApp.alert("Enviamos um email de redefinição! Siga as instruções e mude sua senha.");
        else
          myApp.alert("Algo deu errado, tente novamente.");
    });
  });
}

function detalhes_opiniao(id,nome,desconto,preco_ini,preco_desc,prazo,empresa,imagem){
  myApp.showPreloader();

  var data = {
    access_token:localStorage.getItem("access_token"),
    classe:classe,
    metodo:"select_detalhes_cupom",
    cupom_id:id
  };

  $.post(url,data,
    function(result)
    {
      myApp.hidePreloader();
      if(result){
        var cupom = JSON.parse(result);
        set_inner("opiniao_empresa",empresa);
        document.getElementById('opiniao_imagem').setAttribute("src", imagem);
        set_inner("opiniao_desconto",'<i class="fa fa-cart-arrow-down" style="font-size: 20px;"></i> &nbsp&nbsp'+desconto+'% off');
        set_inner("opiniao_titulo",nome);
        set_inner("opiniao_precos",'Por: R$'+parseFloat(preco_desc).toFixed(2)+' &nbsp<s style="color:gray">De: R$'+parseFloat(preco_ini).toFixed(2)+'</s>');
        document.getElementById('botao_avaliar').setAttribute("onclick", "avaliar("+id+")");
      }
      else
        myApp.alert("Não foi possível carregar os detalhes do cupom. Tente novamente.");
  });
}

function detalhes_cupom(id,nome,desconto,preco_ini,preco_desc,prazo,quantidade,empresa,imagem){
  myApp.showPreloader();

  var data = {
    access_token:localStorage.getItem("access_token"),
    classe:classe,
    metodo:"select_detalhes_cupom",
    cupom_id:id
  };

  $.post(url,data,
    function(result)
    {
      myApp.hidePreloader();
      if(result)
      {
        var cupom = JSON.parse(result);

        set_inner("empresa_oferta",empresa);
        document.getElementById('img_oferta').setAttribute("src", imagem);
        set_inner("desconto_cupom",'<diva style="font-size: 20px;">'+desconto+'%</diva><br>&nbsp&nbsp&nbsp off');
        set_inner("nome_cupom",nome);
        if (quantidade >=5)
          cor = '#007aff';
        else
          cor = 'red';
        set_inner("precos_cupom",'<diva style="font-size:18px">Por:</diva> <diva style="font-weight:bold; font-size:22px;">R$'+preco_desc+'</diva> &nbsp<s style="color:gray;font-size:18px;">De:<diva style="font-size:20px"> R$'+preco_ini+'</diva></s>');
        set_inner("info_cupom",'<i class="fa fa-ticket"></i> <diva style="color:'+cor+'">'+quantidade+' Restantes</diva><br><i class="fa fa-calendar"></i> Válido até '+prazo+'<br><hr>Categorias: ');
        for (i = 0; i < cupom.tipos.length; i++)
        {
          document.getElementById('info_cupom').innerHTML += cupom.tipos[i].nome+' ';
          if (i != (cupom.tipos.length -1) )
            document.getElementById('info_cupom').innerHTML += ', ';
        }
        set_inner("desc_cupom",'<p style="margin:0">Descrição: '+cupom.detalhes.descricao+'</p>');
        set_inner("regras_cupom",'<p style="margin:0">Regras: '+cupom.detalhes.regras+'</p>');
        set_inner("empresa_cupom",empresa); 
        document.getElementById('telefone_cupom').setAttribute("onclick", "window.open('tel:"+cupom.detalhes.telefone+"', '_system');");
        document.getElementById('tel_oferta').innerHTML = cupom.detalhes.telefone;
        document.getElementById("end_mapa").innerHTML =  cupom.detalhes.rua+", "+cupom.detalhes.complemento+" "+cupom.detalhes.num+", "+cupom.detalhes.nome;
        document.getElementById("endereco_cupom").setAttribute("onclick", "window.open('http://maps.apple.com/?q=loc:"+cupom.detalhes.latitude+","+cupom.detalhes.longitude+"', '_system');");

        var data = {
          access_token:localStorage.getItem("access_token"),
          classe:classe,
          metodo:"select_detalhes_cupom",
          id:localStorage.getItem("user_id")
        };

        $.post(url,data,
          function(result)
          {
            var permite = JSON.parse(result);

            var ok = true;
            for (i = 0; i < permite.length; i++)
            {
              if (permite[i].cupom_id == id)
                ok = false;
            }

            if (ok)
            {
              if (cupom.detalhes.estado == 0)
              {
                document.getElementById('botao_cupom').setAttribute('onclick','pegar_cupoma('+id+',\''+nome+'\');');
                document.getElementById('botao_cupom').setAttribute('class',"button button-fill color-red bttnb");
              }
              else
              {
                document.getElementById('botao_cupom').innerHTML = '<i class="fa fa-delete" style="font-size: 20px;"></i> &nbsp&nbspCupom Fora de Aquisição';
                document.getElementById('botao_cupom').setAttribute('disabled'," ");
                document.getElementById('botao_cupom').setAttribute('class',"button button-fill color-red bttnb");
              }
            }
            else
            {
              document.getElementById('botao_cupom').innerHTML = '<i class="fa fa-cart-arrow-down" style="font-size: 20px;"></i> &nbsp&nbspCupom Adquirido';
              document.getElementById('botao_cupom').setAttribute('disabled'," ");
              document.getElementById('botao_cupom').setAttribute('class',"button button-fill color-orange bttnb");
            }
        });
      }
      else
        myApp.alert("Não foi possível carregar os detalhes do cupom. Tente novamente.");
  });
}

function login()
{
  myApp.showPreloader();

  var data = {
    classe:classe,
    metodo:"login",
    email:document.getElementById("login_email").value,
    senha:document.getElementById("login_senha").value
  };

  $.post(url,data,
    function(result) {
      dados = JSON.parse(result);
      if (dados.id != 0 && dados.id != null && dados.id != 'null')
      {
        localStorage.setItem("user_id",dados.id);
        localStorage.setItem("access_token",dados.access_token);
        token(localStorage.getItem("token"));
        $$("#ba").show();
        location.reload();
      }
      else
      {
          myApp.alert("Email ou senha não correspondem!");
      }
      myApp.hidePreloader();
  });
}

function oloco(){
   window.history.go(-1);
   setTimeout(function(){location.reload();},200);
   
}

function logout() {
  token("");
  localStorage.removeItem("user_id");
  localStorage.removeItem("access_token");
  mainView.router.back();
  carregar_login();
  location.reload();
}

function alterar_senha(){
  myApp.showPreloader();
  if (document.getElementById('usuario_senha1').value == document.getElementById('usuario_senha2').value)
  {
    var data = {
      access_token:localStorage.getItem("access_token"),
      classe:classe,
      metodo:"update_senha",
      id:localStorage.getItem("user_id"),
      senha_antiga:document.getElementById("usuario_senha_antiga").value,
      senha_nova:document.getElementById("usuario_senha1").value
    };

    $.post(url,data,
      function(result) {
        myApp.hidePreloader();
        if (result == "error")
          myApp.alert("Não foi possível alterar sua senha, verifique os dados e tente novamente");
        else
        {
          localStorage.setItem("access_token",result);
          myApp.alert("Senha alterada com sucesso!");
          mainView.router.back();
        }
    });
  }
  else
  {
    myApp.hidePreloader();
    myApp.alert("Senhas não conferem");
  }
}

function carregar_perfil(){

  if (localStorage.getItem("user_id") == null)
    myApp.alert("Você nao realizou login, por favor, faça-o");
  else
  {
    myApp.showPreloader();
    var data = {
      access_token:localStorage.getItem("access_token"),
      classe:classe,
      metodo:"select_perfil",
      id:localStorage.getItem("user_id")
    };

    $.post(url,data,
      function(result) {
        myApp.hidePreloader();
        if (!result) 
          myApp.alert("Não foi possível carregar o seu perfil, por favor, tente novamente.");
        else{
          var perfil = JSON.parse(result);
          document.getElementById("user_nome").value = perfil.nome;
          document.getElementById("user_email").value = perfil.email;
          document.getElementById("user_telefone").value = perfil.celular;
          document.getElementById("user_genero").value = perfil.genero;
          document.getElementById("user_nasc").value = perfil.nascimento;
        }
    });
  }
}

function alterar_perfil(){
  if (localStorage.getItem("user_id") == null)
    myApp.alert("Você nao realizou login, por favor, faça-o");
  else
  {
    myApp.showPreloader();
    var data = {
      access_token:localStorage.getItem("access_token"),
      classe:classe,
      metodo:"update_perfil",
      id:localStorage.getItem("user_id"),
      nome:document.getElementById("user_nome").value,
      celular:document.getElementById("user_telefone").value,
      genero:document.getElementById("user_genero").value,
      nascimento:document.getElementById("user_nasc").value
    };

    $.post(url,data,
      function(result) {
        myApp.hidePreloader();
        if (!result)
        {
          myApp.hidePreloader();
          myApp.alert("Não foi possível alterar o seu perfil, por favor, tente novamente.");
        }
        else
        {
          myApp.alert("Seu perfil foi alterado com sucesso.");
          myApp.hidePreloader();
        }
    });
  }
}

function get_elemento(id){
    return document.getElementById(id);
}

function get_value(id){
    return document.getElementById(id).value;
}

function set_value(id,valor){
   document.getElementById(id).value = valor;
}

function set_inner(id,valor){
   document.getElementById(id).innerHTML = valor;
}

function pegar_cupom(id,titulo){
  myApp.confirm('Confirmar compra de: '+titulo+'. A não utilização do cupom resultará num bloqueio de 7 dias do aplicativo.', 
    function () {
      myApp.showPreloader();
      var data = {
        access_token:localStorage.getItem("access_token"),
        classe:classe,
        metodo:"pegar_cupom",
        id:localStorage.getItem("user_id"),
        cupom_id:id
      };

      $.post(url,data,
        function(result) {
          myApp.hidePreloader();
          if (result == 1) {
            myApp.alert("Seu cupom foi ativado! Para utilizá-lo, entre em contato com o estabelecimento e faça seu pedido apresentando seu número de telefone. A não utilização do cupom resultará num bloqueio de 7 dias do aplicativo.", function() {
               carregar_cupons(ultimo_carregado,1,0,0,"");
               carregar_meus_cupons();
            });
          }
          else
            myApp.alert("Não foi possível pegar este cupom, confira se já não o adquiriu e tente novamente.");
      });
  });    
}

function pegar_cupoma(id,titulo){
  if (localStorage.getItem("user_id") == null || localStorage.getItem("user_id") == 'null')
    myApp.alert('Para pegar este cupom, faça login.');
  else
  {
    myApp.confirm('Confirmar compra de: '+titulo+'. A não utilização do cupom resultará num bloqueio de 7 dias do aplicativo.', function () {
      myApp.showPreloader();
      var data = {
        access_token:localStorage.getItem("access_token"),
        classe:classe,
        metodo:"pegar_cupom",
        id:localStorage.getItem("user_id"),
        cupom_id:id
      };

      $.post(url,data,
        function(result) {
          myApp.hidePreloader();
          if (result == 1) {
            myApp.alert("Seu cupom foi ativado! Para utilizá-lo, entre em contato com o estabelecimento e faça seu pedido apresentando seu número de telefone. A não utilização do cupom resultará num bloqueio de 7 dias do aplicativo.", function() {
              mainView.router.back();
              carregar_cupons(ultimo_carregado,1,0,0,"");
              carregar_meus_cupons();
            });
          }
          else
            myApp.alert("Não foi possível pegar este cupom, confira se já não o adquiriu e tente novamente.");
      });
    });
  }
}

function limitar(campo,min,max){
  campo.value = campo.value.slice(min,max);
}

function next(event,elem)
{
  if(event.keyCode == 13){
    nextEl = findNextTabStop(elem);
    nextEl.focus();
  }
}

function logar(event)
{
  if(event.keyCode == 13)
    login();
}

function findNextTabStop(el) {
  var universe = document.querySelectorAll('input, button, select, textarea, a[href]');
  var list = Array.prototype.filter.call(universe, function(item) {return item.tabIndex >= "0"});
  var index = list.indexOf(el);
  return list[index + 1] || list[0];
}