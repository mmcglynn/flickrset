// To EXCLUDE jsonFlickrApi wrapper
// nojsoncallback=1
// To INCLUDE jsonFlickrApi wrapper
// jsoncallback=? 

var flickr_id_array = [];
var flickr_title_array = [];

var winWidth = window.innerWidth;

var flickrImageSize = 0;

// Set request resolution for flickr request
if (winWidth < 320) {
    flickrImageSize = 3;
} else if (winWidth < 500) {
    flickrImageSize = 4;
} else if (winWidth < 640) {
    flickrImageSize = 5;
} else if (winWidth < 800) {
    flickrImageSize = 6;
} else if (winWidth < 1024) {
    flickrImageSize = 7;
} else if (winWidth < 1440) {
    flickrImageSize = 8;
} else if (winWidth < 1920) {
    flickrImageSize = 9;
} else {
    flickrImageSize = 2;
}

// Debugging
// console.log('winWidth: ' + winWidth);
// console.log('flickrImageSize: ' + flickrImageSize);

// Set API path
var api = 'https://api.flickr.com/services/rest/';

// Provide API key
var api_key = '7ec3fd13ea8480e8a098bd82a474723a';

// Place arrows on INITIAL images load
// Should we worry about subsequent images?
function placeArrows() {
    // Place arrow navigation
    var arrowHeight = $('nav a').height(),
        arrowBound = parseInt($('h1').height()) + parseInt($('figure').height());
    $('nav a').css('top', (arrowBound / 2) + 'px');
}

// Display the gallery title
function gallery_title(ajax_data) {
    if (ajax_data.photoset.title) {
        $('h1').text(ajax_data.photoset.title);
    } else {
        $('h1').text('Album Title Missing');
    }
}


var requestImageSimple = function (id, altText) {

    $.ajax({
        url: api + '?method=flickr.photos.getSizes&api_key=' + api_key + '&photo_id=' + id + '&format=json&jsoncallback=?',
        type: "GET",
        cache: true,
        dataType: 'jsonp',
        async: true,
        success: function (data) {

            // Create a new image object
            var img =  new Image();
            $(img).attr({
                src: data.sizes.size[flickrImageSize].source,
                alt: altText
            });

            // Add these to the UI
            $('figure').append(img);

        },
        error: function () {
            console.log('Image was not retrieved.');
        }
    });
};


// Get the individual image
// This is the current problem in that images
// are not being downloaded sequntially.
// please test as async = false
var requestImage = function (id, altText, callback, isFirst) {

    $.ajax({
        url: api + '?method=flickr.photos.getSizes&api_key=' + api_key + '&photo_id=' + id + '&format=json&jsoncallback=?',
        type: "GET",
        cache: true,
        dataType: 'jsonp',
        async: true,
        success: function (data) {

            // Create a new image object
            var img =  new Image();
            $(img).attr({
                src: data.sizes.size[flickrImageSize].source,
                alt: altText
            });

            // Add these to the UI
            $('figure').append(img);
            $('figcaption').text(altText);

            //console.log(img);

            // If is the first image, run the callback function 
            // that loads the rest of the images
            if (isFirst) {
                $(img).load(function () {
                    console.log('image has loaded');
                    $(this).addClass('active');
                    placeArrows();
                    callback();
                });
            }

        },
        error: function () {
            console.log('Image was not retrieved.');
        }
    });
};

// Once the image data has been determined,
// requested the correct resolution from the server
function handlePhotosArray(photos) {

    // id, altText, callback, isFirst
    requestImage(photos[0][0], photos[0][1], function () {
        console.log('callback called');
        $.each(photos, function (i, obj) {
            console.log(obj[0] + ', ' + obj[1]);
            
            setTimeout(function(){ 
                requestImage(obj[0], obj[1], false);
            }, 6000);
            
            
        });
    }, true);

}

function navigation(total) {

    $('#next').on('click', function (e) {

    e.preventDefault();

    // Determine the next image on the list
    var next_index = ($('img.active').index());

    console.log(next_index);

    // Remove all class instances
    $('img').removeClass('active');

    // If the active image is the last in the sequence
    if (next_index > total) { next_index = 0; }

    // Activate the next image
    $('img:eq(' + next_index + ')').addClass('active');

    // Write the caption
    // next = next + 1;
    //$('figcaption').text(flickr_title_array[next]);
    // Write the caption
    //$('figcaption').text(flickr_title_array[next_index]);

    });
    
    
    $('#prev').on('click', function (e) {
        e.preventDefault();

        if ($('img').length === 1) { return; }

        var prev_index = ($('img.active').index()) - 1;

        // Using 3 for testing only
        if (prev_index === -1) { prev_index = (photo_total - 1); }

        console.log('prev_index: ' + prev_index);

        // Write the caption
        $('figcaption').text(flickr_title_array[prev_index]);

        // Move the class backward
        $('img').removeClass('active');
        $('img:eq(' + prev_index + ')').addClass('active');

    });
    
}

$(document).ready(function () {
    
    // Get gallery title and photos
    // Why jsonp?
    $.ajax({
        url: api + '?method=flickr.photosets.getPhotos&api_key=' + api_key + '&photoset_id=72157686731900515&format=json&jsoncallback=?',
        type: 'GET',
        cache: true,
        dataType: 'jsonp',
        async: true,
        success: function (data) {
            gallery_title(data);
            
            var photosArray = [];
            
            $.each(data.photoset.photo, function (i, obj) {
                photosArray.push([obj.id, obj.title]);
                //console.log(obj.title);
            });
            
            console.log(photosArray.length);
            
            navigation(photosArray.length);
            
            handlePhotosArray(photosArray);
        },
        error: function () {
            console.log('Getting gallery photos has failed.');
        }
    });
    
});


$(window).on('load', function () {});
