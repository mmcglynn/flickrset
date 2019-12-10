// To EXCLUDE jsonFlickrApi wrapper
// nojsoncallback=1
// To INCLUDE jsonFlickrApi wrapper
// jsoncallback=? 

//let flickr_id_array = [];
//let flickr_title_array = [];

// Add the navigation to the DOM.
// This placement is calculated based on the viewport.
placeArrows();

// The ID of the gallery, which at some point won't be hard coded
const photoset_id = '72157632825799227';
//const photoset_id = '72157686731900515';

// The current screen resolution
const viewport_width = window.innerWidth;

// Set API path
const api = 'https://api.flickr.com/services/rest/';

// Provide API key
const api_key = '7ec3fd13ea8480e8a098bd82a474723a';

// API request URL for an individual photo
// https://www.flickr.com/services/api/flickr.photos.getSizes.html
const url_onephoto =  `${api}?method=flickr.photos.getSizes&api_key=${api_key}&format=json&jsoncallback=?&photo_id=`;

// API request URL for all photo sin the gallery
// https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
const url_allphotos = `${api}?method=flickr.photosets.getPhotos&api_key=${api_key}&photoset_id=${photoset_id}&format=json&jsoncallback=?`;

// Run when DOM is ready
$(document).ready(function () {

    getGalleryMembers(function(output){

        // The integer of the last index in the photos array
        let last_index_value = output.length;

        // Loop through the created gallery photo array
        $.each(output, function (index, item) {
            // Add the slide containers, which in this case are figures and figcaptions
            addFigures(item[0],item[1])
        });

        $("figure:first").addClass("active");

        // Populate first two images
        requestImage(output[0][0],output[0][1]);
        requestImage(output[1][0],output[1][1]);

        // Pass the array's length to the navigation function
        navigation(last_index_value);

    });

});

// This is up for grabs now
function navigation(total) {

    // Phase 2 enhancement is adding keypress support

    $("nav a").on("click", function (e) {
        e.preventDefault();

        // The element
        let element = $("figure");

        // The index of the currently active element
        let active_element_index = $("figure.active").index();

        // Default to the action for the left (previous) navigation element
        let increment_value = -1;

        // If the "next" link is clicked, change the increment value
        if ("next" == $(this).attr("id")) {
            increment_value = 1;

            // Load Images **************** //

            // Total of already loaded images
            let loaded_image_total = $("figure img").length;

            // Since two images are initially loaded, the next image to load
            // is two ahead of the currently active slide.
            // This is to make a smooth and responsive UI
            let next_image_index = active_element_index + 2;

            // Set values for the eventual image request
            let preload_id = element.eq(next_image_index).attr("id");
            let preload_alt = element.eq(next_image_index).children("figcaption").text();

            // Load an image unless all images are already loaded
            if (loaded_image_total != total){
                requestImage(preload_id, preload_alt);
            } else {
                console.log("All images have loaded.");
            }

        }

        // The next or previous element in the sequence to make active
        let active_index = active_element_index + increment_value;

        // Clear classes to start over
        element.removeClass('active');

        // If the active element is at then, activate the first element
        if (active_index === total) {
            element.eq(0).addClass("active");
        } else {
            element.eq(active_index).addClass("active");
        }

    });

}

// Just returns the data from the initial request do that it can be used else where.
// This is just a proof of concept function.
// What we really want to do is request in the individual photo's data based on the ID from the initial request.
function handleData(){}

// Process the data externally by passing in a callback function
function getGalleryMembers(handleData) {
    $.ajax({
        url: url_allphotos,
        type: 'GET',
        cache: true,
        dataType: 'jsonp',
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
            console.log('Getting gallery photos has failed.');
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

            // Find the closest value in the array to the viewpots width.
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
            console.log('Data was not retrieved.');
        }
    });
}

// Add the figures into the DOM, loaded with the IDs and captions from the initial API request
// imageid = The individual photo ID
// captiontext = The individual photo caption text
function addFigures (imageid, captiontext) {
    let $figcaption = $("<figcaption>").text(captiontext);
    let $figure = $("<figure>", {id: imageid}).append($figcaption);
    $("#gallery").append($figure);
}

// Place arrows on INITIAL images load
// Should we worry about subsequent images, i.e. be calculated each time?
function placeArrows() {
    // Place arrow navigation
    let viewportheight = window.innerHeight;
    let controloffset = $("#next").height();
    let arrowposition = ((viewportheight / 2) - controloffset) + "px";
    $('nav a').css('top', arrowposition);
}

// Display the gallery title
function galleryTitle(title) {
    if (title) {
        $('h1').text(title);
    } else {
        $('h1').text('Album Title Missing');
    }
}