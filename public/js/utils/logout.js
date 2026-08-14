
export function logout(){
const logout = document.getElementById('logoutButton')

logout.addEventListener(`click`,async()=>{
    const response = await fetch('/logout',{
        method:'POST'
    })


const data = await response.json();

if(data.success)
{
    window.location.href = '/login'
}
})}