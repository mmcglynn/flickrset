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
        .then(function(data)  {
            //console.log(data.photosets.photoset.length);

            let photoset_total = data.photosets.photoset.length;

            let display_element = "";

            function convert_date( unix_timestamp ) {
                let date = new Date(unix_timestamp * 1000)
                const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                let formatted_date = months[date.getMonth()] + " " + date.getFullYear();
                return formatted_date;
            }

            for ( var i = 0; i < photoset_total; i++)
            {
                display_element += "<article><a href=\"gallery.html?id=";
                display_element += data.photosets.photoset[i].id + "\">";
                display_element += data.photosets.photoset[i].title._content + "</a>";
                display_element += "<p><strong>" + convert_date(data.photosets.photoset[i].date_create) + "</strong></p>";
                display_element += "<p>" + data.photosets.photoset[i].description._content + "</p>";
                display_element += "<p>" + data.photosets.photoset[i].photos + " images</p>";
                display_element += "</article>";

                document.querySelector("section").innerHTML = display_element;
            }

        })
        .catch(error => console.warn(error));

}());


