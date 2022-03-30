const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const btns = document.getElementsByClassName('button');
const cb = document.getElementsByClassName('checkbox')

const canvasCtx = canvasElement.getContext('2d');

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


let lmListKeys = [];
let handDetails = {};
let myHand = [];
let press = false;
let side = "";
let person_number;
let hand_picture = "";
let picture_url = '';
let csv_url = ""

const setSide = (i) => {
    cb[i].setAttribute('checked', true)
    switch (i){
        case 0:
            side = "right"
            break;
        case 1:
            side = "top"
            break;
        case 2:
            side = "front"
            break;
        case 3:
            side = "left"
            break;
        default:
            return;
    }
}

function convertToCSV(arr) {
    const array = [Object.keys(arr[0])].concat(arr)

    return array.map(it => {
        return Object.values(it).toString()
    }).join('\n')
}

function downloadToCSV(array) {
    var element = document.createElement('a');
    element.href = 'data:text/csv;charset=utf-8,' + encodeURI(array);
    element.target = '_blank';
    element.download = csv_url;
    element.click();
}

function exportCanvasAsPNG() {
    let canvasElement = document.getElementsByClassName('output_canvas')[0];
    let MIME_TYPE = "image/png";
    let imgURL = canvasElement.toDataURL(MIME_TYPE);

    let dlLink = document.createElement('a');
    dlLink.download = picture_url;
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
}

function getHandImage(results) {
    for (let i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', () => {
            press = true;
            setSide(i);
        })
    }

    if (press == true){
        let startDate = new Date();
        picture_url = `JS_testpersoon_${document.getElementById('pnum').value}_${document.getElementById('hs').value}_${side}_${startDate.toLocaleDateString("nl")}.png`
        csv_url = `JS_testpersoon_${document.getElementById('pnum').value}_${document.getElementById('hs').value}_${side}_${startDate.toLocaleDateString("nl")}.csv`
        drawLMarks(results);
        let endDate = new Date();

        downloadToCSV(convertToCSV(myHand))
        exportCanvasAsPNG()

        console.log((endDate.getTime() - startDate.getTime()) / 1000);
    }

    press = false;
}

function drawLMarks(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    console.log(canvasElement.width, canvasElement.height)

    if (results.multiHandLandmarks) {

        for (let i = 0; i < results.multiHandedness.length; i++) {
            handDetails['score'] = results.multiHandedness[i].score
            if (results.multiHandedness[i].label == "Right"){
                handDetails['type'] = "Left"
            } else {
                handDetails['type'] = "Right"
            }
        }

        for (const lMarks of results.multiHandLandmarks) {
            for(const key of lMarks.keys()) {
                lmListKeys.push(key);
            }

            drawConnectors(canvasCtx, lMarks, HAND_CONNECTIONS,
                {color: 'grey', lineWidth: 5});
            drawLandmarks(canvasCtx, lMarks, {color: '#FF0000', lineWidth: 2});

            for (let i = 0; i < lMarks.length; i++) {
                myHand.push({"hand_type": handDetails['type'], "hand_score": handDetails['score'], "landmark_name": lmNames[i], "landmark_id": lmListKeys[i], "x_value": parseInt(lMarks[i]['x'] * canvasElement.width),
                "y_value": parseInt(lMarks[i]['y'] * canvasElement.height), "z_value": parseInt(lMarks[i]['z'] * canvasElement.width), "test_date": new Date().toLocaleDateString("nl"), "image": picture_url})
            }
        } 
    }
    console.log(picture_url)
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