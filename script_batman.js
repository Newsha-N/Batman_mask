let video;
let latestpredictions = null;
let batmask;
let ImBatman;
let smile; 

const NOSE_POINT = 0;
const LEFT_SIDE = 177 ; 
const RIGHT_SIDE= 401;
//p5 function preloads the mask and imbatman audio
function preload(){
    batmask = loadImage('assets/bati.png');
    soundFormats('mp3', 'ogg');
    ImBatman = loadSound('assets/im-batman.mp3');
    smile = loadSound('assets/beautiful.mp3');
}
function setup()
{
    let port = createCanvas(640 , 480);
    video = createCapture(VIDEO);
    video.size(width, height);
    
    let facemesh = ml5.facemesh(video, () => {console.log("Model is ready!")});
    facemesh.on("predict" , (results) =>{ //console.log(results[0]); 
        latestpredictions =  results[0]; });
    // results is an array that prints the predictions of the ml5 for finding the points on the face
    // the array consists of the object of the face dots
    video.hide();
}

// p5 function
function draw()
{
    // not gonna draw anything until the first prediction comes in 
    // this statement is necessary since the latestpredictions are gonna be empty and have not yet 
    //let flippedVideo = ml5.flipImage(video);

    if (latestpredictions == null)
    return;
    // draw webcam video
    image(video , 0 , 0, width, height);

    // get forhead location
    let nosetiplocation = latestpredictions.scaledMesh[NOSE_POINT];
    let leftlocation = latestpredictions.scaledMesh[LEFT_SIDE];
    let rightlocation = latestpredictions.scaledMesh[RIGHT_SIDE];
    let facecheek = dist (leftlocation[0], leftlocation[1] , rightlocation[0] , rightlocation[1]);
    
    let batEars = (batmask.height / batmask.width * facecheek);
    let lefteye_y  = latestpredictions.scaledMesh[133];
    let righteye_y = latestpredictions.scaledMesh[362];
    

    let upperlip = latestpredictions.scaledMesh[0];
    let lowerlip = latestpredictions.scaledMesh[17];

    let lipdis = Math.abs(upperlip[1] - lowerlip[1]);
    if(lipdis > 50 && !ImBatman.isPlaying() && !smile.isPlaying())
    {
        ImBatman.play()
    }
  
    let leftsmile = latestpredictions.scaledMesh[61];
    let rightsmile = latestpredictions.scaledMesh[291];
    let smilelength = Math.abs(leftsmile[0] - rightsmile[0]);

    if(smilelength > 65 && !ImBatman.isPlaying() && !smile.isPlaying())
    {
        smile.play()
    }
        
                imageMode(CENTER);

                image(batmask,  nosetiplocation[0] , nosetiplocation[1] - batEars/2, facecheek*1.15 , batEars);
                imageMode(CORNER);
                light = false;
            imageMode(CORNER);
       

    let eyeholeMask = createEyeholeMask();
    let webcamCopy = video.get(); // get a new copy of the webcam image
    webcamCopy.mask(eyeholeMask); // apply the eyehole mask
    image(webcamCopy, 0, 0, width, height); // draw eye on top of the full face covering
    
    
}
// this function shows the batman's eyes
function createEyeholeMask() {
    let eyeholeMask = createGraphics(width, height); // draw into a "graphics" object instead of the canvas directly
    eyeholeMask.background("rgba(255,255,255,0)"); // transparent background (zero alpha)
    eyeholeMask.stroke('black');
  
    // get the eyehole points from the facemesh
    let rightEyeUpper = latestpredictions.annotations.rightEyeUpper1;
    let rightEyeLower = [
      ...latestpredictions.annotations.rightEyeLower1,
    ].reverse(); /* note that we have to reverse one of the arrays so that the shape draws properly */
  
    
    // draw the actual shape
    eyeholeMask.beginShape();
    // draw from left to right along the top of the eye
    rightEyeUpper.forEach((point) => {
      eyeholeMask.curveVertex(point[0 /* x */], point[1 /* y */]); // using curveVertex for smooth lines
    });
    // draw back from right to left along the bottom of the eye
    rightEyeLower.forEach((point) => {
      eyeholeMask.curveVertex(point[0 /* x */], point[1 /* y */]);
    });
    
    // clearing the left eye with the same code

    let leftEyeUpper = latestpredictions.annotations.leftEyeUpper1;
    let leftEyeLower = [
      ...latestpredictions.annotations.leftEyeLower1,
    ].reverse();
    eyeholeMask.endShape(CLOSE); // CLOSE makes sure we join back to the beginning
  
        eyeholeMask.beginShape();
        leftEyeUpper.forEach((point) => {

        eyeholeMask.curveVertex(point[0] , point[1]);

    });
    leftEyeLower.forEach((point) => {
        eyeholeMask.curveVertex(point[0 /* x */], point[1 /* y */]);
      });
      eyeholeMask.endShape(CLOSE);
    return eyeholeMask;
  }

  