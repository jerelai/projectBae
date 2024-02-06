import { Buffer } from "buffer";
import { useEffect, useRef } from "react";
import * as Tone from "tone";

import { GOOGLE_CLOUD_API_KEY } from 'config';
import { sendRequestToGoogleCloudApi } from "./network";
import {
  AvatarVoice,
  Voice,
  DEFAULT_AVATAR_VOICE,
  WAVE_NET_VOICES,
  STANDARD_VOICES
} from "./voices";

/**
 * Response return by the synthesize method.
 */
export interface SynthesizeResponse {
  /**
   * Encoded audio bytes.
   */
  audioContent: ArrayBuffer | null;
}

interface AudioProcessCallback {
  (e: Float32Array): void;
}

const useTextToSpeech = () => {
  const audioContext = useRef(new AudioContext());
  const processor = useRef(
    audioContext.current.createScriptProcessor(1024, 1, 1)
  );
  const dest = useRef(audioContext.current.createMediaStreamDestination());
  const delayNode = useRef(audioContext.current.createDelay(170));
  const source = useRef(audioContext.current.createBufferSource());
  const onProcessCallback = useRef<AudioProcessCallback>((e) => {});

  useEffect(() => {
    source.current.connect(processor.current);
    processor.current.connect(dest.current);
    source.current.connect(delayNode.current);
    delayNode.current.delayTime.value =
      Number(
        new URL(window.location.href).searchParams.get("audio_delay") ?? "300"
      ) / 1000;
    delayNode.current.connect(audioContext.current.destination);
    source.current.start();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (source.current) {
        source.current.stop();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleVisibilityChange = () => {
    if (document.hidden) {
      audioContext.current.suspend().then(() => {
        console.log("audioContext suspended");
      });
    } else {
      audioContext.current.resume().then(() => {
        console.log("audioContext resumed");
      });
    }
  };

  const getVoices = async (): Promise<Voice[]> => {
    return WAVE_NET_VOICES;
  };

  const getStandardVoices = async (): Promise<Voice[]> => {
    return STANDARD_VOICES;
  }

  const getDefaultAvatarVoice = (): AvatarVoice => {
    return DEFAULT_AVATAR_VOICE;
  };

  const getDefaultVoice = async () => {
    const voices = await getStandardVoices();
    if (!voices) {
      console.error("No voices found");
    }
    return voices[0];
  };

  const setOnProcessCallback = (callback: AudioProcessCallback) => {
    onProcessCallback.current = callback;
  };

  const synthesize = async (
    text: string,
    voice: AvatarVoice
  ): Promise<SynthesizeResponse> => {
    const startSynthTime = performance.now();
    if (!text) {
      return { audioContent: new Uint8Array(0) };
    }

    let cloudTtsVoice = await getDefaultVoice();
    if (voice.cloudTtsVoice) {
      cloudTtsVoice = voice.cloudTtsVoice;
    }
    let speakingRate = 1.0;
    if (voice.speakingRate) {
      speakingRate = voice.speakingRate;
    }
    let cloudTtsPitch = 0.0;
    if (voice.cloudTtsPitch) {
      cloudTtsPitch = voice.cloudTtsPitch;
    }
    let response: SynthesizeResponse;

    response = await sendRequestToGoogleCloudApi(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      {
        input: { 'ssml': text },
        audioConfig: {
          audioEncoding: "LINEAR16",
          pitch: cloudTtsPitch,
          speakingRate,
          volumeGainDb: 6
        },
        voice: {
          languageCode: cloudTtsVoice.languageCode,
          name: cloudTtsVoice.name,
        },
      },
      GOOGLE_CLOUD_API_KEY
    ).then((response) => {
      if(response.error) {
        return { audioContent: null };
      } else {
        return {
          audioContent: Uint8Array.from(
            Buffer.from(response.audioContent, "base64")
          ).buffer,
        } as SynthesizeResponse;
      }
    });

    if (!response.audioContent) {
      console.warn("TTS response.audioContent is empty.");
    }

    const endFirstChunkSynthTime = performance.now();
    console.log(
      'TTS for sentence "' +
        text +
        '" took %c' +
        (endFirstChunkSynthTime - startSynthTime).toFixed(2) +
        " ms",
      "color: lightgreen"
    );
    return response;
  };

  const play = async (
    audioContent: ArrayBuffer,
    voice: AvatarVoice
  ): Promise<void> => {
    console.log("Play audio");
    if (voice.pitchShift) {
      // Tone is required for Pitch Shift, but does not support
      // processor nodes, so swap between the two playback mechanisms
      // depending on whether pitch shift is needed.
      return new Promise((resolve) => {
        Tone.context
          .decodeAudioData(audioContent)
          .then((audioBuffer: AudioBuffer) => {
            const bufferSource = new Tone.BufferSource(audioBuffer);
            bufferSource.onended = () => {
              resolve();
            };
            bufferSource.chain(
              new Tone.PitchShift(voice.pitchShift),
              Tone.Destination
            );
            bufferSource.start();
          })
          .catch((e: Error) => {
            console.error(e);
          });
      });
    } else {
      const decodedAudio = await audioContext.current.decodeAudioData(
        audioContent
      );
      source.current.stop();
      source.current.disconnect();
      source.current = audioContext.current.createBufferSource();
      source.current.buffer = decodedAudio;
      source.current.start();
      source.current.connect(processor.current);
      source.current.connect(delayNode.current);

      processor.current.onaudioprocess = (e) => {
        // Only pick up the first channel's data, as a Float32Array
        const audioData = e.inputBuffer.getChannelData(0);
        onProcessCallback.current(audioData);
      };

      return new Promise<void>((resolve) => {
        source.current.onended = () => {
          resolve();
        };
      });
    }
  };

  const convert = async (text: string) => {

    const voice = getDefaultAvatarVoice();
    console.log(voice);
    // console.log(text);

    if (!text || (!voice?.cloudTtsVoice && !voice?.winslow)) {
      return;
    }
    await synthesize(text, voice).then((synthesizeResult) => {
      if(synthesizeResult.audioContent)
        play(synthesizeResult.audioContent, voice);
      else
        console.warn('Audio Content is Empty')
    });
  };

  return {
    convert,
    setOnProcessCallback,
  };
};

export default useTextToSpeech;
