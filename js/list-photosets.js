(function () {
    "use strict";

    // https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=7ec3fd13ea8480e8a098bd82a474723a&user_id=8110271%40N05&format=json&nojsoncallback=1

    // Set API path
    const api = "https://api.flickr.com/services/rest/";

    // Provide the API key
    const api_key = "";

    // API request URL for all photosets by user
    // https://www.flickr.com/services/api/flickr.photosets.getList.html
    const url = `${api}?method=flickr.photosets.getList&api_key=${api_key}&user_id=8110271%40N05&format=json&&per_page=12&nojsoncallback=1`;

    // API request URL for an individual photo
    // https://www.flickr.com/services/api/flickr.photos.getSizes.html
    const url_onephoto = `${api}?method=flickr.photos.getSizes&api_key=${api_key}&format=json&nojsoncallback=1&photo_id=`;

    fetch(url)
        .then(response => response.json())
        .then(function (data) {

            let display_element = "";

            let thumbs_array = [];

            for (let photo of data.photosets.photoset) {
                thumbs_array.push(photo.primary);

                display_element += "<article id=\"" + photo.primary + "\">";
                display_element += "<header>";
                display_element += "<a href=\"gallery.html?id=" + photo.id + "\">";
                display_element += photo.title._content + "</a>";
                display_element += "</header><main>";
                display_element += "<a href=\"gallery.html?id=" + photo.id + "\">";
                display_element += photo.title._content + "</a>";
                display_element += "<p><strong>" + convert_date(photo.date_create) + "</strong></p>";
                display_element += "<p>" + photo.description._content + "</p>";
                display_element += "<footer>" + photo.photos + " images</footer>";
                display_element += "</main></article>";

                document.querySelector("section").innerHTML = display_element;
            }

            return thumbs_array;

        })
        .then(function (thumbs_array) {

            //return fetch(url_onephoto + thumbs_array[0]);

            requestImage(thumbs_array);

        })
        .catch(error => {
            console.warn(error);
            show_status("Dang! There appears to be no internet connection.");
        });

    // Format the date suppied by flickr
    function convert_date( unix_timestamp ) {
        let date = new Date(unix_timestamp * 1000);
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        let formatted_date = months[date.getMonth()] + " " + date.getFullYear();
        return formatted_date;
    }

    // Get the individual image from the getSizes method
    // id - the id of the image
    // altText - the alternative text of the image
    function requestImage (sizes) {

        for (let size of sizes) {
            let url = url_onephoto + size;

            let article = document.getElementById(size);

            fetch(url)
                .then(response => response.json())
                .then(function(data)  {

                    article.firstChild.style.backgroundImage = 'url(' + data.sizes.size[3].source + ')';

                })
                .catch(error => console.warn(error));
        }
    }

    // This function needs to be common to both pages
    function show_status(message) {
        let appstatus = document.createElement("div");
        appstatus.className = "warning";
        appstatus.textContent = message;
        document.getElementsByTagName("body")[0].insertAdjacentElement("afterbegin", appstatus);
    }

}());


