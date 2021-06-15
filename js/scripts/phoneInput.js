const handleValidityState = ({
  errorHelpText,
  formGroup,
  icon,
  touched,
  validity,
  isForced = false,
}) => {
  const modal = document.querySelector(".modal-dialog");

  if ((touched || isForced) && (!validity.valid || validity.valueMissing)) {
    formGroup.classList.remove("has-success");
    formGroup.classList.add("has-error");

    icon.classList.remove("glyphicon-ok");
    icon.classList.add("glyphicon-remove");

    errorHelpText.innerText = validity.valueMissing
      ? "Телефон обязателен для заполнения"
      : "Введите телефон в формате +7-999-999-99-99";

    modal.dispatchEvent(
      new CustomEvent("phoneValidationResult", { detail: { isValid: false } })
    );
  } else {
    formGroup.classList.remove("has-error");
    formGroup.classList.add("has-success");

    icon.classList.add("glyphicon-ok");
    icon.classList.remove("glyphicon-remove");
    errorHelpText.innerText = "";

    modal.dispatchEvent(
      new CustomEvent("phoneValidationResult", { detail: { isValid: true } })
    );
  }
};

export const getPhoneInputFormGroupElement = (globalState) => {
  let touched = false;
  const formGroup = document.createElement("div");
  formGroup.classList.add("form-group", "has-feedback");

  const icon = document.createElement("span");
  icon.classList.add("glyphicon", "glyphicon-remove", "form-control-feedback");

  const errorHelpText = document.createElement("div");
  errorHelpText.classList.add("phone-error-text", "text-danger");

  const input = document.createElement("input");
  input.autofocus = true;
  input.type = "tel";
  input.pattern = "^((\\+7)|8)-[0-9]{3}-[0-9]{3}-[0-9]{2}-[0-9]{2}$";
  input.title = "Введите телефон в формате +7-999-999-99-99";
  input.required = true;

  input.classList.add("form-control");

  new Cleave(input, {
    blocks: [2, 3, 3, 2, 2],
    prefix: "+7",
    numericOnly: true,
    delimiter: "-",
  });

  const handleInput = (e) => {
    globalState.employeeOnDutyPhoneNumber = e.target.value;

    handleValidityState({
      errorHelpText,
      formGroup,
      icon,
      touched,
      validity: e.target.validity,
    });
  };

  const handleBlur = (e) => {
    touched = true;

    handleValidityState({
      errorHelpText,
      formGroup,
      icon,
      touched,
      validity: e.target.validity,
    });
  };

  const handleRunPhoneValidation = (e) => {
    touched = true;

    handleValidityState({
      errorHelpText,
      formGroup,
      icon,
      touched,
      validity: e.target.validity,
      isForced: true,
    });
  };

  input.addEventListener("input", handleInput);

  input.addEventListener("blur", handleBlur);

  input.addEventListener("runPhoneValidation", handleRunPhoneValidation);

  formGroup.appendChild(input);
  formGroup.appendChild(icon);
  formGroup.appendChild(errorHelpText);

  return formGroup;
};
