(function () {
  const KALUGA_COORDINATES = [54.514533, 36.280053];

  const BEELINE_OFFICE_ADDRESS = "Московская ул., 289, Калуга";
  const BEELINE_OFFICE_COORDINATES = [54.5635089, 36.2609796];
  const CITY_NAME = "Калуга";
  const MAX_CAR_CAPACITY = 4;
  const DISTRICTS_REQUIRED_FOR_GEOCODING = [
    "Куровской",
    "Льва Толстого",
    "Мстихино",
    "с. Муратовского щебзавода",
    "Калуга-2",
    "Воротынск",
    "с. Воскресенское",
    "Анненки",
    "Резвань",
    "пос. Юбилейный",

    "д. Бабенки",
    "д. Городня",
    "д. Канищево",
    "д. Лихун",
    "Колюпаново",
    "пос. Ильинка",
    "Пучково",
    "Ромодановские дворики",
    "с. Андреевское",
    "с. Дворцы",
    "с. Плетеневка",
    "с. Росва",
    "Тихонова Пустынь"
  ];
  const CLUSTERER_INDEX = 1;
  const DEBOUNCE_DELAY = 500;
  const ROWS_PER_PAGE = 50;
  const HEADER_ROWS_COUNT = 6;

  const EMPLOYEE_FIELDS_NAMES = [
    "rideTime",
    "district",
    "fullName",
    "address",
    "phone"
  ];

  window._taxi_constants = {
    BEELINE_OFFICE_ADDRESS,
    BEELINE_OFFICE_COORDINATES,
    CITY_NAME,
    CLUSTERER_INDEX,
    DEBOUNCE_DELAY,
    DISTRICTS_REQUIRED_FOR_GEOCODING,
    EMPLOYEE_FIELDS_NAMES,
    HEADER_ROWS_COUNT,
    KALUGA_COORDINATES,
    MAX_CAR_CAPACITY,
    ROWS_PER_PAGE
  };
})(window);