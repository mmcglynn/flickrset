// To EXCLUDE jsonFlickrApi wrapper
// nojsoncallback=1
// To INCLUDE jsonFlickrApi wrapper
// jsoncallback=?

// TO DO
// Make pervious button appear earlier, maybe when a 1/4 of the images have loaded?
// Add keypress support

(function () {
    "use strict";

    // Pull the ID out of the URL. This needs work to define behavior for missing ID.
    const photoset_id = getPhotosetID();

    // The current screen resolution
    const viewport_width = window.innerWidth;

    // Set API path
    const api = "https://api.flickr.com/services/rest/";

    // Provide API key
    const api_key = "7ec3fd13ea8480e8a098bd82a474723a";

    // API request URL for an individual photo
    // https://www.flickr.com/services/api/flickr.photos.getSizes.html
    const url_onephoto = `${api}?method=flickr.photos.getSizes&api_key=${api_key}&format=json&nojsoncallback=1&photo_id=`;

    // API request URL for all photos in the gallery
    // https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
    //const url_allphotos = `${api}?method=flickr.photosets.getPhotos&api_key=${api_key}&photoset_id=${photoset_id}&format=json&jsoncallback=?`;
    const url_allphotos = `${api}?method=flickr.photosets.getPhotos&api_key=${api_key}&photoset_id=${photoset_id}&format=json&nojsoncallback=1`;

    // API request URL for all photos in the gallery
    // https://www.flickr.com/services/api/flickr.photosets.getList.html
    // https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=7ec3fd13ea8480e8a098bd82a474723a&user_id=8110271%40N05&format=json


    if (window.innerWidth > 900 ) {
        // Place arrows
        placeArrows(window.innerHeight);

        // Adjust placement on window resize
        window.addEventListener('resize', () => {
            placeArrows(window.innerHeight);
        });
    }

    requestGalleryMembers(function (output) {

        // The integer of the last index in the photos array
        let last_index_value = output.length;

        // Loop through the created gallery photo array
        for (let [i, obj] of output.entries() ) {
            addFigures(obj[0], obj[1], i + 1);
        }

        // Because all figures are initally set to inactive, set the first one to active
        document.getElementsByTagName("figure")[0].classList.remove("inactive");
        document.getElementsByTagName("figure")[0].classList.add("active");

        requestImage(output[0][0],output[0][1]);
        requestImage(output[1][0],output[1][1]);

        // Pass the array's length to the navigation function
        navigation(last_index_value);
    });

    // Navigate through the slides, preloading images along the way
    // Needs enhancement of keypress
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
            //console.log("There are " + loaded_images + " images loaded");
            //console.log("Math.floor(total/2): " + Math.floor(total/2));

            // If half or more of the images are loaded, show the 'previous' control
            //if ( (loaded_images > Math.floor(total/2) && -1 === increment) || (1 === increment)) {
            if ( loaded_images < Math.floor(total/2) && -1 === increment ) {
                //console.log ("Do nothing at all.");
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

                // Determine which direction
                let next_active_element_index = active_element_index + increment;
                //console.log("active_element_index: " + active_element_index);
                //console.log("next_active_element_index: " + next_active_element_index);
                //console.log("total: " + total);
                //console.log("=============================");

                // Going forward from the last slide, move to the first slide
                if (next_active_element_index === total) {
                    //console.log("You've hit the last slide!");
                    active_element_index = total - 1;
                    next_active_element_index = 0;
                }

                // Going back from the first slide, move to the last slide
                // If "previous" is clicked on the first slide, show the last slide
                if(active_element_index === 0 && increment === -1 ) {
                    //console.log("4. This is the first slide.");
                    next_active_element_index = (elements.length - 1);
                }

                // Replace the class names based on the calculation above
                elements[active_element_index].className = elements[active_element_index].className.replace("active","inactive");
                elements[next_active_element_index].className = elements[next_active_element_index].className.replace("inactive","active");

            }

        }
    }

    // Process the data externally by passing in a callback function
    function requestGalleryMembers(handleData) {

        fetch(url_allphotos)
            .then(response => response.json())
            .then(function (data) {
                // Display the gallery title
                galleryTitle(data.photoset.title);

                // Instantiate the photos array
                let photosArray = [];

                // Iterate over the response and create a simplified array
                for (let obj of data.photoset.photo) {
                    photosArray.push([obj.id, obj.title]);
                }

                // Pass the new array to the callback function;
                handleData(photosArray);
            })
            .catch(error => {
                //console.warn(error);
            });

    }

    // Get the individual image from the getSizes method
    // id - the id of the image
    // altText - the alternative text of the image
    function requestImage(id, altText) {

        fetch(url_onephoto + id)
            .then(response => response.json())
            .then(function (data) {
                // Instantiate the size array
                let sizes_array = [];

                // Create a new image object
                let img = new Image();

                // The index of the sizes array to get the path from
                let size_index = 0;

                // Push the available widths into the array for comparison
                for (let obj of data.sizes.size) {
                    sizes_array.push(obj.width);
                }

                // Find the closest value in the array to the viewport's width.
                // This will determine which image size we request.
                const output = sizes_array.reduce(
                    (prev, curr) => Math.abs(curr - viewport_width) < Math.abs(prev - viewport_width) ? curr : prev
                );

                // Get the index of the chosen resolution in order to choose the right image source.
                for (let [i, obj] of data.sizes.size.entries() ) {
                    if (output === obj.width) {
                        size_index = i;
                    }
                }

                // Add attributes to the image object
                img.src = data.sizes.size[size_index].source;
                img.alt = altText;
                img.title = altText;

                // Append the element in the proper ID location
                document.getElementById(id).append(img);
            })
            .catch(error => {
                //console.warn(error);
            });
    }

    // Add the figures into the DOM, loaded with the IDs and captions from the initial API request
    // imageid = The individual photo ID
    // captiontext = The individual photo caption text
    // position = the position in the sequence
    function addFigures(imageid, captiontext, position) {

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
    }

    // Place arrows based on window size
    function placeArrows(h) {
        let controloffset = document.getElementById("next").offsetHeight;
        let arrowposition = Math.floor(((h - controloffset) / 2)) + "px";
        let nav = document.getElementsByTagName("nav");
        nav[0].style.top = arrowposition;
    }

    // Display the gallery title
    function galleryTitle(title) {
        let h1 = document.getElementsByTagName("h1");
        if (!title) {
            title = "Album Title Missing";
        }
        h1[0].innerText = title;
    }

    // Locate the ID in the URL
    function getPhotosetID() {

        let id = "";

        // Feature detection
        if ("URLSearchParams" in window) {
            // Get the URL
            const url = new URL(window.location.href);
            // Search the URL parameters
            let params;
            params = new URLSearchParams(url.search);
            // Check if the 'id' parameter exists
            if (params.has("id")) {
                // Get the id's value
                id = url.searchParams.get("id");
            }
        } else {
            //alert("There is no image available.");
        }
        return id;
    }

}());