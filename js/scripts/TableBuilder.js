// const { getFormattedFullName } = window._taxi_utils;
import { getFormattedFullName } from "./utils";
export default class TableBuilder {
  constructor(excelSheet) {
    this.sheet = excelSheet;
    this.sheetRowCursor = 1;
  }

  setColumns(columnsDescriptions) {
    columnsDescriptions.forEach((columnDescription) => {
      const { name, width } = columnDescription;
      this.sheet.column(name).width(width);
    });
  }

  createRow(rowIndex, cellsData, cellsStyles = []) {
    let currentCell = this.sheet.row(rowIndex).cell(1);
    cellsData.forEach((cellData, index) => {
      const { value, colSpan } = cellData;
      const cellStyles = Object.assign({ border: true }, cellsStyles[index]);

      if (colSpan) {
        currentCell = currentCell
          .rangeTo(currentCell.relativeCell(0, colSpan - 1))
          .merged(true)
          .value(value)
          .style(cellStyles)
          .endCell()
          .relativeCell(0, 1);
        return;
      }

      currentCell = currentCell
        .value(value)
        .style(cellStyles)
        .relativeCell(0, 1);
    });
    return currentCell;
  }

  createRouteSheetBlock({
    startRowIndex,
    date,
    time,
    employees,
    employeeOnDutyPhoneNumber,
    index,
  }) {
    this.createRow(
      startRowIndex,
      [{ value: `Маршрутный лист "БИЛАЙН" №${index}`, colSpan: 4 }],
      [{ bold: true, fill: "d3d3d3", horizontalAlignment: "center" }]
    );
    this.createRow(
      ++startRowIndex,
      [
        { value: "Дата исполнения заказа:", colSpan: 2 },
        { value: date, colSpan: 2 },
      ],
      [{ bold: true }]
    );
    this.createRow(
      ++startRowIndex,
      [
        { value: "Время посадки:", colSpan: 2 },
        { value: time, colSpan: 2 },
      ],
      [{ bold: true }]
    );
    this.createRow(
      ++startRowIndex,
      [
        { value: "Номер телефона дежурного:", colSpan: 2 },
        { value: employeeOnDutyPhoneNumber, colSpan: 2 },
      ],
      [{ bold: true }]
    );
    this.createRow(
      ++startRowIndex,
      [
        { value: "Номер заказа:", colSpan: 2 },
        { value: "", colSpan: 2 },
      ],
      [{ bold: true }]
    );
    this.createRow(
      ++startRowIndex,
      [{ value: "ФИО" }, { value: "Улица" }, { value: "Район", colSpan: 2 }],
      [
        { bold: true, fill: "d3d3d3", horizontalAlignment: "center" },
        { bold: true, fill: "d3d3d3", horizontalAlignment: "center" },
        { bold: true, fill: "d3d3d3", horizontalAlignment: "center" },
      ]
    );

    employees.forEach((employee) => {
      const rowNumber = this.createRow(++startRowIndex, [
        { value: getFormattedFullName(employee.fullName) },
        { value: `${employee.address}, ${employee.phone}` },
        { value: employee.district, colSpan: 2 },
      ]).rowNumber();

      this.sheetRowCursor = rowNumber + 1;
    });
  }
}
