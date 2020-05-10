// To EXCLUDE jsonFlickrApi wrapper
// nojsoncallback=1
// To INCLUDE jsonFlickrApi wrapper
// jsoncallback=?

// TO DO
// - Make pervious button appear earlier, maybe when a 1/4 of the images have loaded?

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

    // Place arrows
    placeArrows(window.innerHeight);
    // Adjust placement on window resize
    window.addEventListener('resize', () => { placeArrows(window.innerHeight) });

    // Run when DOM is ready
    $(document).ready(function () {

        requestGalleryMembers(function(output){

            // The integer of the last index in the photos array
            let last_index_value = output.length;

            // Loop through the created gallery photo array
            $.each(output, function (index, item) {
                // Add the slide containers, which in this case are figures and figcaptions
                addFigures(item[0],item[1],index + 1);
            });

            // Because all figures are initally set to inactive, set the first one to active
            $("figure:first").removeClass("inactive").addClass("active");

            // Populate the first two images
            requestImage(output[0][0],output[0][1]);
            requestImage(output[1][0],output[1][1]);

            // Pass the array's length to the navigation function
            navigation(last_index_value);
        });

    });

    // Navigate through the slides, preloading images along the way
    // Needs enhancement of keypress
    function navigation(total) {

        // Phase 2 enhancement is adding keypress support

        console.log("The number of images in the gallery is " + total);

        $("nav a").on("click", function (e) {

            e.preventDefault();



            // The element, in this case a figure
            let element = jQuery("figure");

            // LOAD IMAGES *************************** //
            // Images load, in sequence, whether the 'next' or 'previous' buttons are clicked.

            // Total of already loaded images. Default is 2.
            let loaded_image_total = document.getElementsByTagName("img").length;

            // Set values for the eventual image request by pulling the
            // attributes from the elements initially added to the DOM.
            // The loaded_image_total variable will always be one less than we need.
            let preload_id = element.eq(loaded_image_total).attr("id");
            let preload_alt = element.eq(loaded_image_total).children("figcaption").text();

            // Unless all images are already loaded, request a single image
            if (loaded_image_total !== total){
                requestImage(preload_id, preload_alt);
            }

            let increment_value;

            // The index of the currently active element
            let active_element_index = $("figure.active").index();
            //console.log("The index of the currently active element: " + active_element_index);

            // Default to the action for the left (previous) navigation element
            increment_value = -1;

            // If the "next" link is clicked, change the increment value
            if ($(this).attr("id") === "next") {
                increment_value = 1;
                //console.log("increment_value: " + increment_value)
            }

            // The next or previous element in the sequence to make active
            let active_index = active_element_index + increment_value;
            //console.log("active_index: " + active_index);

            // Clear classes to start over
            element.removeClass("active");
            element.addClass("inactive").hide();

            // Add the active class to display the image
            if (active_index === total) {
                // If the active index is at the end, go back and activate the first element
                element.eq(0).removeClass("inactive");
                element.eq(0).addClass("active").fadeIn();
            } else {
                element.eq(active_index).removeClass("inactive");
                element.eq(active_index).addClass("active").fadeIn();
            }

            // Show the 'previous' button when there are more than half of the total images loaded
            // && active_element_index === 0
            console.log("total / 2: " + total / 2);
            console.log("loaded_image_total: " + loaded_image_total);
            if(loaded_image_total > (total / 2)) {
                document.querySelector("#prev").style.display = "block";
            }

            // Transition from first slide to the rest of the slides.
            // Obviously, this needs to be refined.
            if($(".active").index() !== 0) {
                $("h1").addClass("variation");
            } else {
                $("h1").removeClass("variation");
            }


        });
    }

    // Just returns the data from the initial request do that it can be used elsewhere.
    //function handleData(){}

    // Process the data externally by passing in a callback function
    function requestGalleryMembers(handleData) {
        $.ajax({
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
                $.each(data.photoset.photo, function (i, obj) {
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
    function requestImage (id, altText) {

        // Debug
        //d = new Date();
        //console.log("requestImage called. " + d.getTime());

        $.ajax({
            url: url_onephoto + id,
            type: "GET",
            cache: true,
            dataType: "jsonp", // why?
            async: false,
            success: function (data) {

                // Instantiate the size array
                let sizes_array = [];

                // Create a new image object
                let img = new Image();

                // The index of the sizes array to get the path from
                let size_index = 0;

                // Push the available widths into the array for comparison
                $.each(data.sizes.size, function (i, obj) {
                    //console.log(obj.width);
                    sizes_array.push(obj.width);
                });

                // Find the closest value in the array to the viewport's width.
                // This will determine which image size we request.
                const output = sizes_array.reduce(
                    (prev, curr) => Math.abs(curr - viewport_width) < Math.abs(prev - viewport_width) ? curr : prev
                );

                // Get the index of the chosen resolution in order to choose the right image source.
                $.each(data.sizes.size, function (i, obj) {
                    if (output === obj.width) {
                        size_index = i;
                    }
                });

                // Add attributes to the image object
                $(img).attr({
                    src: data.sizes.size[size_index].source,
                    alt: altText
                });

                // Append the element in the proper ID location
                $("figure#" + id).append(img);

            },
            error: function () {
                console.log("Data was not retrieved.");
            }
        });
    }

    // Add the figures into the DOM, loaded with the IDs and captions from the initial API request
    // imageid = The individual photo ID
    // captiontext = The individual photo caption text
    function addFigures (imageid, captiontext, x) {
        let figcaption = $("<figcaption>").text(captiontext + " (" + x + ")");
        let figure = $("<figure>", {
                        id: imageid,
                        class: "inactive"
                        });
        figure.append(figcaption);
        $("#gallery").append(figure);
    }

    // Place arrows based on window size
    function placeArrows(h) {
        let controloffset = document.getElementById("next").offsetHeight;
        let arrowposition = Math.floor(((h - controloffset) / 2)) + "px";
        // Debug
        //console.log("controloffset=" + controloffset + ", arrowposition=" + arrowposition);
        $("nav a").css("top", arrowposition);
    }

    // Display the gallery title
    function galleryTitle(title) {
        if (title) {
            $("h1").text(title);
        } else {
            $("h1").text("Album Title Missing");
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
            if(params.has("id")) {
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