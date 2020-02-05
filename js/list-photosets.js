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

    // This works
    // fetch(url)
    //     .then(response => response.json())
    //     .then(function(data) {
    //     console.log(JSON.stringify(data))
    //     //console.log(data.photoset.id);
    // });

    fetch(url)
        .then(response => response.json())
        .then(function(data) {
            //console.log(data.photosets.photoset.length);

            let photoset_total = data.photosets.photoset.length;

            let list_element = "";

            for ( var i = 0; i < photoset_total; i++)
            {
                list_element += "<li><a href=\"gallery.html?id=" + data.photosets.photoset[i].id + "\">" + data.photosets.photoset[i].title._content + "</a></li>";
                //console.log(list_element);

                document.querySelector("#gallery_list").innerHTML =list_element;
            }

        })
        .catch(error => console.warn(error));


    // This works
    // function getvals(){
    //     return fetch(url)
    //         .then((response) => response.json())
    //         .then((responseData) => {
    //             return responseData;
    //         })
    //         .catch(error => console.warn(error));
    // }
    //
    // getvals().then(response => console.log(response.photosets.perpage));



}());


