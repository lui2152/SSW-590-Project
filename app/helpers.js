const { ObjectId } = require("mongodb");

function validateString(str,parameter) {
    if (!str || str === undefined) {
        throw new Error(`Error: ${parameter} needed`);
    }

    if (typeof str !== "string") {
        throw new Error(`Error: ${parameter} must be a string`);
    }

    if (str.trim().length === 0) {
        throw new Error(`Error: ${parameter} cannot be an empty or with only spaces`);
    }

    return str.trim();
}

function validateObjectId(id, parameter) {
    id = validateString(id,parameter);
    if (!ObjectId.isValid(id)) {
        throw new Error(`Error: ${parameter} must be a string is not a valid ObjectId`);
    }
    return id;
}

function validateUsername(str,parameter) {
    str = validateString(str,parameter);

    // A-Z: 65 to 90
    // a-z: 97 to 122
    // 0-9: 48 to 57
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);

        if (!(charCode >= 65 && charCode <= 90) && !(charCode >= 97 && charCode <= 122) && !(charCode >= 48 && charCode <= 57)) {
            throw new Error("Error: Username should only contain letters or positive whole numbers");
        }
    }

    // minimum length = 5 characters, maximum length = 10 characters
    if ((str.length < 5) || (str.length > 10)) {
        throw new Error("Username must have at minimum of 5 characters and a maximum of 10 characters");
    }

    // return as lowercase version to store in database 
    return str.toLowerCase();
}

function validatePassword(str) {
    str = validateString(str,"Password");
    if (!str) {
        throw new Error(`Password needed`);
    }
    if (typeof str !== "string") {
        throw new Error(`Password must be a string`);
    }
    if (str.length === 0) {
        throw new Error(`Password cannot be an empty string or with only spaces`);
    }

    // check if contains a space
    if (str.includes(" ")) {
        throw new Error("Password can not contain spaces, but can include any other character, including special characters");
    }

    // minimum length = 8 characters
    if (str.length < 8 || str.length > 25) {
        throw new Error("Password must have at least 8 characters (max of 25 characters)");
    }

    // constraints: at least one uppercase character, at least one number, at least one special character
    let hasUpper = /[A-Z]/.test(str);
    let hasNumber = /[0-9]/.test(str);
    let hasSpecial = /[^a-zA-Z0-9 ]/.test(str); // special character is defined as anything that is not a number, letter, or space

    if (!hasUpper || !hasNumber || !hasSpecial) {
        throw new Error("Password must contain at least one uppercase character, at least one number, at least one special character (special character is defined as anything that is not a number, letter, or space)");
    }

    return str;
}

module.exports = {
    validateString,
    validateObjectId,
    validateUsername,
    validatePassword
};