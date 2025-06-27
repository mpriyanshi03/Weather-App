const apiKey="2f3a23e13a314aa8b282813d6897f5d6";
const apiUrl="https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const geoUrl="https://api.openweathermap.org/geo/1.0/direct?q="


const searchBox=document.querySelector(".search input");
const searchBtn=document.querySelector(".search button");
const weatherIcon=document.querySelector(".weather-icon");
const suggestionEl=document.querySelector(".suggestions");

async function checkWeather(city) {
    const response=await fetch (apiUrl + city + `&appid=${apiKey}`)

    if(response.status===404){
        document.querySelector(".error").style.display="block";
        document.querySelector(".weather").style.display="none";
    }else{
        const data=await response.json();

        document.querySelector(".city").innerHTML=data.name;
        document.querySelector(".temp").innerHTML=Math.round(data.main.temp)+"°C";
        document.querySelector(".humidity").innerHTML=data.main.humidity+"%";
        document.querySelector(".wind").innerHTML=data.wind.speed+" km/h";

        if(data.weather[0].main==="Clouds"){
            weatherIcon.src="/img/images/clouds.png"
        }
        else if(data.weather[0].main==="Clear"){
            weatherIcon.src="/img/images/clear.png"
        }
        else if(data.weather[0].main==="Drizzle"){
            weatherIcon.src="/img/images/drizzle.png"
        }
        else if(data.weather[0].main==="Mist"){
            weatherIcon.src="/img/images/mist.png"
        }
        else if(data.weather[0].main==="Rain"){
            weatherIcon.src="/img/images/rain.png"
        }

        document.querySelector(".weather").style.display="Block";
        document.querySelector(".error").style.display="none";
    }
}


searchBox.addEventListener("input", async () =>{
    const query=searchBox.value.trim();

    if(query.length<2){
        suggestionEl.innerHTML="";
        return;
    }

    const response= await fetch(`${geoUrl}${query}&limit=6&appid=${apiKey}`);

    const data=await response.json();

    suggestionEl.innerHTML="";

     data.forEach(city =>{
        const div=document.createElement("div");
        div.classList.add("suggestion");
        div.innerHTML=`${city.name}, ${city.country}`;
        div.addEventListener("click", () =>{
            searchBox.value=city.name;
            checkWeather(city.name);
            suggestionEl.innerHTML="";
        });
        suggestionEl.appendChild(div);
    }) ;
});

searchBtn.addEventListener("click", () =>{
    checkWeather(searchBox.value);
    suggestionEl.innerHTML="";
});
searchBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        checkWeather(searchBox.value);
        suggestionEl.innerHTML="";
    }
});


