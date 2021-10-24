import React, { useEffect, useState } from 'react';
import "./styles.css";

import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import Notifier from "react-desktop-notification"
import { Button, Navbar, Nav, NavDropdown, Form, FormControl, Spinner, ButtonGroup } from 'react-bootstrap';
var classNames = require('classnames');

export default function App() {
  const [shoulderSlope, setShoulderSlope] = useState(0);
  const [shoulderSlopeOffset, setShoulderSlopeOffset] = useState(0);

  const [headSlope, setHeadSlope] = useState(0);
  const [headSlopeOffset, setHeadSlopeOffset] = useState(0);
  const [shoulderY, setShoulderY] = useState(0)
  const [shoulderYOffset, setShoulderYOffset] = useState(0)
  const webcamRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [numIssues, setNumIssues] = useState(-1)
  const [weights, setWeights] = useState([.15,.15,.15])

  const detectWebcamFeed = async (posenet_model) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      var count = parseInt(localStorage.getItem('count')) || 0
      var settings = (localStorage.getItem('settings') || ".15,.15,.15").split(",") //shoulder tilt, head tilt, slouch
      var shoulderTiltSetting = settings[0]
      var headTiltSetting = settings[1]
      var slouchSetting = settings[2]
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      // Make Estimation
      const pose = await posenet_model.estimateSinglePose(video);
      var leftS = pose["keypoints"][5]["position"]
      var rightS = pose["keypoints"][6]["position"]
      var shoulderSlope = (rightS['y'] - leftS['y']) / (rightS['x'] - leftS['x'])

      var shoY = Math.round((rightS['y'] + leftS['y']) / 2)
      setShoulderY(shoY)
      setShoulderYOffset(calcShoulderYOffset(shoY,slouchSetting))
      // setShoulderYOffset((shoY,slouchSetting))
      setShoulderSlope(Math.round(shoulderSlope * 100) / 100)
      setShoulderSlopeOffset(Math.round((shoulderTiltSetting - shoulderSlope) * 100) / 100)

      localStorage.setItem('shoulderSlope', Math.round(shoulderSlope * 100) / 100);

      var leftEar = pose["keypoints"][3]["position"]
      var rightEar = pose["keypoints"][4]["position"]
      var headSlope = (rightEar['y'] - leftEar['y']) / (rightEar['x'] - leftEar['x'])
      setHeadSlope(Math.round(headSlope * 100) / 100)
      setHeadSlopeOffset(Math.round((headTiltSetting - headSlope) * 100) / 100)


      var weights = (localStorage.getItem('weights') || ".15,.15,.15").split(",") //shoulder tilt, head tilt, slouch
      var shoulderTiltWeight = weights[0]
      var headTiltWeight = weights[1]
      var slouchWeight = weights[2]

      var tempweights = [];
      tempweights.push(shoulderTiltWeight)
      tempweights.push(headTiltWeight)
      tempweights.push(slouchWeight)
      setWeights(tempweights)

      var shoulderIssue = Math.abs(shoulderSlope - shoulderTiltSetting) > shoulderTiltWeight
      var headIssue = Math.abs(headSlope - headTiltSetting) > headTiltWeight
      var postureIssue = calcShoulderYOffset(shoY,slouchSetting) > slouchWeight

      var issuesArray = [];
      issuesArray.push(shoulderIssue ? 1 : 0)
      issuesArray.push(headIssue ? 1 : 0)
      issuesArray.push(postureIssue ? 1 : 0)
      localStorage.setItem('issues', issuesArray);
      var numissuescount = 0;
      for (var i = 0; i < issuesArray.length; i++) {
        if (issuesArray[i] == 1) {
          numissuescount = numissuescount + 1
        }
      }
      setNumIssues(numissuescount)

      if (shoulderIssue || headIssue || postureIssue) {
        count = count + 1
        localStorage.setItem('count', count);
      }
      if (count > 30) {
        console.log("sending notification")
        localStorage.setItem('count', 0) //reset count
        sendNotification()
      }
      drawResult(pose, video, videoWidth, videoHeight, canvasRef);
    }
  };
  
  const changeSetPrefs = () => {
    console.log("Saving settings")
    localStorage.setItem('count', 0) //reset count
    //save settings
    var newSettings = [];
    newSettings.push(shoulderSlope)
    newSettings.push(headSlope)
    newSettings.push(shoulderY)
    localStorage.setItem('settings', String(newSettings).replaceAll("[", "").replaceAll("]", ""));

  }

  const sendNotification = () => {
    Notification.requestPermission();
    Notifier.start("Check your posture", "You have been sitting poorly for the last minute. Consider repositioning", "", "data:image/png;base64,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");
  }

  const runPosenet = async () => {
    const posenet_model = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8
    });
    return posenet_model;
  };

  var model;
  runPosenet().then((posenet_model) => {
    model = posenet_model;
  });

  useEffect(() => {
    detectWebcamFeed(model);
    setInterval(() => {
      detectWebcamFeed(model);
    }, 1000);
  }, []);

  function calcShoulderYOffset(a,b){
    var output =  (Math.round(((a/25) - (b/25))*100)/100)
    console.log(output)
    return output
 
   }
  //calculate shoulder slope
  const drawResult = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;
    drawKeypoints(pose["keypoints"], .3, ctx);
  };

  function changeWeight(item,increment){ //0 - shoulder tilt , 1 - head tilt, 2 - slouch, boolean
    console.log(item + " t " + increment)
    var weights = (localStorage.getItem('weights') || ".15,.15,.15").split(",") //shoulder tilt, head tilt, slouch
    console.log(weights[1])
    console.log(weights)
    console.log(parseFloat(weights[1]))
    var shoulderTiltWeight =  Math.round(parseFloat(weights[0]) * 100) / 100
    var headTiltWeight =  Math.round(parseFloat(weights[1]) * 100) / 100
    var slouchWeight =  Math.round(parseFloat(weights[2]) * 100) / 100
    if(item == 0){ //shoulder tilt

      if(increment && shoulderTiltWeight <= .9){
        console.log("increasing")
        shoulderTiltWeight += .1;
      }else if(!increment && shoulderTiltWeight > .1){
        shoulderTiltWeight -= .1;
      }
    }else if(item == 1 ){ //head tilt
      if(increment &&  headTiltWeight <= .9){
        headTiltWeight += .1;
      }else if(!increment && headTiltWeight > .1){
        headTiltWeight -= .1;
      }
    }else if(item == 2){
      if(increment &&  slouchWeight <= .9){
        slouchWeight += .1;
      }else if(!increment && slouchWeight > .1){
        slouchWeight -= .1;
      }
    }
    var newWeights = [];
    newWeights.push(Math.round(parseFloat(shoulderTiltWeight) * 100) / 100)
    newWeights.push(Math.round(parseFloat(headTiltWeight) * 100) / 100)
    newWeights.push(Math.round(parseFloat(slouchWeight) * 100) / 100)
    console.log("new weights " + newWeights)
    setWeights(newWeights)
    localStorage.setItem('weights', String(newWeights).replaceAll("[", "").replaceAll("]", ""));
  }


  var statuses = new Map([
    [0, "Good"],
    [1, "Fair"],
    [2, "Bad"],
    [3, "Very Bad"],
  ]);
  var button1 = classNames(
    'primary',
    {
      'disabled': numIssues == -1
    }
  );
  var button2 = classNames(
    'danger',
    {
      'disabled': numIssues == -1
    }
  );
  let spinner;

  if (numIssues == -1) {
    spinner = <div>
      <br></br>
      <Spinner animation="border" variant="success" role="status">
      </Spinner>
      <br></br>
      <br></br>
      <h4 style={{ color: "#3ba853" }}>Starting up...</h4>
    </div>
  } else {
    spinner = <div></div>
  }

  return (
    <div className="App" >
   
      <header className="App-header" style={{ background: "#f8f9fa", borderRadius: "10px", padding: "15px", paddingTop: "20px", maxWidth: "800px", margin: "auto", marginTop: "30px" }}>
      <p className="heading">Posture<span className="vision">Vision</span></p>

        {spinner}


        <h3 style={{ display: numIssues == -1 ? "none" : "inline-block", }}>Posture&nbsp;</h3><h3 style={{ display: "inline-block", }}>{statuses.get(numIssues)}</h3>
        <br></br>
        <p>Shoulders = {shoulderSlopeOffset}</p>
        <p>Head = {headSlopeOffset}</p>
        <p>Shoulder Alignment = {shoulderYOffset}</p>
        <Button variant={button1} onClick={changeSetPrefs}>Set Preferred Posture</Button>{' '}
       
        
        <h1></h1>

        <br></br>
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "relative",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480
          }}
        />
        

         </header>
      
    </div>
  );
}

