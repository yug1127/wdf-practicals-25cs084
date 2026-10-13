const form = document.getElementById("registrationForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const mobileInput = document.getElementById("mobile");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const courseInput = document.getElementById("course");
const yearInput = document.getElementById("year");
const termsInput = document.getElementById("terms");

const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

const successMessage = document.getElementById("successMessage");

const nameRegex = /^[A-Za-z ]{3,50}$/;

const emailRegex =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const mobileRegex = /^[0-9]{10}$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


function showError(input, errorId, message) {

    const errorElement = document.getElementById(errorId);

    errorElement.textContent = message;

    input.classList.add("input-error");
    input.classList.remove("input-valid");
}


function showSuccess(input, errorId) {

    const errorElement = document.getElementById(errorId);

    errorElement.textContent = "";

    input.classList.remove("input-error");
    input.classList.add("input-valid");
}


function clearValidation(input, errorId) {

    const errorElement = document.getElementById(errorId);

    errorElement.textContent = "";

    input.classList.remove("input-error");
    input.classList.remove("input-valid");
}


function validateName() {

    const name = nameInput.value.trim();

    if (name === "") {

        showError(
            nameInput,
            "nameError",
            "Name is required."
        );

        return false;
    }


    if (!nameRegex.test(name)) {

        showError(
            nameInput,
            "nameError",
            "Name must contain only letters and spaces (minimum 3 characters)."
        );

        return false;
    }


    showSuccess(nameInput, "nameError");

    return true;
}


function validateEmail() {

    const email = emailInput.value.trim();

    if (email === "") {

        showError(
            emailInput,
            "emailError",
            "Email is required."
        );

        return false;
    }


    if (!emailRegex.test(email)) {

        showError(
            emailInput,
            "emailError",
            "Please enter a valid email address."
        );

        return false;
    }


    showSuccess(emailInput, "emailError");

    return true;
}


function validateMobile() {

    const mobile = mobileInput.value.trim();

    if (mobile === "") {

        showError(
            mobileInput,
            "mobileError",
            "Mobile number is required."
        );

        return false;
    }


    if (!mobileRegex.test(mobile)) {

        showError(
            mobileInput,
            "mobileError",
            "Mobile number must contain exactly 10 digits."
        );

        return false;
    }


    showSuccess(mobileInput, "mobileError");

    return true;
}


function validatePassword() {

    const password = passwordInput.value;

    if (password === "") {

        showError(
            passwordInput,
            "passwordError",
            "Password is required."
        );

        return false;
    }


    if (!passwordRegex.test(password)) {

        showError(
            passwordInput,
            "passwordError",
            "Password must contain uppercase, lowercase, number, special character and be at least 8 characters long."
        );

        return false;
    }


    showSuccess(passwordInput, "passwordError");

    return true;
}


function validateConfirmPassword() {

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword === "") {

        showError(
            confirmPasswordInput,
            "confirmPasswordError",
            "Please confirm your password."
        );

        return false;
    }


    if (password !== confirmPassword) {

        showError(
            confirmPasswordInput,
            "confirmPasswordError",
            "Passwords do not match."
        );

        return false;
    }


    showSuccess(
        confirmPasswordInput,
        "confirmPasswordError"
    );

    return true;
}

function validateCourse() {

    if (courseInput.value === "") {

        showError(
            courseInput,
            "courseError",
            "Please select your course."
        );

        return false;
    }


    showSuccess(courseInput, "courseError");

    return true;
}

function validateYear() {

    if (yearInput.value === "") {

        showError(
            yearInput,
            "yearError",
            "Please select your year."
        );

        return false;
    }


    showSuccess(yearInput, "yearError");

    return true;
}

function validateGender() {

    const gender =
        document.querySelector('input[name="gender"]:checked');

    const genderError =
        document.getElementById("genderError");


    if (!gender) {

        genderError.textContent =
            "Please select your gender.";

        return false;
    }


    genderError.textContent = "";

    return true;
}


function validateTerms() {

    const termsError =
        document.getElementById("termsError");


    if (!termsInput.checked) {

        termsError.textContent =
            "You must agree to the Terms and Conditions.";

        return false;
    }


    termsError.textContent = "";

    return true;
}

function checkPasswordStrength() {

    const password = passwordInput.value;

    let strength = 0;


    if (password.length >= 8) {
        strength++;
    }


    if (/[a-z]/.test(password)) {
        strength++;
    }


    if (/[A-Z]/.test(password)) {
        strength++;
    }


    if (/[0-9]/.test(password)) {
        strength++;
    }


    if (/[@$!%*?&]/.test(password)) {
        strength++;
    }


    if (password.length === 0) {

        strengthBar.style.width = "0%";

        strengthText.textContent =
            "Password strength: Not entered";

        return;
    }


    if (strength <= 2) {

        strengthBar.style.width = "33%";

        strengthText.textContent =
            "Password strength: Weak";

    }
    else if (strength <= 4) {

        strengthBar.style.width = "66%";

        strengthText.textContent =
            "Password strength: Medium";

    }
    else {

        strengthBar.style.width = "100%";

        strengthText.textContent =
            "Password strength: Strong";
    }
}


passwordInput.addEventListener(
    "input",
    checkPasswordStrength
);


nameInput.addEventListener(
    "blur",
    validateName
);


emailInput.addEventListener(
    "blur",
    validateEmail
);


mobileInput.addEventListener(
    "blur",
    validateMobile
);


passwordInput.addEventListener(
    "blur",
    validatePassword
);


confirmPasswordInput.addEventListener(
    "blur",
    validateConfirmPassword
);


courseInput.addEventListener(
    "change",
    validateCourse
);


yearInput.addEventListener(
    "change",
    validateYear
);


form.addEventListener("submit", function(event) {

    event.preventDefault();

    const isNameValid = validateName();

    const isEmailValid = validateEmail();

    const isMobileValid = validateMobile();

    const isPasswordValid = validatePassword();

    const isConfirmPasswordValid =
        validateConfirmPassword();

    const isCourseValid = validateCourse();

    const isYearValid = validateYear();

    const isGenderValid = validateGender();

    const isTermsValid = validateTerms();

    if (
        isNameValid &&
        isEmailValid &&
        isMobileValid &&
        isPasswordValid &&
        isConfirmPasswordValid &&
        isCourseValid &&
        isYearValid &&
        isGenderValid &&
        isTermsValid
    ) {

        successMessage.style.display = "block";

        successMessage.textContent =
            "Registration successful! All details are valid.";

        successMessage.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
    else {

        successMessage.style.display = "none";
        if (!isNameValid) {
            nameInput.focus();
        }
        else if (!isEmailValid) {
            emailInput.focus();
        }
        else if (!isMobileValid) {
            mobileInput.focus();
        }
        else if (!isPasswordValid) {
            passwordInput.focus();
        }
        else if (!isConfirmPasswordValid) {
            confirmPasswordInput.focus();
        }
        else if (!isCourseValid) {
            courseInput.focus();
        }
        else if (!isYearValid) {
            yearInput.focus();
        }
    }

});


form.addEventListener("reset", function() {
    setTimeout(function() {
        clearValidation(nameInput, "nameError");
        clearValidation(emailInput, "emailError");
        clearValidation(mobileInput, "mobileError");
        clearValidation(passwordInput, "passwordError");
        clearValidation(
            confirmPasswordInput,
            "confirmPasswordError"
        );
        clearValidation(courseInput, "courseError");
        clearValidation(yearInput, "yearError");


        document.getElementById(
            "genderError"
        ).textContent = "";


        document.getElementById(
            "termsError"
        ).textContent = "";

        strengthBar.style.width = "0%";

        strengthText.textContent =
            "Password strength: Not entered";

        successMessage.style.display = "none";

    }, 0);

});
