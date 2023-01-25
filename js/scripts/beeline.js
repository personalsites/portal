var markers = [],
    map,
    geocoder,
    
    haightAshbury,
    nach,
    index,
    directionsService,
    directionsDisplay,
    waypts = [],
    waypts_length = [],
    ddate,
    s,
    time,icon
    number;

    // //удаляем все маркеры на карте для Google
    function setMapOnAll(map) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

var cpk = 'img/cpk.png';
var ic = 'img/ic.png';

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    if (waypts.length == 0) {
        console.log("markers[0]", markers[0])
        var myar = markers[0].position;
    }
    else {
        var myar = waypts[waypts.length - 1].location;
    }
        var waypts2 = waypts.slice();
        waypts2.splice(waypts2.length - 1, 1);


        directionsService.route({
            origin: markers[0].position,
            destination: myar,
            waypoints: waypts2,
            optimizeWaypoints: true,
            travelMode: ymaps.maps.TravelMode.DRIVING
        }, function (response, status) {
            if (status === ymaps.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
                var route = response.routes[0];

                // For each route, display summary information.
                s = 0;
                for (var i = 0; i < route.legs.length; i++) {
                    s += route.legs[i].distance.value;
                    var routeSegment = i + 1;
                    console.info('Route Segment: ' + routeSegment);
                    console.info(route.legs[i].start_address + ' to ');
                    console.info(route.legs[i].end_address);
                    console.info(route.legs[i].distance.text);
                }
                $(".lbl").text((s / 1000).toFixed(1) + " км...");
            } else {
                console.error('Directions request failed due to ' + status);
            }
        });
}

function init(ymaps) {
    var myMap = new ymaps.Map("map", {
        center: [54.563630, 36.261359],
        zoom: 10
    }, {
        searchControlProvider: 'yandex#search'
    });

// Создаём макет содержимого.
MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
    '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
),

myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
    hintContent: 'Собственный значок метки',
    balloonContent: 'Это красивая метка'
}, {
    // Опции.
    // Необходимо указать данный тип макета.
    iconLayout: 'default#image',
    // Своё изображение иконки метки.
    iconImageHref: 'images/myIcon.gif',
    // Размеры метки.
    iconImageSize: [30, 42],
    // Смещение левого верхнего угла иконки относительно
    // её "ножки" (точки привязки).
    iconImageOffset: [-5, -38]
}),

myPlacemarkWithContent = new ymaps.Placemark([55.661574, 37.573856], {
    hintContent: 'Собственный значок метки с контентом',
    balloonContent: 'А эта — новогодняя',
    iconContent: '12'
}, {
    // Опции.
    // Необходимо указать данный тип макета.
    iconLayout: 'default#imageWithContent',
    // Своё изображение иконки метки.
    iconImageHref: 'images/ball.png',
    // Размеры метки.
    iconImageSize: [48, 48],
    // Смещение левого верхнего угла иконки относительно
    // её "ножки" (точки привязки).
    iconImageOffset: [-24, -24],
    // Смещение слоя с содержимым относительно слоя с картинкой.
    iconContentOffset: [15, 15],
    // Макет содержимого.
    iconContentLayout: MyIconContentLayout
});

myMap.geoObjects
.add(myPlacemark)
.add(myPlacemarkWithContent);






}

haightAshbury = new ymaps.maps.LatLng(55.751574, 37.573856);
var marker = new ymaps.maps.Marker({
    position: haightAshbury,
    map: map,
    icon: cpk,
    title: "ЦПК г.Калуга",
    code: "55.751574, 37.573856"
        });

        markers.push(marker);

    function geocodeAddress(geocoder, resultsMap, address) {

        if ($("#cke_1_contents iframe").contents().find("body table tr:eq(" + nach + ") td:eq(0)").text() != $('input[name=time]:checked').val()) {
            nach++;
            if (nach == index) { $(".modal-body").html('Mission complete!!!'); $(".modal").modal(); return false; }
            geocodeAddress(geocoder, map, $("#cke_1_contents iframe").contents().find("body table tr:eq(" + nach + ") td:eq(3)").text());
            return false;
        }


        address1 = address;
        address = $('input[name=city]:checked').val() + address;
        geocoder.geocode({ 'address': address }, function (results, status) {
            if (status === ymaps.maps.GeocoderStatus.OK) {
                resultsMap.setCenter(results[0].geometry.location);
                var marker = new ymaps.maps.Marker({
                    title: address1,
                    map: resultsMap,
                    position: results[0].geometry.location,
                    code: results[0].geometry.location.lat() + ", " + results[0].geometry.location.lng(),
                    num: markers.length,
                    name: $("#cke_1_contents iframe").contents().find("body table tr:eq(" + nach + ") td:eq(2)").text(),
                    regon: $("#cke_1_contents iframe").contents().find("body table tr:eq(" + nach + ") td:eq(1)").text()
                });
                marker.addListener('click', m_click);

                markers.push(marker);
            } else {
                if (status == "OVER_QUERY_LIMIT") {
                    setTimeout('geocodeAddress(geocoder, map,$("#cke_1_contents iframe").contents().find("body table tr:eq(' + nach + ') td:eq(3)").text())', 700);
                    return false;

                }
                else {
                    $(".modal-body").html('Адресс не найден!!! ' + status); $(".modal").modal();
                    $("#cke_1_contents iframe").contents().find("body table tr:eq(" + nach + ")").css({ "background-color": "red" });
                }
            }

            nach++;
            if (nach == index) { $(".modal-body").html('Mission complete!!!'); $(".modal").modal(); return false; }
            setTimeout('geocodeAddress(geocoder, map,$("#cke_1_contents iframe").contents().find("body table tr:eq(' + nach + ') td:eq(3)").text())', 700);
        });

    }

    function m_click() {
        var title = $(this).attr("title")
        var position = $(this).attr("position")
        var num = $(this).attr("num")
        var name = $(this).attr("name")
        var regon = $(this).attr("regon")

        if (this.icon == "img/ic.png") {

            for (var t = this.num2 + 1; t < waypts_length.length; t++) {
                console.log(waypts_length[t].num2);
                waypts_length[t].num2--;
                markers[waypts_length[t].num].num2--;
            }


            waypts.splice(this.num2, 1);
            waypts_length.splice(this.num2, 1);
            this.setMap(null);
            var marker = new ymaps.maps.Marker({
                position: position,
                map: map,
                title: title,
                num: num,
                name: name,
                regon: regon
            });
            markers[num] = marker;
            marker.addListener('click', m_click);
        }
        else {
            if (waypts.length == 4) { return false; }
            if (waypts.length < 4) {
                this.setMap(null);
                var marker = new ymaps.maps.Marker({
                    position: position,
                    map: map,
                    icon: ic,
                    title: title,
                    num: num,
                    num2: waypts.length,
                    name: name,
                    regon: regon
                });
                markers[num] = marker;
                marker.addListener('click', m_click);
                waypts_length.push({
                    num2: waypts.length,
                    num: num,
                    address: title,
                    name: name,
                    regon: regon
                });
                waypts.push({
                    location: marker.position,
                    stopover: true
                });


            }

        }
        console.error(waypts.length);

        if (waypts.length > 0) {

            $(".project-box-content").html('<span class="chart" data-percent="86"><span class="percent">86</span>%<br><span class="lbl">completed</span><canvas height="130" width="130"></canvas></span>');
            $("#add-box .percent").text(waypts.length * 25);
            $("#add-box .chart").attr({ "data-percent": waypts.length * 25 });
            $("#d_option").hide();
            $("#add-box").css({ "top": $("#d_option:visible").outerHeight() + 20 });
            $("#add-box").show();
        }
        else {
            $("#add-box").hide();
        }
        $('.chart').easyPieChart({
            easing: 'easeOutBounce',
            onStep: function (from, to, percent) {
                $(this.el).find('.percent').text(Math.round(percent));
            },
            barColor: '#68b3a5',
            trackColor: '#f2f2f2',
            scaleColor: false,
            lineWidth: 8,
            size: 130,
            animate: 500
        });

        calculateAndDisplayRoute(directionsService, directionsDisplay);
    }

    $(document).ready(function () {

        $("#kaluga").bind("click", function () {
            haightAshbury = new ymaps.maps.LatLng(54.563598, 36.261442);
            setMapOnAll(null);
            markers.splice(1, markers.length - 1);
            markers[0].position = haightAshbury;
            markers[0].title = "ЦПК г.Калуга";
            markers[0].code = "55.751574, 37.573856";
            setMapOnAll(map);
            map.setCenter(markers[0].getPosition());
        });

        $("#voronezh").bind("click", function () {
            haightAshbury = new ymaps.maps.LatLng(51.680647, 39.180847);
            setMapOnAll(null);
            markers.splice(1, markers.length - 1);
            markers[0].position = haightAshbury;
            markers[0].title = "ЦПК г.Воронеж";
            markers[0].code = "55.751574, 37.573856";
            setMapOnAll(map);
            map.setCenter(markers[0].getPosition());
        });

        $("#nino").bind("click", function () {
            haightAshbury = new ymaps.maps.LatLng(56.307438, 43.988931);
            setMapOnAll(null);
            markers.splice(1, markers.length - 1);
            markers[0].position = haightAshbury;
            markers[0].title = "ЦПК г.Нижний Новгород";
            markers[0].code = "55.751574, 37.573856";
            setMapOnAll(map);
            map.setCenter(markers[0].getPosition());
        });

        $("#perm").bind("click", function () {
            haightAshbury = new ymaps.maps.LatLng(58.009557, 56.187656);
            setMapOnAll(null);
            markers.splice(1, markers.length - 1);
            markers[0].position = haightAshbury;
            markers[0].title = "ЦПК г.Пермь";
            markers[0].code = "55.751574, 37.573856";
            setMapOnAll(map);
            map.setCenter(markers[0].getPosition());
        });


        $("#map").height($(window).height() - $("#header-navbar").height() - $("#footer-bar").height() - 20);
        $("#t_table").bind("click", function () {
            $(".nav-stacked li").removeClass("active");
            $(this).parent("li").addClass("active");
            $("#d_option").hide();
            $("#cke_exampleTextarea").toggle();
            $("#cke_exampleTextarea2").hide();
            //console.clear();
            console.log($("#cke_1_contents iframe").contents().find('body table tr:eq(2)').html());
            $("#cke_1_contents").height($(window).height() - $("#header-navbar").height() - $("#footer-bar").height() - 200);
            $("#add-box").css({ "top": $("#d_option:visible").outerHeight() + 20 });
        });
        $("#option").bind("click", function () {
            $(".nav-stacked li").removeClass("active");
            $(this).parent("li").addClass("active");
            $("#cke_exampleTextarea").hide();
            $("#cke_exampleTextarea2").hide();
            $("#d_option").toggle();
            $("#add-box").css({ "top": $("#d_option:visible").outerHeight() + 20 });
        });
        $("#result").bind("click", function () {
            $(".nav-stacked li").removeClass("active");
            $(this).parent("li").addClass("active");
            $("#cke_exampleTextarea").hide();
            $("#d_option").hide();
            $("#cke_2_contents").height($(window).height() - $("#header-navbar").height() - $("#footer-bar").height() - 200);
            $("#cke_exampleTextarea2").toggle();
            $("#add-box").css({ "top": $("#d_option:visible").outerHeight() + 20 });
        });
        $("#send").bind("click", function () {
            $("#cke_2_contents iframe").contents().find('body').html("");
            var ddd = new Date().getUTCMonth();
            ddd++;
            time = $('input[name=time]:checked').val();
            if ($('input[name=time]:checked').val() != "22:00") { ddate = (new Date().getUTCDate() + 1) + "." + ddd + "." + new Date().getUTCFullYear(); }
            else { ddate = new Date().getUTCDate() + "." + ddd + "." + new Date().getUTCFullYear(); }



            $("#cke_1_contents iframe").contents().find("body table tr").css({ "background-color": "white" });
            waypts_length = [];
            waypts = [];
            calculateAndDisplayRoute(directionsService, directionsDisplay);
            if ($("#cke_1_contents iframe").contents().find('body table tr:eq(2)').html() == undefined) { $(".modal-body").html('Вы не загрузили таблицу с адресами!'); $(".modal").modal(); return false; }
            setMapOnAll(null);
            markers.splice(1, markers.length - 1);

            setMapOnAll(map);
            index = $("#cke_1_contents iframe").contents().find('body table tr:last').index() + 1;
            //console.error(index);
            nach = 0;

            geocodeAddress(geocoder, map, $("#cke_1_contents iframe").contents().find('body table tr:eq(' + nach + ') td:eq(3)').text());
            //setTimeout('geocodeAddress(geocoder, map,$("#cke_1_contents iframe").contents().find('body table tr:eq('+nach+') td:eq(0)').text())',5000);

        });







        // создание нумерации
        //$("#send").bind("click",function(){
        //$("#cke_2_contents iframe").contents().find('body').html("");
        //var ddd=new Date().getUTCMonth();
        //ddd++;
        //time=$('input[name=time]:checked').val();
        //if ($('input[name=time]:checked').val()!="23:00"){ddate=(new Date().getUTCDate()+1)+"."+ddd+"."+new Date().getUTCFullYear();}
        //else {ddate=new Date().getUTCDate()+"."+ddd+"."+new Date().getUTCFullYear();












        $("#add").bind("click", function () {


            var html_text = '<table cellspacing="0" width="100%" border=1 ><tr><th colspan="2" bgcolor="LightGrey" >Маршрутный лист "БИЛАЙН"</tr>';
            //html_text += '<table cellspacing="0" width="100%" border=1 ><tr><th colspan="2" bgcolor="LightGrey" >GettTaxi</th></tr>';
            //html_text+='<tr><th>Дата: '+ddate+'</th><th>Время: '+time.substring(0, time.length - 2)+'10</th></tr>';
            html_text += '<table cellspacing="0" width="100%" border=1 ><tr><th align="left">Дата исполнения заказа:</th><th width="50%">' + ddate + '</th></tr>';
            html_text += '<table cellspacing="0" width="100%" border=1 ><tr><th align="left">Время посадки:</th><th width="50%">' + time.substring(0, time.length - 2) + '10</th></tr>';
            html_text += '<table cellspacing="0" width="100%" border=1 ><tr><th align="left">Номер машины:</th><th width="50%"></th></tr>';
            html_text += '<table cellspacing="0" width="100%" border=1 ><tr><th align="left">Номер заказа:</th><th width="50%"></th></tr>';
            //html_text += '<table cellspacing="0" width="100%" border=1 ><tr><th align="left">Километраж:</th><th width="50%">' + (s / 1000).toFixed(1) + ' км</th></tr>';
            //html_text += '<table cellspacing="0" width="100%" border=1 ><tr><th bgcolor="LightGrey"></th><th width="25%" bgcolor="LightGrey" align="right">Дежурный:</th><th width="50%" bgcolor="LightGrey"></th></tr>';
            html_text += '<table cellspacing="0" width="100%" border=1 ><tr><th bgcolor="LightGrey" >ФИО</th><th width="25%" bgcolor="LightGrey">Улица</th><th width="50%" bgcolor="LightGrey">Район</th></tr>';


            for (t = 0; t < waypts_length.length; t++) {
                html_text += '<tr><td>' + waypts_length[t].name + '</td><td>' + waypts_length[t].address + '</td><td>' + waypts_length[t].regon + '</td></tr>';
                //html_text+='<tr>'+(t+1)+'</tr>';
            }


            html_text += "</table><br>";
            $("#cke_2_contents iframe").contents().find('body').append(html_text);
            $("#cke_2_contents iframe").contents().find('body table:last tr:last').css({ "color": "black", "font-weight": "800", "font-weight": "bold" });
            $("#cke_2_contents iframe").contents().find('body table:last').css({ "font-family": "Time New Roman", "font-size": "10pt" });

            setMapOnAll(null);
            for (var y = 0; y < markers.length; y++) {
                console.error(markers[y].icon);
                if (markers[y].icon == "img/ic.png") {
                    for (var t = markers[y].num + 1; t < markers.length; t++) {
                        //console.log(waypts_length[t].num2);
                        markers[t].num--;
                    }
                    markers.splice(markers[y].num, 1);
                    y--;
                }
            }
            setMapOnAll(map);
            waypts_length = [];
            waypts = [];
            calculateAndDisplayRoute(directionsService, directionsDisplay);
            if (markers.length == 1) { $("#add-box").hide(); }
        });


    });
    $(window).resize(function () {
        $("#map").height($(window).height() - $("#header-navbar").height() - $("#footer-bar").height() - 20);
        $("#cke_1_contents").height($(window).height() - $("#header-navbar").height() - $("#footer-bar").height() - 200);

        $("#cke_2_contents").height($(window).height() - $("#header-navbar").height() - $("#footer-bar").height() - 200);
        $("#add-box").css({ "top": $("#d_option:visible").outerHeight() + 20 });
    });