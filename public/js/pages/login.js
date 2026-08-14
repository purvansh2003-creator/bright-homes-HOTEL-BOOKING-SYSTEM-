
import * as formUtils from "../utils/form_util.js"

const mobile_input = document.getElementById(`mobile-no`);

formUtils.setupCheckMobile(mobile_input)

// Toggle Password

const toggle_password = document.getElementById(`togglePassword`)
const password_input = document.getElementById(`password`)
formUtils.togglePassword(password_input,toggle_password)

function validateMobile() {
    const mobile_number = mobile_input.value;
    if (mobile_number.length !== 10 || mobile_number.length > 10) {
        formUtils.showMobileError(`Invalid Mobile Number`)
        return false;
    }
    return true;
}

// Submitting and Validating from server

const submit_input = document.getElementById(`loginForm`)
submit_input.addEventListener("submit", async (event) => {
    const mobileValid = validateMobile();
    if (!mobileValid) {
        event.preventDefault();
        return;
    }
    event.preventDefault();

    const mobile_number_value = mobile_input.value;
    const password_value = password_input.value;
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            mobile_number_value,
            password_value
        })
    })
    const data = await response.json()

    if (data.success) {
        window.location.href = `/dashboard`
    }
    else {
        formUtils.serverError(data.message)
    }
})


// Capslock Status
password_input.addEventListener(`keydown`,checkCapslock)
 function checkCapslock(event) {
    const check = event.getModifierState(`CapsLock`);
    if (check) {
        formUtils.showPasswordError(`Capslock Key is On !`);
    }
    else {
        formUtils.hidePasswordError();
    }

}



