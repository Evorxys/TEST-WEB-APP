import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { drawHand } from "./components/handposeutil";
import * as fp from "fingerpose";
import Handsigns from "./components/handsigns";

import {
  Text,
  Heading,
  Button,
  Box,
  VStack,
  ChakraProvider,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { RiCameraFill, RiCameraOffFill, RiRefreshFill } from "react-icons/ri";

export default function Home() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [camState, setCamState] = useState("on");
  const [detectedGesture, setDetectedGesture] = useState(null);
  const [inputText, setInputText] = useState("");

  async function runHandpose() {
    const net = await handpose.load();
    setInterval(() => {
      detect(net);
    }, 150);
  }

  async function detect(net) {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const hands = await net.estimateHands(video);

      if (hands.length > 0) {
        const GE = new fp.GestureEstimator([
          Handsigns.aSign,
          Handsigns.bSign,
          Handsigns.cSign,
          Handsigns.dSign,
          Handsigns.eSign,
          Handsigns.fSign,
          Handsigns.gSign,
          Handsigns.hSign,
          Handsigns.iSign,
          Handsigns.jSign,
          Handsigns.kSign,
          Handsigns.lSign,
          Handsigns.mSign,
          Handsigns.nSign,
          Handsigns.oSign,
          Handsigns.pSign,
          Handsigns.qSign,
          Handsigns.rSign,
          Handsigns.sSign,
          Handsigns.tSign,
          Handsigns.uSign,
          Handsigns.vSign,
          Handsigns.wSign,
          Handsigns.xSign,
          Handsigns.ySign,
          Handsigns.zSign,
        ]);

        const estimatedGestures = await GE.estimate(hands[0].landmarks, 6.5);
        console.log("Estimated Gestures:", estimatedGestures);

        if (estimatedGestures.gestures && estimatedGestures.gestures.length > 0) {
          estimatedGestures.gestures.forEach((gesture, index) => {
            console.log(`Gesture ${index}:`, gesture);
          });

          // Find the gesture with the highest confidence
          const maxConfidenceGesture = estimatedGestures.gestures.reduce(
            (prev, current) => (prev.score > current.score ? prev : current),
            estimatedGestures.gestures[0]
          );

          if (maxConfidenceGesture && maxConfidenceGesture.name) {
            console.log("Selected Gesture:", maxConfidenceGesture);
            setDetectedGesture(maxConfidenceGesture.name);
            setInputText((prevText) => prevText + maxConfidenceGesture.name);
          } else {
            console.log("Gesture detected but 'name' is undefined or missing.");
          }
        } else {
          console.log("No gestures detected.");
        }
      } else {
        console.log("No hands detected.");
      }

      const ctx = canvasRef.current.getContext("2d");
      drawHand(hands, ctx);
    }
  }

  useEffect(() => {
    runHandpose();
  }, []);

  function turnOffCamera() {
    setCamState((prev) => (prev === "on" ? "off" : "on"));
  }

  function resetInput() {
    setInputText("");
  }

  return (
    <ChakraProvider>
      <Box bgColor="#2D3748" height="100vh" color="white">
        <VStack spacing={4} align="center" mt={5}>
          <Heading as="h1" size="xl">Hand Gesture Recognition</Heading>
          <Text fontSize="lg">Detected Gesture: {detectedGesture || "None"}</Text>

          <Box position="relative" mb={4}>
            {camState === "on" ? (
              <Webcam ref={webcamRef} />
            ) : (
              <Box background="black" height="480px" width="640px"></Box>
            )}
            <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
          </Box>

          <Input
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            width="300px"
          />
          <Button colorScheme="blue" onClick={resetInput}>Reset Input</Button>

          <IconButton
            icon={camState === "on" ? <RiCameraFill /> : <RiCameraOffFill />}
            onClick={turnOffCamera}
            colorScheme="orange"
            aria-label="Toggle Camera"
          />
          <IconButton
            icon={<RiRefreshFill />}
            colorScheme="green"
            aria-label="Reset"
            onClick={resetInput}
          />
        </VStack>
      </Box>
    </ChakraProvider>
  );
}
