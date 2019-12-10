/*jslint es6:true*/

// The ID of the gallery, which at some point won't be hard coded
const photoset_id = '72157686731900515';

// Set API path
const api = 'https://api.flickr.com/services/rest/';

// Provide API key
const api_key = '7ec3fd13ea8480e8a098bd82a474723a';

// API request URL for an individual photo
// https://www.flickr.com/services/api/flickr.photos.getSizes.html
let photo_id = '';
const url_onephoto =  `${api}?method=flickr.photos.getSizes&api_key=${api_key}&photo_id=${photo_id}&format=json&nojsoncallback=1`;

// API request URL for all photo sin the gallery
// https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
const url_allphotos = `${api}?method=flickr.photosets.getPhotos&api_key=${api_key}&photoset_id=${photoset_id}&format=json&nojsoncallback=1`;


// fetch(url)
//     .then(response => response.json())
//     .then(function(data) {
//         console.log(JSON.stringify(data))
//         console.log(data.photoset.id);
//     });


// function getvals(){
//     return fetch(url)
//         .then((response) => response.json())
//         .then((responseData) => {
//             return responseData;
//         })
//         .catch(error => console.warn(error));
// }
//
// getvals().then(response => console.log(response.photoset.id));


// The basic, traditional way to make the request
var req = new XMLHttpRequest();
//req.responseType = 'json';
req.open('GET', url_allphotos, false);
req.onload  = function() {
    var jsonResponse = req.response;
    // do something with jsonResponse
    console.log(jsonResponse);

};
req.send(null);

