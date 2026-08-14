// Check Mobile Number

export function setupCheckMobile(mobile_input) {
    mobile_input.addEventListener(`input`, () => {
        hideServerError()
        hideMobileError()
        mobile_input.value = mobile_input.value.replace(/\D/g, "");
    })

}
export function validateMobile(mobile_number) {
    
    if (mobile_number.length !== 10 ) {
        showMobileError(`Invalid Mobile Number`)
        return false;
    }
    return true;
}

// Toggle Password

export function togglePassword(password_input,toggle_password) 
{
    password_input.addEventListener(`input`, hideServerError)
    toggle_password.addEventListener(`click`,()=>{
        if (password_input.type === `password`) {
        password_input.type = `text`;
        toggle_password.src = "../assets/icons/icon-hide_password.png"
    }
    else {
        toggle_password.src = "../assets/icons/icon-show_password.png"
        password_input.type = `password`;
    }
    })

}


// Show Hide Error Functions

export function showMobileError(message) {
    const errorBox = document.getElementById(`formMobileError`);
    errorBox.textContent = message;
    errorBox.style.display = `block`;
}

export function hideMobileError() {
    const errorBox = document.getElementById(`formMobileError`);
    errorBox.textContent = ""
    errorBox.style.display = `none`;
}

export function showPasswordError(message) {
    const errorBox = document.getElementById(`formPasswordError`);
    errorBox.textContent = message;
    errorBox.style.display = `block`;
}
export function hidePasswordError() {
    const errorBox = document.getElementById(`formPasswordError`);
    errorBox.textContent = ""
    errorBox.style.display = `none`;
}

export function serverError(message) {
    const errorBox = document.getElementById(`formCheckError`);
    errorBox.textContent = message;
    errorBox.style.display = `block`;
}
export function hideServerError() {
    const errorBox = document.getElementById(`formCheckError`);
    errorBox.textContent = ""
    errorBox.style.display = `none`;
}

export function showConfirmPasswordError(message) {
    const errorBox = document.getElementById(`formConfirmPasswordError`);
    errorBox.textContent = message;
    errorBox.style.display = `block`;
}
export function hideConfirmPasswordError() {
    const errorBox = document.getElementById(`formConfirmPasswordError`);
    errorBox.textContent = ""
    errorBox.style.display = `none`;
}