(function taxiModule() {
  ymaps.ready(function () {
    handleInitialLoading();
    init();
    onDocumentReady();
  });

  const { debounce } = _;

  const {
    BEELINE_OFFICE_ADDRESS,
    BEELINE_OFFICE_COORDINATES,
    CITY_NAME,
    CLUSTERER_INDEX,
    DEBOUNCE_DELAY,
    DISTRICTS_REQUIRED_FOR_GEOCODING,
    HEADER_ROWS_COUNT,
    KALUGA_COORDINATES,
    MAX_CAR_CAPACITY,
    ROWS_PER_PAGE
  } = window._taxi_constants;

  const {
    addGeoObjectField,
    createEmployeeObject,
    getAddressAndPhone,
    getAddressForGeocoding,
    getDictionaryKey,
    getFormattedFullName,
    getFullDate,
    getSelectedTime,
    getStringWithoutLetters,
    isSameEmployee,
    setItemAsActive
  } = window._taxi_utils;

  let myMap;
  let clusterer;
  let center;
  let currentMultiRoute = null;
  let multiRouteModel = null;
  let routeCarPassengers = [];
  let routeSheetsData = [];
  let routeSheetsDataSet = new Set();

  const isPassengerOnCurrentList = target =>
    routeCarPassengers.some(passenger => passenger.geoObject === target);

  const getBalloonContentHeader = (index, name, checked = false) => {
    const checkboxId = `checkbox-add-to-route-sheet-${index}`;
    return `<div class='cluster-item-add-to-route-sheet'><input id=${checkboxId} type='checkbox' ${
      checked ? "checked" : ""
    }/><label for=${checkboxId}>${name}</label></div>`;
  };

  const addKalugaOfficeMarker = map => {
    map.geoObjects.add(
      new ymaps.Placemark(
        BEELINE_OFFICE_COORDINATES,
        {
          balloonContent: "<strong>ЦПК Калуга</strong>",
          hintContent: "ЦПК Калуга"
        },
        {
          iconColor: "#ff0000"
        }
      )
    );
  };
  function handleInitialLoading() {
    const loader = document.querySelector(".loader");
    const container = document.querySelector(".page-wrapper.container");

    loader.classList.add("hidden");
    container.classList.remove("hidden");
  }

  function init() {
    myMap = new ymaps.Map("map", {
      center: KALUGA_COORDINATES,
      zoom: 12
    });

    // Создаем собственный макет с информацией о выбранном геообъекте.
    const customItemContentLayout = ymaps.templateLayoutFactory.createClass(
      // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
      "<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>" +
        "<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>"
    );

    const customBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
      [
        "<ul class='cluster-list'>",
        // Выводим в цикле список всех геообъектов.
        "{% for geoObject in properties.geoObjects %}",
        '<li><a href=# data-placemarkid="{{ geoObject.properties.placemarkId }}" class="list_item">{{ geoObject.properties.balloonContentHeader|raw }}</a></li>',
        "{% endfor %}",
        "</ul>"
      ].join("")
    );

    $(document).on("click", ".cluster-item-add-to-route-sheet input", event => {
      const index = +getStringWithoutLetters(event.target.id);
      const geoObject = myMap.geoObjects.get(index);

      const clustererGeoObjects = myMap.geoObjects
        .get(CLUSTERER_INDEX)
        .getGeoObjects();

      const passengerGeoObject = clustererGeoObjects.find(
        clustererGeoObject => {
          const currentGeoObjectIndex = +getStringWithoutLetters(
            clustererGeoObject.properties.get("id")
          );
          return currentGeoObjectIndex === index;
        }
      );

      const isPassengerAlreadyAdded = isPassengerOnCurrentList(
        passengerGeoObject
      );

      if (
        !isPassengerAlreadyAdded &&
        routeCarPassengers.length === MAX_CAR_CAPACITY
      ) {
        event.preventDefault();
      }

      passengerGeoObject.events.fire("click");
    });

    clusterer = new ymaps.Clusterer(
      {
        /**
         * Через кластеризатор можно указать только стили кластеров,
         * стили для меток нужно назначать каждой метке отдельно.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/option.presetStorage.xml
         */
        preset: "islands#invertedVioletClusterIcons",
        /**
         * Ставим true, если хотим кластеризовать только точки с одинаковыми координатами.
         */
        groupByCoordinates: true,
        /**
         * Опции кластеров указываем в кластеризаторе с префиксом "cluster".
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ClusterPlacemark.xml
         */
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false,
        clusterHasHint: true,
        clusterOpenHintOnHover: true,
        clusterOpenEmptyHint: true,
        clusterHintContent: "123",
        // Устанавливаем собственный макет.
        clusterBalloonContentLayout: customBalloonContentLayout
      },
      { clusterHintContent: "123" }
    );

    clusterer.createCluster = function (center, geoObjects) {
      // Создаем метку-кластер с помощью стандартной реализации метода.
      let clusterPlacemark = ymaps.Clusterer.prototype.createCluster.call(
          this,
          center,
          geoObjects
        ),
        geoObjectsLength = clusterPlacemark.getGeoObjects().length,
        hintContent;

      let address = geoObjects[0].getAddressLine().split(",");
      address.shift();
      address = address.join(",");

      clusterPlacemark.properties.set("hintContent", address);
      clusterPlacemark.events.add(["click"], cluster => {
        const clusterGeoObjects = cluster.originalEvent.target.getGeoObjects();

        clusterGeoObjects.forEach(clusterGeoObject => {
          const employee = clusterGeoObject.properties.get("employee");
          const geoObjectIndex = +getStringWithoutLetters(
            clusterGeoObject.properties.get("id")
          );

          const isEmployeeSelected = routeCarPassengers.some(
            routeCarPassenger =>
              clusterGeoObject === routeCarPassenger.geoObject
          );

          clusterGeoObject.properties.set(
            "balloonContentHeader",
            getBalloonContentHeader(
              geoObjectIndex,
              getFormattedFullName(employee.fullName),
              isEmployeeSelected
            )
          );
        });
      });
      return clusterPlacemark;
    };

    addKalugaOfficeMarker(myMap);
  }

  function removeActiveClassFromMenuItems() {
    $(".nav-stacked li").removeClass("active");
  }

  function setEditorWindowHeight(editorWindow) {
    editorWindow.height(
      $(window).height() -
        $("#header-navbar").height() -
        $("#footer-bar").height() -
        200
    );
  }

  function onMarkerClicked(employeeData, carPassengers) {
    return function (event) {
      const target = event.get("target");
      const targetCoordinates = target.geometry.getCoordinates();
      this.timeSelectorModal.hide();

      if (!currentMultiRoute) {
        const routeReferencePoints = [
          BEELINE_OFFICE_ADDRESS,
          targetCoordinates
        ];

        multiRouteModel = new ymaps.multiRouter.MultiRouteModel(
          routeReferencePoints
        );
        // Создадим мульти-маршрут и добавим его на карту.
        currentMultiRoute = new ymaps.multiRouter.MultiRoute(multiRouteModel, {
          // editorDrawOver: false,
          // wayPointDraggable: true,
          // viaPointDraggable: true,
          // // Зададим собственное оформление линий мультимаршрута.
          // routeStrokeColor: "000088",
          // routeActiveStrokeColor: "ff0000",
          wayPointIconFillColor: "red",
          wayPointVisible: false,
          boundsAutoApply: false
          //iconContent: "1"
        });

        myMap.geoObjects.add(currentMultiRoute);
        target.options.set("preset", "islands#darkGreenIcon");
        const employee = addGeoObjectField(employeeData, target);
        carPassengers.push(employee);
        //target.properties.set("iconContent", routeReferencePoints.length - 1);

        setProgressWindowState();
        return;
      }

      let routeReferencePoints = multiRouteModel.getReferencePoints();

      const isPassengerAdded = isPassengerOnCurrentList(target);

      if (
        !isPassengerAdded &&
        routeReferencePoints.length === MAX_CAR_CAPACITY + 1
      ) {
        alert("нельзя добавить в одну машину больше 4 пассажиров!");
        return;
      }

      if (isPassengerAdded) {
        // // удаляем точку из маршрута
        // Ищем в массиве точек индекс той точки, на которую сейчас кликнули
        const routeReferencePointIndex = routeReferencePoints.findIndex(
          referencePoint => {
            if (!Array.isArray(referencePoint)) {
              return false;
            }

            return (
              targetCoordinates[0] === referencePoint[0] &&
              targetCoordinates[1] === referencePoint[1]
            );
          }
        );

        routeReferencePoints.splice(routeReferencePointIndex, 1);

        target.options.set("preset", "islands#blueIcon");

        // удаление из массива пассажиров
        const passengerIndex = carPassengers.findIndex(employee =>
          isSameEmployee(employee, employeeData)
        );
        carPassengers.splice(passengerIndex, 1);
        //target.properties.set("iconContent", undefined);
      } else {
        // добавляем точку в маршрут
        routeReferencePoints.push(targetCoordinates);
        target.options.set("preset", "islands#darkGreenIcon");

        const employee = addGeoObjectField(employeeData, target);
        carPassengers.push(employee);
        //target.properties.set("iconContent", routeReferencePoints.length - 1);
      }

      multiRouteModel.setReferencePoints(routeReferencePoints);

      console.log({ multiRouteModel });
      console.log(
        "multiRouteModel.getReferencePoints()",
        multiRouteModel.getReferencePoints()
      );

      setProgressWindowState();
    }.bind(this);
  }

  function setProgressWindowState() {
    const routeReferencePoints = multiRouteModel.getReferencePoints();
    this.progressWindow.css({
      display: routeReferencePoints.length > 1 ? "block" : "none"
    });
    const percentageValue = (routeReferencePoints.length - 1) * 25;
    this.chart.data("easyPieChart").update(percentageValue);
  }

  function initTooltips() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  function initPieChart(chartNode) {
    chartNode.easyPieChart({
      easing: "easeOutBounce",
      onStep: function (from, to, percent) {
        $(this.el).find(".percent").text(Math.round(percent));
      },
      barColor: "#68b3a5",
      trackColor: "#f2f2f2",
      scaleColor: false,
      lineWidth: 8,
      size: 130,
      animate: 500
    });
  }

  function hideMessageModal() {
    this.css({ display: "none" });
  }

  function showMessageModal({ title, bodyText, onClose }) {
    this.removeClass("fade");
    this.css({ display: "block" });
    const messageTitle = this.find(".modal-title");
    const messageBody = this.find(".modal-body");
    const messageHeader = this.find(".modal-header");
    const messageFooterCloseBtn = this.find(".modal-footer button");
    const messageHeaderCloseBtn = this.find(".modal-header button");

    title && messageTitle.text(title);
    messageTitle.css({ display: title ? "block" : "none" });
    title
      ? messageHeader.removeClass("no-border-bottom")
      : messageHeader.addClass("no-border-bottom");

    messageBody.text(bodyText);

    messageHeaderCloseBtn.on("click", hideMessageModal);
    messageFooterCloseBtn.on("click", () => {
      typeof onClose === "function" && onClose();
      hideMessageModal();
    });
  }

  function onDocumentReady() {
    const viewEditorBtn = $("#viewEditorBtn");
    let timeTableEditor = $("#cke_pasteTimeTableEditor");
    //const viewRouteSheetsBtn = $("#viewRouteSheets");
    let routeSheets = $("#cke_routeSheets");
    const viewTimeSelectorModalBtn = $("#viewTimeSelectorBtn");
    const timeSelectorModal = $("#timeSelectorModal");
    const showAddressesOnMapBtn = $("#send");
    const removeCurrentRouteBtn = $(".remove-route");
    const progressWindow = $(".car-fill-progress-window");
    const chart = $(".chart");
    const addToRouteSheetBtn = $("#add");
    const downloadExcelFileBtn = $("#download");
    const messageModal = $("#modal-message");

    const getKalugaAddressForGeocoding = getAddressForGeocoding.bind(
      null,
      DISTRICTS_REQUIRED_FOR_GEOCODING,
      CITY_NAME
    );

    setProgressWindowState = setProgressWindowState.bind({
      chart,
      progressWindow
    });
    onMarkerClicked = onMarkerClicked.bind({
      timeSelectorModal
    });
    showMessageModal = showMessageModal.bind(messageModal);
    hideMessageModal = hideMessageModal.bind(messageModal);

    initTooltips();
    initPieChart(chart);

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

    $("#map").height(
      $(window).height() -
        $("#header-navbar").height() -
        $("#footer-bar").height() -
        20
    );

    viewEditorBtn.bind("click", function () {
      removeActiveClassFromMenuItems();
      setItemAsActive(this);
      timeSelectorModal.hide();

      timeTableEditor =
        timeTableEditor.length === 0
          ? $("#cke_pasteTimeTableEditor")
          : timeTableEditor;
      timeTableEditor.toggle();
      routeSheets.hide();

      setEditorWindowHeight($("#cke_1_contents"));
    });

    viewTimeSelectorModalBtn.bind("click", function () {
      removeActiveClassFromMenuItems();
      setItemAsActive(this);
      timeTableEditor.hide();
      routeSheets.hide();
      timeSelectorModal.toggle();
      // $("#add-box").css({
      //   top: $("#d_option:visible").outerHeight() + 20
      // });
    });

    // viewRouteSheetsBtn.bind("click", function() {
    //   removeActiveClassFromMenuItems();
    //   setItemAsActive(this);
    //   timeTableEditor.hide();
    //   timeSelectorModal.hide();
    //
    //   setEditorWindowHeight($("#cke_2_contents"));
    //   routeSheets =
    //     routeSheets.length === 0 ? $("#cke_routeSheets") : routeSheets;
    //
    //   routeSheets.toggle();
    //   // $("#add-box").css({
    //   //   top: $("#d_option:visible").outerHeight() + 20
    //   // });
    // });

    showAddressesOnMapBtn.bind(
      "click",
      debounce(function () {
        // удаление всех маркеров с карты, чтобы не происходило наложения
        if (myMap.geoObjects.getLength() !== 0) {
          myMap.geoObjects.removeAll();
          clusterer.removeAll();
          addKalugaOfficeMarker(myMap);
          // обнуляем мулти маршрут, так он удаляется с карты при вызове myMap.geoObjects.removeAll()
          currentMultiRoute = null;
        }

        // TODO: разобраться с добавлением города или района в начало строки
        const radioButtons = $("#timeSelectorModal input[type='radio']");
        const selectedTime = getSelectedTime(radioButtons);

        // получаем все строки
        const jqRows = $("#cke_pasteTimeTableEditor iframe")
          .contents()
          .find("table > tbody > tr");

        if (!jqRows.length) {
          showMessageModal({
            bodyText:
              "Таблица с информацией по сотрудниками не скопирована или таблица некорректного формата"
          });
          return;
        }

        // фильтруем строки по времени
        const rowsByTime = Array.from(jqRows).filter(row => {
          const time = row.children[0].innerText.padStart(5, "0");

          return time === selectedTime;
        });

        if (!rowsByTime.length) {
          showMessageModal({
            bodyText: "Нет сотрудников, записанных на выбранное время"
          });
          return;
        }

        // все сотрудники для выбранного времени
        const employees = rowsByTime
          .map(row =>
            Array.from(row.querySelectorAll("td")).map(
              element => element.innerText
            )
          )
          .map(createEmployeeObject);

        // сотрудники для выбранного времени, еще не внесенные в маршрутные листы
        const notAddedEmployees = employees.filter(employee => {
          const key = getDictionaryKey(employee);

          return !routeSheetsDataSet.has(key);
        });

        if (!notAddedEmployees.length) {
          showMessageModal({
            bodyText: "На выбранное время уже сформированы маршрутные листы"
          });
          return;
        }

        const addresses = notAddedEmployees.map(getKalugaAddressForGeocoding);
        // const addressesWithoutDistrict = employees.map(
        //   employee => `г. ${CITY_NAME},  ${employee.address}`
        // );

        notAddedEmployees.forEach((employee, index) => {
          ymaps
            .geocode(addresses[index])
            .then(result => {
              const geoObject = result.geoObjects.get(0);
              geoObject.options.set("hasBalloon", false);
              geoObject.options.set("hasHint", true);
              // geoObject.properties.set(
              //   "balloonContentHeader",
              //   getFormattedFullName(employee.fullName)
              // );

              geoObject.properties.set(
                "balloonContentHeader",
                getBalloonContentHeader(
                  index,
                  getFormattedFullName(employee.fullName)
                )
              );

              geoObject.properties.set("hintContent", addresses[index]);
              geoObject.properties.set("id", `addressMark_${index}`);
              geoObject.properties.set("employee", employee);

              geoObject.events.add(
                ["click"],
                onMarkerClicked(employee, routeCarPassengers)
              );

              clusterer.add(geoObject);

              myMap.geoObjects.add(clusterer);
              // clusterer.hint.open(geoObject.geometry.getCoordinates(), "sdfds");

              // geoObject.options.set("iconColor", "black");
              // geoObject.options.set("iconOffset", [100, 100]);
            })
            .catch(e => console.error(e));
        });

        return;

        // $("#cke_2_contents iframe")
        //   .contents()
        //   .find("body")
        //   .html("");
        // var ddd = new Date().getUTCMonth();
        // ddd++;
        // time = $("input[name=time]:checked").val();
        // if ($("input[name=time]:checked").val() != "22:00") {
        //   ddate =
        //     new Date().getUTCDate() +
        //     1 +
        //     "." +
        //     ddd +
        //     "." +
        //     new Date().getUTCFullYear();
        // } else {
        //   ddate =
        //     new Date().getUTCDate() +
        //     "." +
        //     ddd +
        //     "." +
        //     new Date().getUTCFullYear();
        // }
        //
        // $("#cke_1_contents iframe")
        //   .contents()
        //   .find("body table tr")
        //   .css({
        //     "background-color": "white"
        //   });
        // waypts_length = [];
        // waypts = [];
        // calculateAndDisplayRoute(directionsService, directionsDisplay);
        // if (
        //   $("#cke_1_contents iframe")
        //     .contents()
        //     .find("body table tr:eq(2)")
        //     .html() == undefined
        // ) {
        //   $(".modal-body").html("Вы не загрузили таблицу с адресами!");
        //   $(".modal").modal();
        //   return false;
        // }
        // setMapOnAll(null);
        // markers.splice(1, markers.length - 1);
        //
        // setMapOnAll(map);
        // index =
        //   $("#cke_1_contents iframe")
        //     .contents()
        //     .find("body table tr:last")
        //     .index() + 1;
        // //console.error(index);
        // nach = 0;
        //
        // geocodeAddress(
        //   geocoder,
        //   map,
        //   $("#cke_1_contents iframe")
        //     .contents()
        //     .find("body table tr:eq(" + nach + ") td:eq(3)")
        //     .text()
        // );
        //setTimeout('geocodeAddress(geocoder, map,$("#cke_1_contents iframe").contents().find('body table tr:eq('+nach+') td:eq(0)').text())',5000);
      }, DEBOUNCE_DELAY)
    );

    removeCurrentRouteBtn.bind("click", function () {
      multiRouteModel.setReferencePoints([BEELINE_OFFICE_ADDRESS]);
      setProgressWindowState();
      const clustererGeoObjects = myMap.geoObjects
        .get(CLUSTERER_INDEX)
        .getGeoObjects();

      clustererGeoObjects.forEach(geoObject => {
        geoObject.options.set("preset", "islands#blueIcon");
      });

      routeCarPassengers.length = 0;
    });

    addToRouteSheetBtn.on("click", () => {
      if (!routeCarPassengers.length) {
        return;
      }

      routeSheetsData.push([...routeCarPassengers]);

      routeCarPassengers.forEach(passenger => {
        const key = getDictionaryKey(passenger);

        routeSheetsDataSet.add(key);
      });

      while (routeCarPassengers.length) {
        const currentMarker = routeCarPassengers[0];

        // удаление с карты точек, добавленных в маршрутный лист
        clusterer.remove(currentMarker.geoObject);
        // myMap.geoObjects.remove(currentMarker.geoObject);
        routeCarPassengers.shift();
      }

      multiRouteModel.setReferencePoints([BEELINE_OFFICE_ADDRESS]);

      console.log(
        "multiRouteModel.getReferencePoints()",
        multiRouteModel.getReferencePoints()
      );

      setProgressWindowState();
    });

    downloadExcelFileBtn.on("click", () => {
      if (!routeSheetsData.length) {
        showMessageModal({
          title: "Ошибка при выгрузке",
          bodyText:
            "Нельзя выгрузить пустые маршрутные листы. Необходимо выбрать адреса поездок."
        });
        return;
      }

      // Load a new blank workbook
      XlsxPopulate.fromBlankAsync()
        .then(workbook => {
          const tableBuilder = new TableBuilder(workbook.sheet("Sheet1"));
          tableBuilder.setColumns([
            {
              name: "A",
              width: 18
            },
            {
              name: "B",
              width: 44.14
            },
            {
              name: "C",
              width: 15.42
            }
          ]);

          let pageRowsLeft = ROWS_PER_PAGE;
          let isPageFirstBlock = true;

          routeSheetsData.forEach((routeSheetEmployees, i) => {
            if (!routeSheetEmployees.length) {
              return;
            }

            const employeesRowsCount = routeSheetEmployees.length;
            const newBlockRowsCount =
              HEADER_ROWS_COUNT +
              employeesRowsCount +
              (isPageFirstBlock ? 0 : 1);

            if (newBlockRowsCount > pageRowsLeft) {
              tableBuilder.sheetRowCursor =
                Math.round(tableBuilder.sheetRowCursor / ROWS_PER_PAGE) *
                  ROWS_PER_PAGE +
                1; //pageRowsLeft;
              isPageFirstBlock = true;
              pageRowsLeft = ROWS_PER_PAGE;
            }

            pageRowsLeft -= newBlockRowsCount;

            tableBuilder.createRouteSheetBlock({
              startRowIndex:
                tableBuilder.sheetRowCursor + (isPageFirstBlock ? 0 : 1),
              date: new Date().toLocaleDateString(),
              time: routeSheetEmployees[0].rideTime,
              employees: routeSheetEmployees,
              index: i + 1
            });

            isPageFirstBlock = false;
          });

          // Write to file.
          return workbook.outputAsync();
        })
        .then(function (blob) {
          // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          //   window.navigator.msSaveOrOpenBlob(blob, "Маршрутные листы.xlsx");
          // } else {
          const today = new Date();
          const fileName = `Маршрутные листы ${getFullDate(today)}.xlsx`;

          const url = window.URL.createObjectURL(blob);
          let a = document.createElement("a");
          document.body.appendChild(a);
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          //}
        })
        .catch(function (err) {
          alert(err.message || err);
          throw err;
        });
    });
  }
})();