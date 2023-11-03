// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
let map, infoWindow;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 6,
    });
    infoWindow = new google.maps.InfoWindow();

    const locationButton = document.createElement("button");

    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };

                    infoWindow.setPosition(pos);
                    infoWindow.setContent("Location found.");
                    infoWindow.open(map);
                    map.setCenter(pos);
                },
                () => {
                    handleLocationError(true, infoWindow, map.getCenter());
                },
            );
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false, infoWindow, map.getCenter());
        }
    });


    map.addListener("click", (mapsMouseEvent) => {

        // Close the current InfoWindow.
        infoWindow.close();
        // Create a new InfoWindow.
        infoWindow = new google.maps.InfoWindow({
            position: mapsMouseEvent.latLng,
        });
        console.log(mapsMouseEvent.latLng)
        getAirQuality(mapsMouseEvent.latLng.toJSON().lat,mapsMouseEvent.latLng.toJSON().lng)
            .then(airQuality => {
                infoWindow.setContent(
                    `Region Code: ${airQuality.regionCode}<br>` +
                    `Display Name: ${airQuality.displayName}<br>` +
                    `Category: ${airQuality.category}<br>` +
                    `Dominant Pollutant: ${airQuality.dominantPollutant}<br>`,
                );
            })
            .catch(error => {
                console.error(error);
            });

        infoWindow.open(map);
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation.",
    );
    infoWindow.open(map);
}

window.initMap = initMap;


function getAirQuality(lat,long) {
    const url = 'https://airquality.googleapis.com/v1/currentConditions:lookup?' +
        'key=AIzaSyC4HTLweFtobh9mpv3SRZ1uuYm2BXNHMog';
    const data = {
        location: {
            latitude: lat,
            longitude: long
        }
    };

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            const airQuality = result.indexes[0];
            const regionCode = result.regionCode;
            const displayName = airQuality.displayName;
            const category = airQuality.category;
            const dominantPollutant = airQuality.dominantPollutant;

            // 进一步处理逻辑
            // ...

            // 返回所需信息
            return {
                regionCode,
                displayName,
                category,
                dominantPollutant
            };
        })
        .catch(error => {
            console.error('Error:', error);
            throw new Error('Failed to get air quality');
        });
}

window.onload = function () {
    document.getElementById("search").onclick = search;
}
function search() {
    let lat = document.getElementById("lat").value;
    let long = document.getElementById("long").value;
    if (lat === "" || long === "") {
        alert("Please enter valid latitude and longitude");
        return;
    }
    let pos = {
        lat: parseFloat(lat),
        lng: parseFloat(long)
    }
    map.panTo(pos);
    infoWindow.close();
    infoWindow = new google.maps.InfoWindow({
        position: pos,
    });
    getAirQuality(pos.lat,pos.lng)
        .then(airQuality => {
            infoWindow.setContent(
                `Region Code: ${airQuality.regionCode}<br>` +
                `Display Name: ${airQuality.displayName}<br>` +
                `Category: ${airQuality.category}<br>` +
                `Dominant Pollutant: ${airQuality.dominantPollutant}<br>`,
            );
        })
        .catch(error => {
            console.error(error);
        });

    infoWindow.open(map);

}


