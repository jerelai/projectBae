import React, {useContext, useEffect, useState} from 'react';
import Switch from "react-switch";
import CharacterItem from 'components/CharacterItem';

import { AppContext } from 'contexts';
import useDidStream from 'utils/streaming_did';

import { AddSVG } from 'assets/SVG';

const Settings: React.FC = () => {
  const wordsLimitation = 3000;

  const context = useContext(AppContext);
  const [config, setConfig] = useState(context.config.state);
  const [showCaption, setShowCaption] = useState(context.config.state.showCaption);

  const [availabelVoices, setAvailableVoices] = useState<Array<string>>([]);
  const [availableStyles, setAvailableStyles] = useState<Array<string>>([]);

  const {
    getIdleVideo
  } = useDidStream();

  const [toast, setToast] = useState<string | null>(null);
  function showToast(text: string, timeout = 1000) {
    setToast(text);

    setTimeout(() => {
      setToast(null);
    }, timeout);
  }
  useEffect(() => {
    setAvailableVoices([
      "en-US-JennyNeural",
      "zh-CN-YunxiNeural"
    ]);
    setAvailableStyles([
      "Cheerful"
    ])
  }, [])

  const handleCreateNewCharacter = async () => {
    const new_character = {
      name: 'maya',
      image: 'https://res.cloudinary.com/dtysxszqe/image/upload/v1701071571/Bae/mmo1sk9sfreddmpwufuu.png',
      idleAnimation: '', 
      voice: 'en-US-JennyNeural',
      style: 'Cheerful',
      happyIndex: 2,
      background: "I spent my early days growing up in New York. I had a blast bonding with my fellows. During my time there, I learned about the importance of taking care of others and making everyone around me happy. ",
    }
    // TODO: check character properties
    await getIdleVideo(new_character, (url: any) => {
      console.log('in settings: ', url)
      new_character.idleAnimation = url
      // TODO: save new character
    })
  }

  const handleSaveButtonClick = () => {
    // handleCreateNewCharacter();
    const characters = context.config.state.characters.map( item => {
      if(item.name == context.config.state.selectedCharacter.name)
        return {
          ...item, 
          voice: config.selectedCharacter.voice,
          style: config.selectedCharacter.style,
          background: config.selectedCharacter.background
        }
      else return item
    })
    setConfig({
      ...config,
      characters: characters,
    });
    context.config.setConfig({
      ...context.config.state,
      characters: characters,
      selectedCharacter: config.selectedCharacter
    });
    showToast('Saved')
  };

  const handleCancelButtonClick = () => {
    // setCharacters(context.config.state.characters);
    // setSelectedCharacter(context.config.state.selectedCharacter);
    // setShowCaption(context.config.state.showCaption);
    setConfig(config)
    return;
  };

  return (
    <div className='relative'>
      <div className='w-full h-[100vh] flex flex-col p-[2rem] gap-[1rem] overflow-y-auto'>

        {/* Global settings */}
        <div className='w-full'>
          <div className='flex items-center gap-[1rem]'>
            <span className='text-[#fff]'>Caption:</span>
            <Switch checked={showCaption}
              height={24}
              onChange={(checked) => {
                setShowCaption(checked);
                context.config.setConfig({
                  ...context.config.state,
                  showCaption: checked
                });
              }} 
            />
          </div>
        </div>
        {/* Character List */}
        <div className='container'>
          <div className='w-full flex flex-wrap gap-[1rem] mt-[1rem]'>
              <div className='w-[120px] h-[120px] flex justify-center items-center border-[#fff] border-[1px] border-dashed rounded-[1rem] cursor-pointer'>
                <AddSVG className='w-[80px] h-[80px] fill-[#fff]' />
              </div>
              {
                config.characters.map( (item, idx) => 
                  <CharacterItem key={idx} character={item} selected={ item.name == config.selectedCharacter.name } 
                    onClick={() => {
                      setConfig({
                        ...config,
                        selectedCharacter: item
                      });
                      context.config.setConfig({
                        ...context.config.state,
                        selectedCharacter: item
                      });
                    }} 
                  />
                )
              }
          </div>
        </div>
        {/* Character Edit */}
        <div className='w-full flex flex-col items-center gap-[1.5rem] mt-[2rem]'>
          <div className='w-full max-w-[650px] flex justify-evenly'>
            <div className='flex items-center gap-[1rem]'>
              <span className='text-[#fff]'>Voice: </span>
              <select
                className='outline-none border-none rounded-[4px]'
                name='voice'
                value={config.selectedCharacter.voice}
                onChange={(event) => {
                  setConfig({
                    ...config,
                    selectedCharacter: {
                      ...config.selectedCharacter,
                      voice: event.target.value
                    }
                  })
                }}
              >
                {
                  availabelVoices.map( (item, idx) =>
                    <option key={idx} value={item}>{item}</option>
                  )
                }
              </select>
            </div>
            <div className='flex items-center gap-[1rem]'>
              <span className='text-[#fff]'>Style: </span>
              <select
                className='outline-none border-none rounded-[4px]'
                name='style'
                value={config.selectedCharacter.style}
                onChange={(event) => {
                  setConfig({
                    ...config,
                    selectedCharacter: {
                      ...config.selectedCharacter,
                      style: event.target.value
                    }
                  })
                }}
              >
                {
                  availableStyles.map( (item, idx) =>
                    <option key={idx} value={item}>{item}</option>
                  )
                }
              </select>
            </div>
          </div>
          <div className='w-full max-w-[650px]'>
            <span className='text-[#fff]'>Background:</span>
            <textarea className='w-full h-[160px] flex-grow p-[1rem] resize-none outline-none border-none bg-[#000] text-[#fff] rounded-[10px]' placeholder="Character's background" value={config.selectedCharacter.background}
              onChange={(event) => {
                const text = event.target.value;
                const wordPattern = /\b\w+\b/g;
                const matches = text.match(wordPattern);
                const wordCount = matches ? matches.length : 0;

                if (wordCount > wordsLimitation && matches) {
                  const truncatedText = matches.slice(0, wordsLimitation).join(' ');
                  setConfig({
                    ...config,
                    selectedCharacter: {
                      ...config.selectedCharacter,
                      background: truncatedText
                    }
                  })
                } else {
                  setConfig({
                    ...config,
                    selectedCharacter: {
                      ...config.selectedCharacter,
                      background: text
                    }
                  })
                }
              }}
            />
          </div>

          <div className='w-full flex gap-[1rem] justify-center mt-[1rem]'>
            <button className='bg-lime-700 text-[#fff] px-[1rem] py-[0.5rem] rounded-[10px]'
              onClick={() => {
                handleSaveButtonClick();
              }}
            >
              Save
            </button>
            <button className='bg-gray-700 text-[#fff] px-[1rem] py-[0.5rem] rounded-[10px]'
              onClick={() => {
                handleCancelButtonClick();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {
        toast &&
        <div className="absolute flex justify-center w-fit mx-auto my-0 top-[2rem] left-0 right-0 px-[1rem] py-[0.5rem] bg-[#0006] rounded-[1rem] transition-all duration-200">
          <span className='text-[#fff]'>{toast}</span>
        </div>
      }
    </div>
  )
};

export default Settings;
 