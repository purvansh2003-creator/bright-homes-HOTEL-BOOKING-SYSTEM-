import * as formUtils from "../utils/form_util.js"

const name_input = document.getElementById("Name")
const mobile_input = document.getElementById(`mobile-no`);
const email_input = document.getElementById("email")

const toggle_password = document.getElementById(`toggleRegisterPassword`)
const password_input = document.getElementById(`registerPassword`)

const toggle_password_confirm = document.getElementById(`toggleConfirmPassword`)
const password_input_confirm = document.getElementById(`confirmPassword`)

formUtils.setupCheckMobile(mobile_input)

formUtils.togglePassword(password_input, toggle_password)
formUtils.togglePassword(password_input_confirm, toggle_password_confirm)

password_input_confirm.addEventListener('input',formUtils.hideConfirmPasswordError)

function comparePassword() {
    if (password_input.value !== password_input_confirm.value) {
        formUtils.showConfirmPasswordError(`Password doesn't match`)
       return false;
    }
    return true;
}

const register_input = document.getElementById(`registerForm`)
register_input.addEventListener(`submit`, async (event) => {

    event.preventDefault(); 
    if(!comparePassword()){ return; };

    const name_value = name_input.value;
    const mobile_number_value = mobile_input.value;
    const email_value = email_input.value;
    const password_value = password_input.value;

    const response = await fetch(`/register`,{
        method:"POST",
        headers:{
            "Content-Type" : "application/json"
        },
        body:JSON.stringify({
           name_value,
           mobile_number_value,
           email_value,
           password_value 
        })
    })
    const data = await response.json()
    if(response.status === 409)    
    {
        formUtils.serverError(data.message)
    }
    else
    {
        alert('Registration Successful')
    }
})





