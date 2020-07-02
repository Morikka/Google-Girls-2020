// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDtf6ZForq-rEIQseacHaBZp3cKbf-rowY&callback=initMap';
script.defer = true;
script.async = true;

// Attach your callback function to the `window` object
window.initMap = function() {
    var map = new google.maps.Map(document.getElementById('map'), {
                center: { lat: 22.396881, lng: 114.155160 },
                scrollwheel: false,
                zoom: 11
    });
};
// google.setOnLoadCallback(initialize);
// Append the 'script' element to 'head'
document.head.appendChild(script);

