(function () {
    "use strict";

    // https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=7ec3fd13ea8480e8a098bd82a474723a&user_id=8110271%40N05&format=json&nojsoncallback=1

    // Set API path
    const api = "https://api.flickr.com/services/rest/";

    // Provide API key
    const api_key = "7ec3fd13ea8480e8a098bd82a474723a";

    // API request URL for all photosets by user
    // https://www.flickr.com/services/api/flickr.photosets.getList.html
    const url = `${api}?method=flickr.photosets.getList&api_key=${api_key}&user_id=8110271%40N05&format=json&nojsoncallback=1`;

    fetch(url)
        .then(response => response.json())
        .then(function(data) {
            //console.log(data.photosets.photoset.length);

            let photoset_total = data.photosets.photoset.length;

            let display_element = "";

            for ( var i = 0; i < photoset_total; i++)
            {
                display_element += "<article><a href=\"gallery.html?id=" + data.photosets.photoset[i].id + "\">" + data.photosets.photoset[i].title._content + data.photosets.photoset[i].photos + "</a></article>";

                document.querySelector("section").innerHTML = display_element;
            }

        })
        .catch(error => console.warn(error));

}());


