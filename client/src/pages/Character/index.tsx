import React, { useState, useEffect, useRef, useContext, Suspense } from "react";
import { NavLink } from "react-router-dom";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import useTextToSpeech from "utils/textToSpeech";
import useDidStream from "utils/streaming_did";
import Socket from 'utils/socket';
import { AppContext } from 'contexts';

import HappyIndex from 'components/HappyIndex';
import { LocationSVG, BadgeSVG, SendSVG, MicSVG, MenuSVG } from 'assets/SVG';

const happyIndex = 2;
const avatarImgLink = '/avatars/bae.png';

const Character: React.FC = () => {

    const socket = Socket.instance;
    const context = useContext(AppContext);
    const [ caption, setCaption ] = useState(null);
    const messageRef = useRef<HTMLInputElement>(null);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    // const { convert, setOnProcessCallback } = useTextToSpeech();
    const { 
        talkVideo,
        talkDid,
        connectDid,
        destoryDid,
        setTalkEndCallback,
        setTalkStartCallback
    } = useDidStream();

    useEffect(() => {

        if (!browserSupportsSpeechRecognition) {
            console.log("Browser doesn't support speech recognition.")
        }
        console.log("#################");
        console.log(context.config.state.selectedCharacter)

        connectDid();
        setTalkEndCallback(() => {
            setCaption(null);
        })
        return () => {
            destoryDid();
        }
    }, []);

    useEffect(() => {
        socket.emit('init_bot', { message: context.config.state.selectedCharacter })

        socket.on('@response', (res: { message: any; }) => {
            console.log(res.message)
            if(res.message && res.message !== '')
                setTalkStartCallback(() => {
                    setCaption(res.message)
                })
                talkDid(res.message);
        });
    }, [socket])

    const sendTextMessage = (text: string | undefined) => {
        if(text && socket) {
            console.log(text)
            socket.emit('chat', {
                message: text
            })
        }
    };

    return (
    <div className="h-full flex flex-col justify-between ml-0 sm:ml-[24px] gap-[2rem]">
        <div className="w-full h-[110px] flex justify-between items-center bg-[#000] text-[#fff] rounded-0 sm:rounded-bl-[20px] px-[25px] py-[21px]">
            <div className="hidden sm:flex flex-col gap-[6px]">
                <span className="font-bold">Happiness Index</span>
                <HappyIndex index={happyIndex} />
            </div>
            <div className="sm:hidden flex items-center gap-[2rem]">
                <MenuSVG />
                <NavLink to="#">
                    <img className="rounded-[10px] w-[48px] h-[48px]" src={avatarImgLink} alt='avatar' />
                </NavLink>
            </div>
            <div className="flex gap-[40px]">
                <LocationSVG />
                <BadgeSVG />
            </div>
        </div>
        <div className="w-full flex-grow flex flex-col gap-[2rem] pl-[2rem] sm:pl-0 pr-[2rem] pb-[2rem]">
            <div className="relative w-full aspect-auto flex-grow flex justify-center items-start overflow-hidden rounded-[20px] border-[1px] border-[#0004] bg-[#000b]">
                <video ref={talkVideo} autoPlay muted playsInline className="absolute top-0 left-0 h-full w-full object-cover object-top"></video>
                {
                    context.config.state.showCaption && (caption != null || transcript !== '') && (
                        <div className="absolute bottom-2 text-[#fff] bg-[#0004] rounded-[10px] px-[16px] py-[10px] mx-auto"
                            style={{
                                maxWidth: 'calc(100% - 4rem)'
                            }}
                        >
                            { caption ? caption : transcript }
                        </div>
                    )
                }
            </div>
            
            <div className="h-[70px] flex items-center gap-[12px] px-[14px] bg-[#26282F] rounded-[20px]">
                <input ref={messageRef}
                    className="flex-grow h-full pl-[20px] bg-transparent outline-none caret-[#E23D3D] text-[#fff] leading-[24px]"
                    placeholder="Type here"
                    onKeyUp={ (evt) => {
                        if(evt.key === 'Enter') {
                            if(messageRef.current) {
                                sendTextMessage(messageRef.current.value);
                                messageRef.current.value = '';
                            }
                        }
                    }}
                />
                {
                    <button className={`p-[10px] rounded-full ${listening && 'bg-[#0e0e0e]'}`}
                        onTouchStart={() => {
                            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
                        }}
                        onTouchEnd={() => {
                            SpeechRecognition.stopListening();
                            setTimeout(() => {
                                resetTranscript();
                            }, 1000);
                            sendTextMessage(transcript);
                        }}
                        onMouseDown={() => {
                            SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
                        }}
                        onMouseUp={() => {
                            SpeechRecognition.stopListening();
                            setTimeout(() => {
                                resetTranscript();
                            }, 1000);
                            sendTextMessage(transcript);
                        }}
                    >
                        <MicSVG />
                    </button>
                }
                <button className="hidden sm:block p-[10px] pl-[9px] bg-[#E23D3D] rounded-[10px]"
                    onClick={ () => { 
                        if(messageRef.current) {
                            sendTextMessage(messageRef.current.value);
                            messageRef.current.value = '';
                        }
                    }}
                >
                    <SendSVG />
                </button>
            </div>
        </div>
    </div>
    );
};
  
export default Character;