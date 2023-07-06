function getWeekday(date) {
  let dayIndex = date.getDay();
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let day = days[dayIndex];
  return day;
}
function formatDate(date) {
  let hours = date.getHours();
  if (hours < 10) {
    hours = `0${hours}`;
  }
  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  const day = getWeekday(date);

  return `${day} ${hours}:${minutes}`;
}

function dateFromUTC(dt) {
  return new Date(dt * 1000);
}

let dateElement = document.querySelector("#date");
let currentTime = new Date();
dateElement.innerHTML = formatDate(currentTime);

let weatherBlock = document.querySelector("#weather-info");

let unitsBlock = document.querySelector("#units");
unitsBlock.addEventListener("click", changeUnits);

let currentUnits = "metric";
let curretCity = "";

function search(event) {
  event.preventDefault();
  curretCity = document.querySelector("#city-input").value;
  fetchWeather(curretCity);
}
let searchForm = document.querySelector("#search-form");
searchForm.addEventListener("submit", search);

function fetchWeather(city, units = "metric") {
  let key = "57a05799ccd29f7c03a8c77711ff235c";
  axios
    .get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${key}`
    )
    .then(({ data }) => {
      const { lat, lon, name } = data[0];
      axios
        .get(
          `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key}&units=${units}`
        )
        .then((response) => displayWeather(response, name));
    });
}

function displayWeather(response, city) {
  const daily = response.data.daily;
  const today = daily[0];

  const { icon, description } = today.weather[0];
  let weatherSpan = document.querySelector("#temp");
  let temperature = Math.round(today.temp.day);
  weatherSpan.innerHTML = `${temperature}`;

  let cityElement = document.querySelector("#city");
  cityElement.innerHTML = city;

  let weatherIcon = document.querySelector("#weather-icon");
  weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  let weatherDesc = document.querySelector("#description");
  weatherDesc.innerHTML = description;

  let humidity = document.querySelector("#humidity");
  humidity.innerHTML = today.humidity;
  let wind = document.querySelector("#wind");
  wind.innerHTML = `${today.wind_speed} ${
    currentUnits === "metric" ? "meter/sec" : "miles/hour"
  }`;

  let forecast = document.querySelector("#forecast");
  forecast.innerHTML = "";
  const week = daily.slice(1);
  week.forEach((day) => {
    const { icon } = day.weather[0];
    const template = `<div class="d-flex flex-column ">
        <div class="text-center text-primary">${getWeekday(
          dateFromUTC(day.dt)
        )}</div>
        <img src="${`https://openweathermap.org/img/wn/${icon}@2x.png`}"/>
        <div class="hstack gap-3 justify-content-center">
          <span class="text-primary-emphasis">${Math.round(
            day.temp.min
          )}°</span>
          <span class="text-primary-emphasis">${Math.round(
            day.temp.max
          )}°</span>
        </div>
    </div>
   `;

    forecast.innerHTML = forecast.innerHTML + template;
  });

  weatherBlock.classList.remove("d-none");
}

function changeUnits(event) {
  if (
    !event.target.dataset["units"] ||
    currentUnits === event.target.dataset["units"]
  ) {
    return;
  }
  currentUnits = event.target.dataset["units"];

  fetchWeather(curretCity, currentUnits);

  Array.from(unitsBlock.children).forEach((ch) =>
    ch.classList.toggle("active-unit")
  );
}
