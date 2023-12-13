console.log('Client-side code running');
// -------------------------------------------- HEAT MAP ( LEAFLET JS )
// SET VIEW AND ZOOM ON MAP
let map = L.map('map').setView([0,0], 1);

// ADD TILE LAYER AKA MAP TYPE TO MAP
// NOWRAP: TRUE IS SET SO THAT THE MAP WON'T DUPLICATE WHEN USER MOVES THE MAP
// THE API KEY IS ADDED BECAUSE IT IS NEEDED TO USE MAPS FROM STADIAMAPS (IT'S FREE)
L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}?api_key=c2365df7-7556-4972-8ad8-1c7f5d19ab1b', {noWrap: true,ext: 'png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

// -------------------------------------------- GEOJSON FOR HEAT MAP ( LEAFLET JS )
// GEOJSON FILE FETCHED TO CREATE AREAS FOR EACH COUNTRY
async function renderGeoJSON (countryData) {
    fetch('./js/countries.geo.json')
        .then((r) => r.json())
        .then((data) => {
            // ACCESS DATA IN THE GEOJSON
            L.geoJson(data, {
                // CHANGE STYLE ON MAP
                style: function(feature) {
                    // FIND THE COUNTRIES IN OUR DATA
                    for (let country of countryData) {
                        // IF COUNTRY IS THE SAME IN GEOJSON AS IN OUR DATA
                        if (country.name === feature.properties.name) {
                            // THEN GIVE THE COUNTRY AREA A COLOR DEPENDING ON SALES AMOUNT
                            return {
                                color: getColor(country.count),
                                weight: 1,
                            };
                        }
                    }
                    // FOR ALL THE COUNTRIES WITH NO SALES DATA, COLOR IT GREY
                    return {
                        color: getColor(0),
                        weight: 1,
                    };
                },
                // ONEACHFEATURE ADDS A POPUP/TOOLTIP TO THE COUNTRIES
                onEachFeature: onEachFeature,
                // ADD GEOJSON WITH ADDED COLORS TO MAP
            }).addTo(map);
        });
}

// -------------------------------------------- ON EACH FEATURE FUNCTION
function onEachFeature(feature, layer) {
    layer.bindPopup(feature.properties.name);
    // NO POPUP/TOOLTIP IS ADDED FOR COUNTRIES WITH NO SALES
    const countryData = JSON.parse(sessionStorage.getItem("sessionCountryData"));

    for (let country of countryData) {
        // IF THE GEOJSON COUNTRY EXISTS IN THE COUNTRY DATA
        if (country.name === feature.properties.name) {
            // THEN ADD A POPUP/TOOLTIP WITH THE COUNTRY NAME AND TOTAL SALES AMOUNT FOR THE COUNTRY
            layer.bindPopup(feature.properties.name + ': ' + country.count + ' pictures');
        }
    }
    // SHOW THE POPUP/TOOLTIP ON MOUSEOVER
    layer.on({
        click: function() {
            layer.openPopup();
        },
    });
}

// -------------------------------------------- COLOR VALUES BASED ON SALES VALUE
function getColor(value) {
    // IF THE BOOLEAN IS TRUE THEN RETURN COLOR CODE
    // ELSE GO ON TO THE NEXT BOOLEAN AND DO THE SAME
    // IF THE VALUE IS LESS THAN OR EQUAL TO 0 THEN RETURN THE GREY COLOR CODE
    return value > 0 ? '#ff0000' :
        value > 300  ? '#ff5c1f' :
            value > 100   ? '#ff7c0c' :
                value > 40   ? '#fc9c1a' :
                    value > 0   ? '#f8b84c' :
                        '#c4c4c4';
}

// -------------------------------------------- RETRIEVE PICTURES FROM FIREBASE

async function loadPage () {
    await fetch('/home', {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'Accept':'application/json'
        },
    })
        .then((response) => {
            return response.json();
        })
        .then(async (data) => {
            console.log(data);
            if (data !== true) {
                sessionStorage.clear();
                location.href = `/login.html`;
            } else {
                await renderPictures(recentPictures);
                await appendCountryData();
                await renderAlbums();
            }
        });
}
loadPage();
let filters = {};
const recentPictures = document.querySelector('#recent-pictures');
uploadPictureBtn.addEventListener('click', () => {
    uploadPictureModal.classList.toggle('hidden');
});
uploadBtn.addEventListener('click', uploadPicture);
