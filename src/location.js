// Wait for the DOM to load completely before running the script
document.addEventListener('DOMContentLoaded', function () {

    const enableLocationButton = document.getElementById('enable-location');
    const hotelList = document.getElementById('hotel-list');
    const apiKey = 'YOUR_GOOGLE_API_KEY'; // Replace with your Google API key

    // When the user clicks on the "Enable Location" button
    enableLocationButton.addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    });

    // Callback for success when geolocation is retrieved
    function showPosition(position) {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;
        
        // Get nearby hotels using Google Places API
        getNearbyHotels(lat, lon);
    }

    // Callback for when there is an error getting the location
    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    }

    // Function to fetch nearby hotels using Google Places API
    function getNearbyHotels(lat, lon) {
        const radius = 5000; // 5 kilometers radius
        const type = 'lodging'; // Search for hotels

        // Construct the URL for Google Places API request
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${apiKey}`;

        // Fetch nearby hotels data
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results) {
                    displayNearbyHotels(data.results);
                } else {
                    hotelList.innerHTML = '<p>No nearby hotels found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching nearby hotels:', error);
                hotelList.innerHTML = '<p>Failed to retrieve hotel data.</p>';
            });
    }

    // Function to display the list of nearby hotels
    function displayNearbyHotels(hotels) {
        hotelList.innerHTML = ''; // Clear previous results

        hotels.forEach(hotel => {
            const hotelItem = document.createElement('div');
            hotelItem.classList.add('hotel');
            hotelItem.innerHTML = `
                <h3>${hotel.name}</h3>
                <p>${hotel.vicinity}</p>
                <p>Rating: ${hotel.rating || 'N/A'}</p>
                <p><a href="https://www.google.com/maps/search/?q=${encodeURIComponent(hotel.name + ' ' + hotel.vicinity)}" target="_blank">View on Google Maps</a></p>
            `;
            hotelList.appendChild(hotelItem);
        });
    }

});
