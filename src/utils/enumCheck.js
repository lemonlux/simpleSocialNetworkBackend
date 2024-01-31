const genderEnum = require("../data/genderEnum");
const privacyEnum = require("../data/privacyEnum");

const enumCheck = (type, value) => {
  let acc
  console.log(value)
  //type es por donde va a entrar, y value el valor que queramos comprobar si esta en el array
  switch (type) {
    case "gender":
      if (genderEnum.includes(value)) {
        return { check: true, value };
      } else return { check: false };

    // case "role":
    //   if (genderEnum.includes(value)) {
    //     return { check: true, value };
    //   } else return { check: false };

    case "privacy":
      if (privacyEnum.includes(value)) {
        return { check: true, value };
      } else return { check: false };


    default:
      break;
  }
};

module.exports = enumCheck;
