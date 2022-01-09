// Connection object
const Config = {

    static_allPhotosets: 'json/allphotosets.json',
    static_allPhotosetPhotos: 'json/allphotosetphotos.json',

    // Set API path
    api: "https://api.flickr.com/services/rest/",

    // Provide the API key
    api_key: "7ec3fd13ea8480e8a098bd82a474723a",

    // API request URL for all photosets by user
    // https://www.flickr.com/services/api/flickr.photosets.getList.html
    allPhotoSets: function() {
        "use strict";
      return `${this.api}?method=flickr.photosets.getList&api_key=${this.api_key}&user_id=8110271%40N05&format=json&&per_page=12&nojsoncallback=1`;
    },

    // API request URL for all photos in the gallery
    // Documentation: https://www.flickr.com/services/api/flickr.photosets.getPhotos.html
    allPhotosetPhotos: function(photoset_id) {
        "use strict";
     return `${this.api}?method=flickr.photosets.getPhotos&api_key=${this.api_key}&photoset_id=${photoset_id}&format=json&nojsoncallback=1`;
    },

    // API request URL for an individual photo
    // https://www.flickr.com/services/api/flickr.photos.getSizes.html
    singlePhoto: function(id) {
        "use strict";
     return `${this.api}?method=flickr.photos.getSizes&api_key=${this.api_key}&format=json&nojsoncallback=1&photo_id=${id}`;
    }
};

// UI functions ------------------------

// document.addEventListener('DOMContentLoaded', (event) => {
//     console.log('DOM fully loaded and parsed');
// });

// Build the cards for the landing page
const UILanding = (arr) => {
    'use strict';
    arr.forEach((element) => {

        // Build each article
        let article = document.createElement('article');
        article.id = element.id;
        // header
        let header = document.createElement('header');
        header.style.backgroundImage = 'url(' + element.thumbnail + ')';
        article.append(header);
        // button
        let a = document.createElement('a');
        a.href = 'data-only.html#' + element.id;
        a.addEventListener('click', function(){
            // Change to gallery view
            getAllPhotoSetPhotos(element.id);
        }, true);
        a.append(element.title);
        header.append(a);
        // div
        let div = document.createElement('div');
        header.after(div);
        // h3
        let section_h3 = document.createElement('h3');
        section_h3.innerText = element.title;
        // description
        let section_p = document.createElement('p');
        section_p.innerText = element.description;
        // link
        let section_a = document.createElement('a');
        section_a.innerText = 'See the photos';
        section_a.addEventListener('click', function(){
            // Change to gallery view
            getAllPhotoSetPhotos(element.id);
        }, true);
        div.append(section_h3, section_p, section_a);
        // footer
        let footer = document.createElement('footer');
        let footer_p1 = document.createElement('p');
        footer_p1.innerText = element.total + ' photos';
        let footer_p2 = document.createElement('p');
        footer_p2.innerText = convert_date(element.createddate);
        footer.append(footer_p1, footer_p2);

        // Assemble
        article.append(header, div, footer);
        document.querySelector('#gallery-index section').append(article);
    });
};

// Toggle the UI panels
const UIToggle = () => {
    'use strict';

    // Index panel
    const galleryindex = document.getElementById('gallery-index');
    if (galleryindex.classList.length > 0) {
        // Show the index and clear the gallery
        galleryindex.classList.remove('hide');
        document.querySelectorAll('#gallery section div').forEach(element => {
            element.remove();
        });
    } else {
        galleryindex.classList.add('hide');
    }

    // Gallery panel
    const gallery = document.getElementById('gallery');
    if (gallery.classList.length > 0) {
        // Show the gallery
        gallery.classList.remove('hide');
    } else {
        gallery.classList.add('hide');
    }
};

// Move slides in the specified direction
const UIChangeSlide = (direction) => {
  'use strict';
    //const direction = parseInt(d);
    console.log('direction: ' + direction);

    const slides = document.querySelectorAll('#gallery section div');

    const slidecount = slides.length;

    let currentindex, nextindex;

    slides.forEach(slide => {
        if( slide.classList.length === 0 ) {
            currentindex = parseInt(slide.dataset.order);
        }
    });

    nextindex = currentindex + direction;

    // Reached the end
    if ( nextindex === slidecount ) {
        nextindex = 0;
    }

    // Reached the beginning
     if ( currentindex === 0 && direction === -1 ) {
         nextindex = (slidecount - 1);
    }

    console.log('currentindex: ' + currentindex);
    console.log('nextindex: ' + (currentindex + direction));

    const nextslide = document.querySelector('[data-order="' + currentindex + '"]');
    nextslide.classList.add('hide');

    const prevslide = document.querySelector('[data-order="' + nextindex + '"]');
    prevslide.classList.remove('hide');

};

// Build the initial markup
(function(){
    'use strict';

    const galleryindex = document.getElementById('gallery-index');
    const gallery = document.getElementById('gallery');

    // header
    const h1 = document.createElement('h1');
    h1.innerText = 'flickr galleries';
    const header = document.createElement('header');
    header.id = 'indexheader';
    header.append(h1);

    // Landing section that contains the gallery cards
    const landingSection = document.createElement('section');

    // Gallery section for the individual gallery
    const gallerySection = document.createElement('section');

    // footer
    const footer = document.createElement('footer');
    footer.id = 'pagefooter';
    const h3 = document.createElement('h3');
    const slidetitle = document.createElement('p');
    slidetitle.id = 'slidetitle';
    const slidecount = document.createElement('p');
    slidecount.id = 'slidecount';
    const a = document.createElement('a');
    a.href = '#';
    a.innerText = 'All Galleries';
    a.addEventListener('click', UIToggle);
    const allgalleries = document.createElement('p');
    allgalleries.id = 'allgalleries';
    allgalleries.append(a);
    footer.append(h3,slidetitle,slidecount,allgalleries);
    gallerySection.append(footer);

    // Assemble
    galleryindex.append(header,landingSection);
    gallery.append(buildNavigation(),gallerySection);

})();

const populateFooter = (id) => {
    'use strict';
    const slide = document.getElementById(id);
    document.getElementById('slidetitle').innerText = slide.tabIndex;
    document.getElementById('slidecount').innerText = slide.dataset + ' of';
};

// Helper functions --------------------
// Format the date as supplied by flickr
const convert_date = unix_timestamp => {
    'use strict';
    let date = new Date(unix_timestamp * 1000);
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return months[date.getMonth()] + " " + date.getFullYear();
};

// Build the arrow navigation
function buildNavigation() {
    'use strict';

    // Previous link
    const prev_title = document.createElement('title');
    prev_title.innerText = 'Previous';
    const prev_path = document.createElementNS('http://www.w3.org/2000/svg','path');
    prev_path.setAttribute('d','M6.293 13.707l-5-5c-0.391-0.39-0.391-1.024 0-1.414l5-5c0.391-0.391 1.024-0.391 1.414 0s0.391 1.024 0 1.414l-3.293 3.293h9.586c0.552 0 1 0.448 1 1s-0.448 1-1 1h-9.586l3.293 3.293c0.195 0.195 0.293 0.451 0.293 0.707s-0.098 0.512-0.293 0.707c-0.391 0.391-1.024 0.391-1.414 0z');
    prev_path.classList.add('fill');
    const prev_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    prev_svg.setAttribute('viewBox','0 0 16 16');
    const prev_a = document.createElement('a');
    prev_a.href = '#';
    prev_a.id = 'prev';
    // Assemble
    prev_svg.append(prev_path,prev_title);
    prev_a.append(prev_svg);
    prev_a.addEventListener('click', (e) => {
        UIChangeSlide(-1);
    });

    // Next link
    const next_title = document.createElement('title');
    next_title.innerText = 'Next';
    const next_path = document.createElementNS('http://www.w3.org/2000/svg','path');
    next_path.classList.add('fill');
    next_path.setAttribute('d','M9.707 13.707l5-5c0.391-0.39 0.391-1.024 0-1.414l-5-5c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414l3.293 3.293h-9.586c-0.552 0-1 0.448-1 1s0.448 1 1 1h9.586l-3.293 3.293c-0.195 0.195-0.293 0.451-0.293 0.707s0.098 0.512 0.293 0.707c0.391 0.391 1.024 0.391 1.414 0z');
    const next_svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    next_svg.setAttribute('viewBox','0 0 16 16');
    const next_a = document.createElement('a');
    next_a.href = '#';
    next_a.id = 'next';
    // Assemble
    next_svg.append(next_path,next_title);
    next_a.append(next_svg);
    next_a.addEventListener('click', (e) => {
        UIChangeSlide(1);
    });

    const nav = document.createElement('nav');
    nav.append(prev_a,next_a);

    return nav;
}

// Get all photosets
async function getAllPhotoSets() {
    'use strict';
    const response = await fetch(Config.static_allPhotosets);
    //const response = await fetch(Config.allPhotoSets());
    return await response.json();
}
getAllPhotoSets().catch(err => {
    'use strict';
    console.log(err);
});
getAllPhotoSets().then(data => {
    'use strict';
    let photoSetsArr = [];

    // // Push the data for each photoset into an array
    for (let photoset of data.photosets.photoset) {
        photoSetsArr.push(
            {
                'thumbnail': 'https://live.staticflickr.com/' + photoset.server + '/' + photoset.primary + '_' + photoset.secret + '_m.jpg',
                'id': photoset.id,
                'title': photoset.title._content,
                'description': photoset.description._content,
                'createddate': photoset.date_create,
                'total': photoset.photos
            });
    }
    // Pass the data to the the UI function and build the cards
    UILanding(photoSetsArr);
});

// Request the photo data for the matching ID
function getAllPhotoSetPhotos(id) {
    'use strict';

    fetch(Config.allPhotosetPhotos(id))
        .then(response => response.json())
        .then(function (data) {
            //console.log(data);

            // Add the gallery name to the footer
            document.querySelector('#pagefooter h3').innerText = data.photoset.title;

            // Pass the photos to the UI function
            // Could this loop be done better?
            let i = 0;
            for (let photoset of data.photoset.photo) {
                buildSlides(photoset.id,photoset.title, i);
                i++;
            }

            //let firstslideid = document.querySelector('[data-order="0"]').id;
            //console.log(document.querySelectorAll('#gallery section div'));
            //populateFooter(firstslideid);

        })
        .catch(err => {
            console.log(err);
        })
        .finally(() => {
            UIToggle();
            //let firstslideid = document.querySelector('[data-order="0"]').id;
            //populateFooter(firstslideid);
        });
}

// Get the individual image from the getSizes method
// id - the id of the image
// title - the title of the image
// order - The preferred order
function buildSlides(id, title, order) {
    'use strict';
    fetch(Config.singlePhoto(id))
        .then(response => response.json())
        .then(function (data) {

            // Instantiate the size array
            let sizes_array = [];

            // Push the available widths into the array for comparison
            for (let obj of data.sizes.size) {
                sizes_array.push(obj.width);
            }

            // Find the closest value in the array to the viewport's width.
            // This will determine which image size is requested.
            const output = sizes_array.reduce(
                (prev, curr) => Math.abs(curr - window.innerWidth) < Math.abs(prev - window.innerWidth) ? curr : prev
            );

            // Get the index of the chosen resolution in order to choose the right image.
            let size_index = 0;
            for (let [i, obj] of data.sizes.size.entries() ) {
                if (output === obj.width) {
                    size_index = i;
                }
            }

            // Create the slide markup
            let slidediv = document.createElement('div');
            slidediv.id = id;
            slidediv.title = title;
            slidediv.innerText = title;
            slidediv.style.backgroundImage = 'url(' + data.sizes.size[size_index].source + ')';
            slidediv.setAttribute('data-order', order);

            // Hide all but the first slide.
            if (order > 0) {
                slidediv.classList.add('hide');
            }

            // Append the elements to the gallery container
            let gallery = document.querySelector('#gallery section');
            gallery.append(slidediv);
            //gallery.after(slidediv);

        })
        .catch(error => {
            console.warn(error);
        })
        .finally (() => {
            // Reorder the slides
            let divs = document.querySelectorAll('#gallery section div');
            let gallery = document.querySelector('#gallery section');
            // Add the DOM notes to the array
            let nodeArr = Array.from(divs);
            // Reorder the nodes based on the data order.
            // This solves the problem where the images are populated asynchronously,
            // thus displaying the images out of order and randomly so.
            nodeArr.sort((a, b) => a.dataset.order - b.dataset.order).forEach(el => {
                 gallery.appendChild(el);
            });
        });
}





