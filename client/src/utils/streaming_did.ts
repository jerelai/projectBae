import { useState, useRef, useContext } from 'react';
import config from 'config';
import { AppContext } from 'contexts';

interface ICharacter {
  name: string,
  image: string,
  idleAnimation: string,
  voice: string,
  style: string,
  happyIndex: number, // 0 - 4 // how about float value?
  background: string
}

const useDidStream = () => {
  const DID_API_KEY = config.DID_API_KEY;
  const DID_API_URL = "https://api.d-id.com";
  const maxRetryCount = 3;
  const maxDelaySec = 4;

  const context = useContext(AppContext);

  // @ts-ignore
  const RTCPeerConnection = ( window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection ).bind(window);

  let peerConnection: any;
  let streamId: any;
  let sessionId: any;
  let sessionClientAnswer: any;

  let statsIntervalId: any;
  let videoIsPlaying: any;
  let lastBytesReceived: any;

  const talkVideo = useRef<HTMLVideoElement>(null);
  const onTalkEnd = useRef(() => {});
  const onTalkStart = useRef(() => {});

  const connectDid = async () => {
    if(context.config.state.selectedCharacter.idleAnimation == '') {
      console.log("Can't load model")
      return;
    }

    // check connect status
    if (peerConnection && peerConnection.connectionState === 'connected') {
      return;
    }
  
    stopAllStreams();
    closePC();
  
    const sessionResponse = await fetchWithRetries(`${DID_API_URL}/talks/streams`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: context.config.state.selectedCharacter.image
      }),
    });
  
    const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json();
    streamId = newStreamId;
    sessionId = newSessionId;
  
    try {
      sessionClientAnswer = await createPeerConnection(offer, iceServers);
    } catch (e) {
      console.log('error during streaming setup', e);
      stopAllStreams();
      closePC();
      return;
    }
  
    const sdpResponse = await fetch(`${DID_API_URL}/talks/streams/${streamId}/sdp`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer: sessionClientAnswer,
        session_id: sessionId,
      }),
    });
  };

  const destoryDid = async () => {
    await fetch(`${DID_API_URL}/talks/streams/${streamId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
  
    stopAllStreams();
    closePC();
  };

  const talkDid = async (text: string) => {
    // connectionState not supported in firefox
    if (peerConnection?.signalingState === 'stable' || peerConnection?.iceConnectionState === 'connected') {
      const talkResponse = await fetchWithRetries(`${DID_API_URL}/talks/streams/${streamId}`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${DID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            ssml: 'false',
            provider: {
              type: 'microsoft',
              voice_id: context.config.state.selectedCharacter.voice,
              voice_config: {
                style: context.config.state.selectedCharacter.style
              }
            },
            input: text
          },
          driver_url: 'bank://lively/',
          config: {
            stitch: true,
            fluent: true
          },
          session_id: sessionId,
        }),
      });
    }
  };

  function onIceCandidate(event: any) {
    console.log('onIceCandidate', event);
    if (event.candidate) {
      const { candidate, sdpMid, sdpMLineIndex } = event.candidate;
  
      fetch(`${DID_API_URL}/talks/streams/${streamId}/ice`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${DID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidate,
          sdpMid,
          sdpMLineIndex,
          session_id: sessionId,
        }),
      });
    }
  }
  function onIceConnectionStateChange() {
    if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
      stopAllStreams();
      closePC();
    }
  }
  function onVideoStatusChange(videoIsPlaying: any, stream: any) {
    if (videoIsPlaying) {
      const remoteStream = stream;
      onTalkStart.current();
      setVideoElement(remoteStream);
    } else {
      onTalkEnd.current();
      playIdleVideo();
    }
  }
  function onTrack(event: any) {
  
    if (!event.track) return;
  
    statsIntervalId = setInterval(async () => {
      const stats = await peerConnection.getStats(event.track);
      stats.forEach((report: any) => {
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
          const videoStatusChanged = videoIsPlaying !== report.bytesReceived > lastBytesReceived;
  
          if (videoStatusChanged) {
            videoIsPlaying = report.bytesReceived > lastBytesReceived;
            onVideoStatusChange(videoIsPlaying, event.streams[0]);
          }
          lastBytesReceived = report.bytesReceived;
        }
      });
    }, 500);
  }
  async function createPeerConnection(offer: any, iceServers: any) {
    if (!peerConnection) {
      peerConnection = new RTCPeerConnection({ iceServers });
      peerConnection.addEventListener('icecandidate', onIceCandidate, true);
      peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
      peerConnection.addEventListener('track', onTrack, true);
    }
  
    await peerConnection.setRemoteDescription(offer);
    console.log('set remote sdp OK');
  
    const sessionClientAnswer = await peerConnection.createAnswer();
    console.log('create local sdp OK');
  
    await peerConnection.setLocalDescription(sessionClientAnswer);
    console.log('set local sdp OK');
  
    return sessionClientAnswer;
  }
  function closePC(pc = peerConnection) {
    if (!pc) return;
    console.log('stopping peer connection');
    pc.close();
    pc.removeEventListener('icecandidate', onIceCandidate, true);
    pc.removeEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
    pc.removeEventListener('track', onTrack, true);
    clearInterval(statsIntervalId);
    console.log('stopped peer connection');
    // if (pc === peerConnection) {
    //   peerConnection = null;
    // }
  }

  const getIdleVideo = async (character: ICharacter, callback: (e: any) => void) => {
    if(character.idleAnimation == '') {
      const res = await fetchWithRetries(`${DID_API_URL}/talks`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${DID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: character.image,
          driver_url: 'bank://lively/',
          script: {
            type: 'text',
            ssml: true,
            input: "<break time=\"4000ms\"/><break time=\"4000ms\"/><break time=\"4000ms\"/>",
            provider: {
              type: "microsoft",
              voice_id: "en-US-JennyNeural"
            }
          },
          config: {
            stitch: true,
            fluent: true
          },
        }),
      });
      const {id, status, created_by, created_at, object} = await res.json();
      if(id) {
        await getResultURLWithRetries(id, callback);
      }
    }
  }

  async function getResultURLWithRetries(id: string, callback: (e: any) => void) {
    const res = await fetch(`${DID_API_URL}/talks/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    const result = await res.json();
    if(result.status !== 'done') {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await getResultURLWithRetries(id, callback);
    } else {
      callback(result.result_url)
    }
  }

  function setVideoElement(stream: any) {
    if(!talkVideo.current) return;
    if (!stream) return;
    console.log('playing stream')
    talkVideo.current.srcObject = stream;
    talkVideo.current.loop = false;
    talkVideo.current.muted = false;
  
    // safari hotfix
    if (talkVideo.current.paused) {
      talkVideo.current
        .play()
        .then((_) => {})
        .catch((e) => {});
    }
  }
  
  function playIdleVideo() {
    if(!talkVideo.current) return;
    talkVideo.current.srcObject = null;
    talkVideo.current.src = context.config.state.selectedCharacter.idleAnimation;
    talkVideo.current.loop = true;
    talkVideo.current.muted = true;

    if (talkVideo.current.paused) {
      talkVideo.current
        .play()
        .then((_) => {})
        .catch((e) => {});
    }
  }
  
  function stopAllStreams() {
    if(!talkVideo.current) return;
    if (talkVideo.current.srcObject) {
      console.log('stopping video streams');
      // @ts-ignore
      talkVideo.current.srcObject.getTracks().forEach((track: any) => track.stop());
      talkVideo.current.srcObject = null;
    }
  }

  async function fetchWithRetries (url: any, options: any, retries = 1): Promise<any> {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (retries <= maxRetryCount) {
        const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), maxDelaySec) * 1000;
  
        await new Promise((resolve) => setTimeout(resolve, delay));
  
        console.log(`Request failed, retrying ${retries}/${maxRetryCount}. Error ${err}`);
        return fetchWithRetries(url, options, retries + 1);
      } else {
        throw new Error(`Max retries exceeded. error: ${err}`);
      }
    }
  }

  const setTalkEndCallback = (callback: any) => {
    onTalkEnd.current = callback;
  }

  const setTalkStartCallback = (callback: any) => {
    onTalkStart.current = callback;
  }
  
  return {
    talkVideo,
    talkDid,
    connectDid,
    destoryDid,
    setTalkEndCallback,
    setTalkStartCallback,
    getIdleVideo
  }
}

export default useDidStream;