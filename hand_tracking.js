const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
let lmListKeys = [];
let myLmList = [];
const lmNames = ["WRIST",
"THUMB_CMC",
"THUMB_MCP", 
"THUMB_IP", 
"THUMB_TIP",
"INDEX_FINGER_MCP",
"INDEX_FINGER_PIP",
"INDEX_FINGER_DIP",
"INDEX_FINGER_TIP",
"MIDDLE_FINGER_MCP",
"MIDDLE_FINGER_PIP",
"MIDDLE_FINGER_DIP",
"MIDDLE_FINGER_TIP",
"RING_FINGER_MCP",
"RING_FINGER_PIP",
"RING_FINGER_DIP",
"RING_FINGER_TIP",
"PINKY_MCP",
"PINKY_PIP",
"PINKY_DIP",
"PINKY_TIP"]

let myHand = {};
let press = false;


function getHandImage(results) {
    if (press == false) {
        document.addEventListener('keydown', function(event) {
            if(event.key == 's'){
                press = true;
            }
        })
    }

    if (press == true){
        let startDate = new Date();
        drawLMarks(results);
        let endDate = new Date();

        console.log((endDate.getTime() - startDate.getTime()) / 1000);
    }

    myHand = []
    myLmList = []
    press = false;
}

function drawLMarks(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {

        for (let i = 0; i < results.multiHandedness.length; i++) {
            myHand['score'] = results.multiHandedness[i].score
            if (results.multiHandedness[i].label == "Right"){
                myHand['type'] = "Left"
            } else {
                myHand['type'] = "Right"
            }
        }

        for (const lMarks of results.multiHandLandmarks) {
            for(const key of lMarks.keys()) {
                lmListKeys.push(key);
            }

            for (let i = 0; i < lMarks.length; i++) {
                myLmList.push({"id": lmListKeys[i], "name": lmNames[i], "x_value": parseInt(lMarks[i]['x'] * canvasElement.width),
                "y_value": parseInt(lMarks[i]['y'] * canvasElement.height), "z_value": parseInt(lMarks[i]['z'] * canvasElement.width)})
            }
            myHand["lmList"] = myLmList;
            drawConnectors(canvasCtx, lMarks, HAND_CONNECTIONS,
                {color: '#00FF00', lineWidth: 5});
            drawLandmarks(canvasCtx, lMarks, {color: '#FF0000', lineWidth: 2});
        } 
    }
    console.log(myHand);
    canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(getHandImage);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
});
camera.start();