const weatherTemp = document.getElementById(`weather-temp`)
const weatherType = document.getElementById(`weather-type`)

export async function loadWeatherCard(){
    const response = await fetch(`/api/weather`,{
        method:'GET'
    })
    const data = await response.json();
    const tempLucknow = data.main.temp.toFixed(0);
    const tempType = data.weather.description;
    weatherTemp.innerHTML = `${tempLucknow}°`
    weatherType.textContent = tempType.toUpperCase();
}