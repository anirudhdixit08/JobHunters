import validator from "validator";

export const userValidator = (data) => {
  const mandatoryFields = ["firstName", "emailId", "password","phoneNumber"];

  const isAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));
  if (!isAllowed) {
    throw new Error("First name, email and password is mandatory!");
  }
  if (!validator.isEmail(data.emailId)) {
    throw new Error("Invalid Email!");
  }
  if (
    !validator.isStrongPassword(data.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol."
    );
  }
};
