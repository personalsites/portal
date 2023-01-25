ymaps.ready(init);

var myMap,
myPlacemark,


cpk,
ic,
directionsService,
directionsDisplay;

//удаляем все маркеры на карте

function setMapOnAll(myMap) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(myMap);
    }
}
//изображения меток
cpk = 'img/cpk.png';
ic = 'img/ic.png';


//добавляем метку на карту
    function init(ymaps){   
        var myMap = new ymaps.Map("map", {
            center: [54.563630, 36.261359],
            zoom: 10,

        });

        myPlacemark = new ymaps.Placemark([54.563630, 36.261359], {
                hintContent: 'ЦПК г.Калуга',
                iconImageHref: 'img/cpk.png'

                //добавление собсвенно изображения икон метки
        //},
        //{
            //iconLayout: 'default#image',
            //iconImageHref: 'img/cpk.png',
        });
        myMap.geoObjects.add(myPlacemark);
    }

    function addroute() {
        var mainRouter = ymaps.route([[54.514467570136,36.25403749999993], [54.50576907014299,36.27232749999994]], {});
        mainRouter.then(function(mainroute) {
                myMap.geoObjects.add(mainroute);
            },
            function (error) {
                if(error.message == "can't construct a route") {
                    alert("При построении маршрута возникла ошибка.\r\nПопробуйте изменить адреса или перезагрузить страницу.");
                } else {
                    alert("Возникла ошибка: " + error.message);
                }
            }
        )
    }
    
    function removeroute() {
        map.geoObjects.remove(mainRouter);
    }
    