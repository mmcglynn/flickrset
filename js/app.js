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
    const url_onephoto = `${api}?method=flickr.photos.getSizes&api_key=${api_key}&format=json&jsoncallback=?&photo_id=`;

    // API request URL for all photos in the gallery
    // https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
    const url_allphotos = `${api}?method=flickr.photosets.getPhotos&api_key=${api_key}&photoset_id=${photoset_id}&format=json&jsoncallback=?`;

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


    // Run requestGalleryMembers when DOM is ready
    jQuery(document).ready(function () {

        requestGalleryMembers(function (output) {

            // The integer of the last index in the photos array
            let last_index_value = output.length;

            // Loop through the created gallery photo array
            jQuery.each(output, function (index, item) {
                // Add the slide containers, which in this case are figures and figcaptions
                addFigures(item[0], item[1], index + 1);
            });

            // Because all figures are initally set to inactive, set the first one to active
            jQuery("figure:first").removeClass("inactive").addClass("active");

            requestImage(output[0][0]);
            requestImage(output[1][0]);

            // Pass the array's length to the navigation function
            navigation(last_index_value);
        });




    });

    // Navigate through the slides, preloading images along the way
    // Needs enhancement of keypress
    function navigation(total) {

        jQuery("nav a").on("click",function (e) {
            e.preventDefault();
            advance_slides(this.id);
        });

        jQuery(document).keydown(function(e) {
            let direction = "";
            e.preventDefault();
            switch(e.which) {
                case 37:
                    direction = "prev";
                    break;
                case 39:
                    direction = "next";
                    break;
                default: return;
            }
            advance_slides(direction);
        });

        // Navigate the slides and load the images using events
        function advance_slides(direction) {
            // Get a list of all elements
            let elements = document.getElementsByTagName("figure");

            let elements_length = total - 1;

            //console.log("elements[elements_length].style.length: " + elements[elements_length].style.length);

            // Set the navigation increment
            // -1 for "previous" navigation link
            let increment_value = -1;
            // +1 for the "next" navigation link
            if (direction  === "next") {
                increment_value = 1;
            }

            // Loop though the element list and determine:
            // - the index of the currently active element
            // - the total of already loaded images by counting style attributes (default is 2)
            let unloaded_images = [], active_element_index = 0, i = -1;
            for (let element of elements) {
                i++;
                if( 1 === element.style.length ) {
                    unloaded_images.push(element.id);
                }
                if( element.classList[0] === "active" ) {
                    active_element_index = i;
                }
            }

            // SHOW ACTIVE SLIDE ********************* //

            // The next or previous element in the sequence to make active
            let next_active_element_index = active_element_index + increment_value;

            // Debug
            //console.log(`TRACE\nincrement_value: ${increment_value}\nunloaded_images: ${unloaded_images}\nactive_element_index: ${active_element_index}\nnext_active_element_index: ${next_active_element_index}`);

            // If the first image has a background image, show the previous button
            if (elements[0].style.length > 1) {
                //console.log("1. The first image has a background image.");
                document.getElementById("prev").style.display = "block";
            }

            // The the first slide is shown and the last slide has no image, hide the "prev" button.
            if (active_element_index === 1 && elements[elements_length].style.length < 2) {
                //console.log("2. The first slide is shown and the last slide has no image.");
                document.getElementById("prev").style.display = "none";
            }

            // If "next" is clicked on the last slide, show the first slide
            if (active_element_index === elements_length && increment_value === 1) {
                //console.log("3. This is the first slide.");
                next_active_element_index = 0;
            }

            // If "previous" is clicked on the first slide, show the last slide
            if(active_element_index === 0 && increment_value === -1 ) {
                //console.log("4. This is the last slide.");
                next_active_element_index = elements_length;
            }

            // Replace the class names
            elements[active_element_index].className = elements[active_element_index].className.replace("active","inactive");
            elements[next_active_element_index].className = elements[next_active_element_index].className.replace("inactive","active");

            // LOAD IMAGE **************************** //
            // Load the first image in the unloaded images array
            if(unloaded_images.length > 0) {
                requestImage(unloaded_images[0]);
            }
        }
    }

    // Process the data externally by passing in a callback function
    function requestGalleryMembers(handleData) {
        jQuery.ajax({
            url: url_allphotos,
            type: "GET",
            cache: true,
            dataType: "jsonp",
            async: false,
            success: function (data) {

                // Display the gallery title
                galleryTitle(data.photoset.title);

                // Instantiate the photos array
                let photosArray = [];

                // Iterate over the response and create a simplified array
                jQuery.each(data.photoset.photo, function (i, obj) {
                    photosArray.push([obj.id, obj.title]);
                });

                // Pass the new array to the callback function;
                handleData(photosArray);
            },
            error: function () {
                console.log("Gallery request has failed.");
            }
        });
    }

    // Get the individual image from the getSizes method
    // id - the id of the image
    // altText - the alternative text of the image
    function requestImage(id) {

        // Debug
        //d = new Date();
        //console.log("requestImage called. " + d.getTime());

        // 6/2/2020
        // Because we're not using the IMG tag, use the altText for the figure title attribute instead

        jQuery.ajax({
            url: url_onephoto + id,
            type: "GET",
            cache: true,
            dataType: "jsonp", // why?
            async: false,
            success: function (data) {

                // Instantiate the size array
                let sizes_array = [];

                // The index of the sizes array to get the path from
                let size_index = 0;

                // Push the available widths into the array for comparison
                jQuery.each(data.sizes.size, function (i, obj) {
                    sizes_array.push(obj.width);
                });

                // Find the closest value in the array to the viewport's width.
                // This will determine which image size we request.
                const output = sizes_array.reduce(
                    (prev, curr) => Math.abs(curr - viewport_width) < Math.abs(prev - viewport_width) ? curr : prev
                );

                // Get the index of the chosen resolution in order to choose the right image source.
                jQuery.each(data.sizes.size, function (i, obj) {
                    if (output === obj.width) {
                        size_index = i;
                    }
                });

                // Append the element in the proper ID location
                jQuery("figure#" + id).css({
                    'background-image': 'url(' + data.sizes.size[size_index].source + ')'
                });

            },
            error: function () {
                console.log("Data was not retrieved.");
            }
        });
    }

    // Add the figures into the DOM, loaded with the IDs and captions from the initial API request
    // imageid = The individual photo ID
    // captiontext = The individual photo caption text
    // position = the position in the sequence
    function addFigures(imageid, captiontext, position) {

        let figure_height = window.innerHeight - (document.getElementById('gallery').offsetTop - 1);

        let figcaption = jQuery("<figcaption>").text(captiontext + " (" + position + ")");
        let figure = jQuery("<figure>", {
            id: imageid,
            class: "inactive",
            title: captiontext,
            css: {"height": figure_height}
        });
        figure.append(figcaption);
        jQuery("#gallery").append(figure);
    }

    // Place arrows based on window size
    function placeArrows(h) {
        let controloffset = document.getElementById("next").offsetHeight;
        let arrowposition = Math.floor(((h - controloffset) / 2)) + "px";
        // Debug
        //console.log("controloffset=" + controloffset + ", arrowposition=" + arrowposition);
        jQuery("nav").css("top", arrowposition);
    }

    // Display the gallery title
    function galleryTitle(title) {
        if (title) {
            jQuery("h1").text(title);
        } else {
            jQuery("h1").text("Album Title Missing");
        }
    }

    // Locate the ID in the URL
    function getPhotosetID() {

        let id = "";

        // Feature detection
        if ("URLSearchParams" in window) {
            // Get the URL
            const url = new URL(window.location.href);
            // Search the URL parameters
            const params = new URLSearchParams(url.search);
            // Check if the 'id' parameter exists
            if (params.has("id")) {
                // Get the id's value
                id = url.searchParams.get("id");
                //console.log(photoset_id);
            }
        } else {
            // Need to have a better default.
            id = "72157657718008461";
        }
        return id;
    }

}());