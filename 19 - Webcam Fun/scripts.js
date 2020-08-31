(() => {
    const video = document.querySelector('.player');
    const canvas = document.querySelector('.photo');
    const ctx = canvas.getContext('2d');
    const strip = document.querySelector('.strip');
    const snapSound = document.querySelector('.snap');

    const greenScreenInput = document.querySelectorAll('.rgb input');
    const coloringSwitch = document.querySelector('#coloringSwitch');
    const greenscreenSwitch = document.querySelector('#greenscreenSwitch');
    const splitSwitch = document.querySelector('#splitSwitch');

    function takeVideo() {
        // ask the user for permission for video use
        // returns a promise containing a MediaStream
        // note: navigator interface is a representation of the application
        // in which the JavaScript code is running (in most cases, the browser)
        navigator.mediaDevices.getUserMedia({audio: false, video: true})
            .then(mediaStream => {
                // note that before a <video> element required a src with a url
                // thus we need to create an object URL for the MediaStream using window.URL.createObjectURL
                // this has been deprecated. Now just set srcObject to the MediaStream directly.
                video.srcObject = mediaStream;
                video.play();
            })
            .catch(err => {
                console.error(`unable to initialize video: ${err}`);
                window.alert('Allow the video!');
            });
    }

    function paintToCanvas() {
        const width = video.videoWidth;
        const height = video.videoHeight;

        // set canvas dimensions to match the video stream
        // otherwise a part of the video would be cut off
        canvas.width = width;
        canvas.height = height;

        // setInterval is needed because we want the canvas to follow the video
        // a small timeout is placed to have a smoother effect
        setInterval(() => {
            // draw the video onto canvas
            // put the video at coordinate (0, 0). The image should have its original dimensions
            ctx.drawImage(video, 0, 0, width, height);

            manipulateCanvas(width, height);
        }, 100);
    }

    function manipulateCanvas(width, height) {
        const addGreenScreen = greenscreenSwitch.checked;
        const addColoring = coloringSwitch.checked;
        const addSplit = splitSwitch.checked;

        console.log(addGreenScreen, addColoring, addSplit);

        // gets pixel from (0, 0) to (width, height) part of the canvas, returns a ImageData object
        // https://www.w3schools.com/tags/canvas_getimagedata.asp
        // ImageData.data is an array of the 4 pixels data (all pixels inside of the rectangle of the canvas specified)
        // 4 pixel data: each pixel has 4 values, RGBA (A = The alpha channel (from 0-255; 0 is transparent and 255 is fully visible))
        // so the 1st value in that array is the R of the 1st pixel, 2nd value is the G of the 2nd pixel, etc.
        let imagePixel = ctx.getImageData(0, 0, width, height);

        if (addGreenScreen) {
            imagePixel = greenscreen(imagePixel);
        } else if (addColoring) {
            imagePixel = color(imagePixel);
        } else if (addSplit) {
            imagePixel = split(imagePixel);
        }

        ctx.putImageData(imagePixel, 0, 0);
    }

    function split(imagePixel) {
        /*
        Split works by shifting the pixel for a certain position
         */

        for (let i = 0; i < imagePixel.data.length; i += 4) {
            imagePixel.data[i - 150] = imagePixel.data[i + 0]; // RED
            imagePixel.data[i + 500] = imagePixel.data[i + 1]; // GREEN
            imagePixel.data[i - 550] = imagePixel.data[i + 2]; // Blue
        }

        return imagePixel;
    }

    function color(imagePixel) {


        for (let i = 0; i < imagePixel.data.length; i += 4) {
            imagePixel.data[i + 0] = imagePixel.data[i + 0] + 100; // RED
            imagePixel.data[i + 1] = imagePixel.data[i + 1] - 50; // GREEN
            imagePixel.data[i + 2] = imagePixel.data[i + 2] * 0.25; // Blue
        }

        return imagePixel;
    }

    function greenscreen(imagePixel) {
        /*
        Greenscreen works by withdrawing certain colors between a chosen color range,
        making them transparent to show whatever is behind them
         */

        let greenScreenInputLevel = {};

        greenScreenInput.forEach(range => {
            greenScreenInputLevel[range.name] = range.value;
        });

        for (let i = 0; i < imagePixel.data.length; i += 4) {
            const red = imagePixel.data[i]
            const green = imagePixel.data[i + 1]
            const blue = imagePixel.data[i + 2]

            if (red >= greenScreenInputLevel.rmin && red <= greenScreenInputLevel.rmax &&
                green >= greenScreenInputLevel.gmin && green <= greenScreenInputLevel.gmax &&
                blue >= greenScreenInputLevel.bmin && blue <= greenScreenInputLevel.bmax) {
                // make it transparent (for greenscreen)
                imagePixel.data[i + 3] = 0;
            }
        }

        return imagePixel;
    }

    function takePhoto() {
        snapSound.currentTime = 0;
        snapSound.play();

        // take the data out of canvas, the image is in base64
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
        // the default quality for image is used (0.92) instead of 1.0
        const imageData = canvas.toDataURL('image/jpeg');

        // display the image taken
        const imageLink = document.createElement('a');
        imageLink.href = imageData;
        imageLink.download = 'drawnPicture';    // set it to be downloaded when a user clicks on the link, with a name
        imageLink.innerHTML = `<img src="${imageData}" alt="The Canvas Picture"/>`;
        strip.insertBefore(imageLink, strip.firstChild);   // display them in reverse order
    }

    // get the video stream on page load
    takeVideo();

    // add to canvas when the video is ready
    video.addEventListener('canplay', paintToCanvas);

    document.querySelector(".takePhoto").addEventListener("click", takePhoto);

})();
