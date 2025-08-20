const apiKey = "791b2762b12eda10af7136e17bd50ffe";

// DİL ÇEVİRİLERİ
const translations = {
  tr: {
    searchPlaceholder: "Şehir ara...",
    historyTitle: "Geçmiş Aramalar",
    clear: "Temizle",
    humidity: "Nem",
    wind: "Rüzgar",
    errorCity: "Lütfen bir şehir adı girin.",
    errorCityNotFound: "Şehir bulunamadı.",
    mainTitle: "5 Günlük Hava Durumu Tahmini",
    languageLabel: "Dil:"
  },
  en: {
    searchPlaceholder: "Search city...",
    historyTitle: "Search History",
    clear: "Clear",
    humidity: "Humidity",
    wind: "Wind",
    errorCity: "Please enter a city name.",
    errorCityNotFound: "City not found.",
    mainTitle: "5-Day Weather Forecast",
    languageLabel: "Language:"
  }
};

document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value.trim();
  const lang = document.getElementById("languageSelector").value;

  if (!city) {
    alert(translations[lang].errorCity);
    return;
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${lang}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=${lang}`;

  fetch(currentWeatherUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(lang === "tr" ? "Şehir bulunamadı." : "City not found.");

      }
      return response.json();
    })
    .then(currentData => {
      // ✅ Şehir geçerli olduğuna emin olduk, burada kaydediyoruz
      saveToHistory(city);

      const todayStr = new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });

      const weatherMain = currentData.weather[0].main;
      setBackgroundTheme(weatherMain);

      const todayWeather = {
        maxTemp: Math.round(currentData.main.temp_max * 10) / 10,
        minTemp: Math.round(currentData.main.temp_min * 10) / 10,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        date: todayStr,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed
      };

      return fetch(forecastUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(translations[lang].errorCityNotFound);
          }
          return response.json();
        })
        .then(forecastData => {
          const dailyData = {};

          forecastData.list.forEach(item => {
            const dateObj = new Date(item.dt * 1000);
            const dayStr = dateObj.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });

            const temp = Math.round(item.main.temp * 10) / 10;
            const humidity = item.main.humidity;
            const windSpeed = item.wind.speed;

            if (!dailyData[dayStr]) {
              dailyData[dayStr] = {
                maxTemp: temp,
                minTemp: temp,
                humiditySum: humidity,
                humidityCount: 1,
                windSum: windSpeed,
                windCount: 1,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                date: dayStr,
              };
            } else {
              if (temp > dailyData[dayStr].maxTemp) dailyData[dayStr].maxTemp = temp;
              if (temp < dailyData[dayStr].minTemp) dailyData[dayStr].minTemp = temp;
              dailyData[dayStr].humiditySum += humidity;
              dailyData[dayStr].humidityCount++;
              dailyData[dayStr].windSum += windSpeed;
              dailyData[dayStr].windCount++;
            }
          });

          for (const day in dailyData) {
            dailyData[day].humidity = Math.round(dailyData[day].humiditySum / dailyData[day].humidityCount);
            dailyData[day].windSpeed = (dailyData[day].windSum / dailyData[day].windCount).toFixed(1);
          }

          const forecastDays = Object.values(dailyData).filter(day => day.date !== todayWeather.date);
          const days = [todayWeather, ...forecastDays.slice(0, 4)];

          const weatherResults = document.getElementById("weatherResults");
          weatherResults.innerHTML = "";

          days.forEach((day, index) => {
            const card = document.createElement("div");
            card.className = "weather-card";

            card.style.animation = `fadeSlideDown 0.5s ease forwards`;
            card.style.animationDelay = `${index * 0.2}s`;

            card.innerHTML = `
              <h3>${day.date}</h3>
              <img class="weather-icon" src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="icon">
              <div class="temp">Max: ${day.maxTemp}°C<br>Min: ${day.minTemp}°C</div>
              <div class="description">${day.description}</div>
              <div class="details">
                ${translations[lang].humidity}: ${day.humidity}%<br>
                ${translations[lang].wind}: ${day.windSpeed} m/s
              </div>
            `;
           let bgColor;
            if (day.maxTemp >= 35) {
              bgColor = "#dd3838ff";
            } else if (day.maxTemp >= 30) {
              bgColor = "#ff8c42";
            } else if (day.maxTemp >= 25) {
              bgColor = "#f4d35e";
            } else if (day.maxTemp >= 15) {
              bgColor = "#90be6d";
            } else if (day.maxTemp >=0){
              bgColor = "#0591eeff";
            }  else {
              bgColor = "#0011ffff";
            }
            card.style.backgroundColor = bgColor;
            

            weatherResults.appendChild(card);
                setTimeout(() => {
                  const tempDiv = card.querySelector(".temp");
                  if (tempDiv) {
                    tempDiv.style.color = (day.maxTemp >= 30) ? "#fff" : "#000";
                  }
                }, 0);
          });
          

        });
    })
    .catch(error => {
      alert("Bir hata oluştu: " + error.message);
    });
});

document.getElementById("cityInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});

// Local Storage işlemleri
function saveToHistory(city) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  city = city.toLowerCase();

  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 10) history.pop();
    localStorage.setItem("searchHistory", JSON.stringify(history));
    updateHistoryUI();
  }
}

function updateHistoryUI() {
  const lang = document.getElementById("languageSelector").value;
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  const historyList = document.getElementById("searchHistory");

  historyList.innerHTML = "";

  history.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      document.getElementById("cityInput").value = city;
      document.getElementById("searchBtn").click();
    });
    historyList.appendChild(li);
  });
}

document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  localStorage.removeItem("searchHistory");
  updateHistoryUI();
});

// Dil seçimi değiştiğinde arayüzü güncelle
document.getElementById("languageSelector").addEventListener("change", () => {
  updateUIText();
  updateHistoryUI(); // başlığı da güncelle
});

// İlk açılışta çalıştır
updateUIText();
updateHistoryUI();

// Arayüz metinleri
function updateUIText() {
  const lang = document.getElementById("languageSelector").value;
  const t = translations[lang];

  document.getElementById("cityInput").placeholder = t.searchPlaceholder;
  document.getElementById("searchBtn").textContent = lang === "tr" ? "Ara" : "Search";
  document.getElementById("clearHistoryBtn").textContent = t.clear;

  const mainTitle = document.getElementById("mainTitle");
  if (mainTitle) mainTitle.textContent = t.mainTitle;

  const historyTitle = document.getElementById("historyTitle");
  if (historyTitle) historyTitle.textContent = t.historyTitle;

  const languageLabel = document.getElementById("languageLabel");
  if (languageLabel) languageLabel.textContent = "🌐 " + t.languageLabel;
}


function setBackgroundTheme(weatherMain) {
  const body = document.body;
  body.className = ""; // Önce tüm sınıfları kaldır
}
