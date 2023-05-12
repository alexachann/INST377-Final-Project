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
      const str = `<li>${item.properties.title}</li>`;
      console.log(str)
      target.innerHTML += str
    });
  }

  function filterList(list, query) {
    return list.filter((item) => {
      const lowerCaseName = item.properties.title.toLowerCase();
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
    const refreshDataButton = document.querySelector("#data_refresh");
    const textField = document.querySelector("#resto");
  
    const loadAnimation = document.querySelector("#data_load_animation");
    loadAnimation.style.display = "none";
    refreshDataButton.classList.add("hidden");
    generateListButton.classList.add("hidden");

    const carto = initMap();
    
    let currentList = [];

    console.log("loading data");
    loadAnimation.style.display = "inline-block";
  
    const results = await fetch(
      "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-01-01&endtime=2020-01-02"
    );

    const storedList = await results.json();
    const dataList = storedList.features;

    localStorage.setItem('storedData', JSON.stringify(dataList));
    let storedData = localStorage.getItem("storedData");

    let parsedData = JSON.parse(storedData);   

    if (parsedData?.length > 0) {
      generateListButton.classList.remove("hidden");
    }
  
    loadAnimation.style.display = "none";

    refreshDataButton.addEventListener("click", (event) => {
      loadAnimation.style.display = "inline-block";
      localStorage.clear();

      const target = document.querySelector("#location");
      target.innerHTML = "";
    
      localStorage.setItem('storedData', JSON.stringify(dataList));
      storedData = localStorage.getItem("storedData");
    
      parsedData = JSON.parse(storedData);
  
      loadAnimation.style.display = "none";

      currentList = cutEarthquakeList(parsedData);
      injectHTML(currentList)
      markerPlace(currentList, carto);
    });
  
    generateListButton.addEventListener("click", (event) => {
      console.log("generate new list");
      currentList = cutEarthquakeList(parsedData);
      console.log(currentList);
      injectHTML(currentList);
      markerPlace(currentList, carto);

      if (currentList?.length > 0) {
        generateListButton.classList.add("hidden");
        refreshDataButton.classList.remove("hidden");
      }
    });

    textField.addEventListener("input", (event) => {
        console.log("input", event.target.value);
        const newList = filterList(currentList, event.target.value);
        console.log(newList);
        injectHTML(newList);
        markerPlace(newList, carto);
    });
  }
  
  document.addEventListener("DOMContentLoaded", async () => mainEvent());