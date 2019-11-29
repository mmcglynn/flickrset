/*jslint es6:true*/

// Set API path
const api = 'https://api.flickr.com/services/rest/';

// Provide API key
const api_key = '7ec3fd13ea8480e8a098bd82a474723a';

const url = api
    + '?method=flickr.photosets.getPhotos&api_key='
    + api_key
    + '&photoset_id=72157686731900515&format=json&jsoncallback=?';


fetch(url)
  .then(function(response) {
    console.log(response);
  })
    .catch(function(error) {
    // If there is any error you will catch them here
  });
