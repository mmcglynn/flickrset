(function () {
    "use strict";

    // https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=7ec3fd13ea8480e8a098bd82a474723a&user_id=8110271%40N05&format=json&nojsoncallback=1

    // The current screen resolution
    const viewport_width = window.innerWidth;

    // Set API path
    const api = "https://api.flickr.com/services/rest/";

    // Provide the API key
    const api_key = "7ec3fd13ea8480e8a098bd82a474723a";

    // API request URL for all photosets by user
    // https://www.flickr.com/services/api/flickr.photosets.getList.html
    const url = `${api}?method=flickr.photosets.getList&api_key=${api_key}&user_id=8110271%40N05&format=json&&per_page=12&nojsoncallback=1`;

    // API request URL for an individual photo
    // https://www.flickr.com/services/api/flickr.photos.getSizes.html
    const url_onephoto = `${api}?method=flickr.photos.getSizes&api_key=${api_key}&format=json&nojsoncallback=1&photo_id=`;

    // Fetch the data to build the index page
    fetch(url)
        .then(response => response.json())
        .then(function (data) {

            // Use the data to create markup and append it to the DOM
            let display_element = '';
            let thumbs_array = [];

            for (let photoset of data.photosets.photoset) {
                thumbs_array.push(photoset.primary);

                display_element += '<article id="' + photoset.primary + '">';
                display_element += '<header>';
                display_element += '<a href="' + photoset.id + '" class="gallery-card" >';
                display_element += photoset.title._content + '</a>';
                display_element += '</header>';
                display_element += '<section>';
                display_element += '<h3>' + photoset.title._content + '</h3>';
                display_element += '<p>' + photoset.description._content + '</p>';
                display_element += '<a href="' + photoset.id + '" class="gallery-card">See the photos</a>';
                display_element += '</section>';
                display_element += '<footer>';
                display_element += '<p>' + convert_date(photoset.date_create) + '</p>';
                display_element += '<p>' + photoset.photos + ' images</p>';
                display_element += '</footer>';
                display_element += '</article>';

                document.querySelector("#gallery-index").innerHTML = display_element;
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
        })
        .finally( () => {
            let cardlink = document.querySelectorAll('.gallery-card');

            // Add event listeners to the gallery index
            cardlink.forEach( link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    //console.log(link.attributes.href.value);
                    toggleGallery();
                    requestGalleryMembers(link.attributes.href.value);
                });
            });

        });



    //requestGalleryMembers(function (output) {

        //console.log(output.length);

        // // The integer of the last index in the photos array
        // let last_index_value = output.length;
        //
        // // Loop through the created gallery photo array
        // for (let [i, obj] of output.entries() ) {
        //     addFigures(obj[0], obj[1], i + 1);
        // }
        //
        // // Because all figures are initally set to inactive, set the first one to active
        // document.getElementsByTagName("figure")[0].classList.remove("inactive");
        // document.getElementsByTagName("figure")[0].classList.add("active");
        //
        // requestImage(output[0][0],output[0][1]);
        // requestImage(output[1][0],output[1][1]);
        //
        // // Pass the array's length to the navigation function
        // navigation(last_index_value);
    //});

    // START HERE
    // requestGalleryMembers(null, function (output) {
    //     console.log(output.length);
    // });


    // Process the data externally by passing in a callback function
    function requestGalleryMembers(photoset_id) {

        // API request URL for all photos in the gallery
        // Documentation: https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
        const url_allphotos = `${api}?method=flickr.photosets.getPhotos&api_key=${api_key}&photoset_id=${photoset_id}&format=json&nojsoncallback=1`;

        // console.log(url_allphotos);

        fetch(url_allphotos)
            .then(response => response.json())
            .then(function (data) {

                //console.log(data);

                // Display the gallery title
                let h1 = document.getElementsByTagName("h1");
                if (!data.photoset.title) {
                    h1[0].innerText = "Album Title Missing";
                } else {
                    h1[0].innerText = data.photoset.title;
                }

                // Instantiate the photos array
                let photosArray = [];

                // Iterate over the response and create a simplified array
                for (let obj of data.photoset.photo) {
                    photosArray.push([obj.id, obj.title]);
                }

                //console.log(photosArray);
                handleData(photosArray);

                //return photosArray;

                // // Pass the new array to the callback function;
                //if (handleData) {
                    //return handleData(photosArray);
                //}

            })
            .catch(error => {
                console.warn(error);
            });

    }

    function handleData(i) {
        console.log(i);
    }

    // Get the individual image from the getSizes method
    // id - the id of the image
    // altText - the alternative text of the image
    const requestImage = (sizes) => {

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
    };

    // Add the figures into the DOM, loaded with the IDs and captions from the initial API request
    // imageid = The individual photo ID
    // captiontext = The individual photo caption text
    // position = the position in the sequence
    const addFigures = (imageid, captiontext, position) => {

        let figure_height = window.innerHeight - (document.getElementById('gallery').offsetTop);

        // Build the figcaption element and contents
        let figcaption = document.createElement("figcaption");
        let figcaptiondiv = document.createElement("div");
        figcaptiondiv.append(document.createTextNode(captiontext + " (" + position + ")"));
        figcaption.append(figcaptiondiv);

        // Build the figure element
        let figure = document.createElement("figure");
        figure.classList.add("inactive");
        figure.id = imageid;
        figure.title = captiontext;
        figure.style.height = figure_height + "px";

        // Add the new elements to the DOM
        figure.append(figcaption);
        document.getElementById("gallery").append(figure);
    };

    // Navigate through the slides, preloading images along the way
    // This really needs to be a class
    function navigation(total) {

        // Get a list of all elements
        let elements = document.getElementsByTagName("figure");

        // Handle the arrow navigation links
        let navitems = document.querySelectorAll("nav a");
        navitems.forEach(function(item) {
            let navitem = document.getElementById(item.id);
            navitem.addEventListener("click", (e) => {
                let increment = 0;
                e.preventDefault();
                if (navitem.id === "prev") {
                    increment = -1;
                } else {
                    increment = 1;
                }
                advance_slides(increment);
            });
        });

        // Handle the arrow keys on the keyboard
        document.addEventListener('keydown', logKey);
        let increment = 0;
        function logKey(e) {
            switch(e.code) {
                case "ArrowRight":
                    increment = 1;
                    break;
                case "ArrowLeft":
                    increment = -1;
                    break;
                default:
                    increment = 0;
            }
            if(Math.abs(increment) === 1) {
                // console.log("Math.abs(increment) " + Math.abs(increment) + ", increment: " + increment + ", e.code: " + e.code);
                advance_slides(increment);
            }
        }

        // Need to handle when previous keyboard control is activated
        function advance_slides(increment) {

            // Count the images already loaded
            let loaded_images = document.getElementsByTagName("img").length;

            // If half or more of the images are loaded, show the 'previous' control
            if ( loaded_images < Math.floor(total/2) && -1 === increment ) {
                // Should this be a return?
            } else {
                if (loaded_images > Math.floor(total/2)) {
                    document.getElementById("prev").style.display = "block";
                }

                // For figures with no child image, add the relevant attributes to an array
                let unloaded_images = [];
                let active_element_index = 0, i = 0;

                for (let element of elements) {
                    if (element.className === "active") {
                        active_element_index = i;
                    }
                    // Figures with only a figcaption as a child don't yet have a child image
                    // Push those attributes into to the array
                    if (element.childElementCount < 2) {
                        unloaded_images.push(element.id, element.title);
                    }
                    i++;
                }

                // The the array is not empty, load the first image in the unloaded images array
                if (unloaded_images.length > 0) {
                    requestImage(unloaded_images[0],unloaded_images[1]);
                }

                // Determine which direction has been selected
                let next_active_element_index = active_element_index + increment;

                // Going forward from the last slide, move to the first slide
                if (next_active_element_index === total) {
                    active_element_index = total - 1;
                    next_active_element_index = 0;
                }

                // Going back from the first slide, move to the last slide
                // If "previous" is clicked on the first slide, show the last slide
                if(active_element_index === 0 && increment === -1 ) {
                    next_active_element_index = (elements.length - 1);
                }

                // Replace the class names based on the calculation above
                elements[active_element_index].className = elements[active_element_index].className.replace("active","inactive");
                elements[next_active_element_index].className = elements[next_active_element_index].className.replace("inactive","active");

            }

        }
    }

    // This function will toggle the appearance of the initial gallery index.
    // It will be shown and hidden so the the initial request only needs to be made once.
    // Also, so that the URL can be made friendly by not using query parameters (maybe)
    const toggleGallery = () => {
        const index = document.getElementById('gallery-index');
        console.log(index.style.display);

        if ( index.style.display === 'none' ) {
            index.style.display = 'block';
        } else {
            index.style.display = 'none';
        }
    };

    // Format the date as supplied by flickr
    const convert_date = unix_timestamp => {
        let date = new Date(unix_timestamp * 1000);
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        let formatted_date = months[date.getMonth()] + " " + date.getFullYear();
        return formatted_date;
    };

    // Show a status message when the request fails.
    const show_status = message => {
        let appstatus = document.createElement("div");
        appstatus.className = "warning";
        appstatus.textContent = message;
        document.getElementsByTagName("body")[0].insertAdjacentElement("afterbegin", appstatus);
    };

}());


