function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  
  function injectHTML(list) {
    console.log("fired injectHTML");
    const target = document.querySelector("#location");
    target.innerHTML = "";
    list.forEach((item, index) => {
      const str = `<li>${item.properties.place}</li>`;
      console.log(str)
      target.innerHTML += str;
    });
  }

  function filterList(list, query) {
    return list.filter((item) => {
      const lowerCaseName = item.properties.place.toLowerCase();
      const lowerCaseQuery = query.toLowerCase();
      return lowerCaseName.includes(lowerCaseQuery);
    });
  }
  
  function cutEarthquakeList(list) {
    console.log("fired cut list");
    const range = [...Array(15).keys()];
    return (newArray = range.map((item) => {
      const index = getRandomIntInclusive(0, list.length - 1);
      return list[index];
    }));
  }
  
  function initMap() {
    const carto = L.map('map').setView([38.98, -76.93], 1);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(carto);
    return carto;
  }

  function markerPlace(array, map) {
    console.log('array for markers', array);

    map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
    });

    array.forEach((item) => {
        console.log('markerPlace', item);
        const {coordinates} = item.geometry;

        L.marker([coordinates[1], coordinates[0]]).addTo(map);
    })
  }

  async function mainEvent() {
    const mainForm = document.querySelector(".main_form");
    const loadDataButton = document.querySelector("#data_load");
    const clearDataButton = document.querySelector("#data_clear");
    const generateListButton = document.querySelector("#generate");
    const textField = document.querySelector("#resto");
  
    const loadAnimation = document.querySelector("#data_load_animation");
    loadAnimation.style.display = "none";
    generateListButton.classList.add("hidden");

    const carto = initMap();
  
    const storedData = localStorage.getItem('storedData');
    let parsedData = JSON.parse(storedData);
    if (parsedData?.length > 0) {
      generateListButton.classList.remove("hidden");
    }

    let currentList = [];
  
    loadDataButton.addEventListener("click", async (submitEvent) => {
      console.log("loading data");
      loadAnimation.style.display = "inline-block";
  
      const results = await fetch(
        "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-01-01&endtime=2020-01-02"
      );
    
      const storedList = await results.json();
      console.log(storedList)
      localStorage.setItem('storedData', JSON.stringify(storedList));
      parsedData = storedList.features;
      console.log(parsedData)

      console.log(parsedData.length)

      if (parsedData?.length > 0) {
        generateListButton.classList.remove("hidden");
        console.log("test");
      }
  
      loadAnimation.style.display = "none";
    });
  
    generateListButton.addEventListener("click", (event) => {
      console.log("generate new list");
      currentList = cutEarthquakeList(parsedData);
      console.log(currentList);
      injectHTML(currentList);
      markerPlace(currentList, carto);
    });

    textField.addEventListener("input", (event) => {
        console.log("input", event.target.value);
        const newList = filterList(currentList, event.target.value);
        console.log(newList);
        injectHTML(newList);
        markerPlace(newList, carto);
    });

    clearDataButton.addEventListener("click", (event) => {
        console.log('clear browser data');
        localStorage.clear();
        console.log('localStorage Check', localStorage.getItem("storedData"));
    })
  }
  
  document.addEventListener("DOMContentLoaded", async () => mainEvent());