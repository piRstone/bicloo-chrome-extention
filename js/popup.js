var apiKey = "e9e260718f3e80217b7d67cc20cd05a27019862c";

// chrome.browserAction.setBadgeText({text: data.available_bikes.toString()});

function displayInfos(data) {
    // Title
    var title = document.createElement('h2');
    title.innerHTML = data.name.substring(6);

    // Bikes available
    var available = data.available_bikes;
    var status = document.createElement('span');
    var sentence = document.createElement('span');
    if (available == 0) {
        sentence.className = "unavailable";
        sentence.innerHTML = "Aucun vélo disponible";
        status.className = "status false";
    } else if (available == 1) {
        sentence.innerHTML = available + " vélo disponible";
        status.className = "status true";
    } else {
        sentence.innerHTML = available + " vélos disponibles";
        status.className = "status true";
    }
    var bikes = document.createElement('p');
    bikes.appendChild(status);
    bikes.appendChild(sentence);

    // Stands available
    var standsAvailable = data.available_bike_stands;
    var status2 = document.createElement('span');
    var sentence2 = document.createElement('span');
    if (standsAvailable == 0) {
        sentence2.className = "unavailable";
        sentence2.innerHTML = "Aucune place disponible";
        status2.className = "status false";
    } else if (standsAvailable == 1) {
        sentence2.innerHTML = standsAvailable + " place disponible";
        status2.className = "status true";
    } else {
        sentence2.innerHTML = standsAvailable + " places disponibles";
        status2.className = "status true";
    }
    var stands = document.createElement('p');
    stands.appendChild(status2);
    stands.appendChild(sentence2);

    // Delete button
    var deleteBut = document.createElement('a');
    deleteBut.className = "delete"
    deleteBut.id = "delete-" + data.number;
    deleteBut.innerHTML = "&times;";

    var element = document.createElement('div');
    element.className = "station";
    element.id = "station-"+data.number;
    element.appendChild(title);
    element.appendChild(bikes);
    element.appendChild(stands);
    element.appendChild(deleteBut);
    document.getElementById('stations').append(element);
    document.getElementById('delete-' + data.number).addEventListener('click', deleteStation);
}

function getStationInfos(stationId) {
    var url = "https://api.jcdecaux.com/vls/v1/stations/"+stationId+"?contract=nantes&apiKey="+apiKey;
    var x = new XMLHttpRequest();
    x.open('GET', url);
    x.responseType = 'json';
    x.onload = function() {
        var response = x.response;
        if (!response || response.error != undefined) {
            return;
        }
        displayInfos(response);
    };
    x.onerror = function() {
        console.error(x.response);
    };
    x.send();
}

function loadAddedStations() {
    if (localStorage['bql-fav-stations'] != undefined) {
        var savedStation = localStorage['bql-fav-stations'].split(',');
        for(var i=0 ; i < savedStation.length ; i++) {
            getStationInfos(savedStation[i]);
        }
    }
}

function getStationsList() {
    var url = "https://api.jcdecaux.com/vls/v1/stations?contract=nantes&apiKey="+apiKey;
    $.get(url, function(data) {
        var select = $('#add-station');
        for(var i=0 ; i < data.length ; i++) {
            select.append('<option value="'+data[i].number+'">'+data[i].name+'</option>');
        }
    });
}

function addStation(event) {
    getStationInfos(event.target.value);

    // Store added station
    if (localStorage['bql-fav-stations'] != undefined) {
        var savedStation = localStorage['bql-fav-stations'].split(',');
        savedStation.push(event.target.value);
        localStorage['bql-fav-stations'] = savedStation;
    } else {
        localStorage['bql-fav-stations'] = event.target.value;
    }
}

function deleteStation(event) {
    var id = event.target.id.substring(7);
    // Remove element
    document.getElementById('station-'+id).remove();

    // Remove value in storage
    var savedStation = localStorage['bql-fav-stations'].split(',');
    var i = savedStation.indexOf(id);
    savedStation.splice(i, 1);
    localStorage['bql-fav-stations'] = savedStation;
}

document.addEventListener('DOMContentLoaded', function() {
    // Load stations
    getStationsList();
    loadAddedStations();

    document.getElementById('add-station').addEventListener('change', addStation);
});
