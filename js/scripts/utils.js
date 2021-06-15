import { EMPLOYEE_FIELDS_NAMES } from "./constants";

export function getAddressAndPhone(addressAndPhoneText) {
  const phoneStartIndex = addressAndPhoneText.indexOf("+7");

  let address =
    phoneStartIndex !== -1
      ? addressAndPhoneText.slice(0, phoneStartIndex)
      : addressAndPhoneText;
  const lastCommaIndex = address.lastIndexOf(",");
  address = lastCommaIndex !== -1 ? address.slice(0, lastCommaIndex) : address;

  const phone =
    phoneStartIndex !== -1 ? addressAndPhoneText.slice(phoneStartIndex) : "";

  return {
    address,
    phone
  };
}

export function createEmployeeObject(employeeDataArray) {
  const { address, phone } = getAddressAndPhone(employeeDataArray[3]);

  return {
    rideTime: employeeDataArray[0],
    district: employeeDataArray[1],
    fullName: employeeDataArray[2],
    address,
    phone
  };
}

export function isSameEmployee(employee1, employee2) {
  return EMPLOYEE_FIELDS_NAMES.every(key => employee1[key] === employee2[key]);
}

export function getDictionaryKey(employee) {
  return EMPLOYEE_FIELDS_NAMES.reduce(
    (accumulator, fieldName) => accumulator + employee[fieldName],
    ""
  );
}

export function getFormattedFullName(fullName) {
  console.log("fullName", fullName);
  const [lastName, firstName, patronymic] = fullName.split(" ");
  return `${lastName} ${firstName[0]}. ${
    patronymic ? `${patronymic[0]}.` : ""
  }`;
}

export function addGeoObjectField(employee, geoObject) {
  return {
    ...employee,
    geoObject
  };
}

export function setItemAsActive(item) {
  $(item).parent("li").addClass("active");
}

export function getSelectedTime(jqRadioButtons) {
  const radionButtons = Array.from(jqRadioButtons);
  const selectedRadionButton = radionButtons.find(button => button.checked);

  return selectedRadionButton ? selectedRadionButton.value : null;
}

export function getAddressForGeocoding(
  districtsRequiredForGeocoding,
  cityName,
  employee
) {
  const shouldSpecifyDistrict = districtsRequiredForGeocoding.some(district =>
    employee.district.toLowerCase().includes(district.toLowerCase())
  );
  if (shouldSpecifyDistrict) {
    return `г. ${cityName}, ${employee.district},  ${employee.address}`;
  }

  return `г. ${cityName},  ${employee.address}`;
}

export function getStringWithoutLetters(str) {
  return str.replace(/\D/g, "");
}

/**
 * @param date - объект даты, который возвращает new Date(), со значением по умолчанию new Date()
 */
export function getFullDate(date = new Date()) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

//   window._taxi_utils = {
//     addGeoObjectField,
//     createEmployeeObject,
//     getAddressAndPhone,
//     getAddressForGeocoding,
//     getDictionaryKey,
//     getFormattedFullName,
//     getFullDate,
//     getSelectedTime,
//     getStringWithoutLetters,
//     isSameEmployee,
//     setItemAsActive
//   };
// })(window);
