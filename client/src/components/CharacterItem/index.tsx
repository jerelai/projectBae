import React, { useState } from 'react';
import { checkImg } from 'assets/img';

interface ICharacter {
    name: string,
    image: string,
    idleAnimation: string,
    voice: string,
    style: string,
    happyIndex: number, // 0 - 4 // how about float value?
    background: string
}

interface CharacterItemProps {
    character: ICharacter,
    selected: boolean,
    onClick: () => void
}

const CharacterItem = (props: CharacterItemProps) => {

    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <div className='flex flex-col w-[120px]'>
            <div className="relative w-[120px] h-[120px] rounded-[1rem] bg-gray-800 cursor-pointer" 
                onClick={() => { props.onClick() }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <img className='w-[120px] h-[120px] rounded-[1rem]'
                    src={props.character.image} alt='' 
                />
                {
                    props.selected &&
                    <img className='absolute w-[24px] h-[24px] right-[6px] top-[6px] z-[9]' src={checkImg} />
                }
                {
                    isHovered &&
                    <div className='absolute top-0 left-0 w-full h-full flex flex-col justify-end bg-[#0009] z-[10] rounded-[1rem]'>
                        <button className='w-full h-[24px] border-none outline-none text-[#fff] bg-blue-700 rounded-bl-[1rem] rounded-br-[1rem]'
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Edit')
                            }}
                        >
                            Edit
                        </button>
                    </div>
                }
            </div>
            <span className='text-[#fff] text-center capitalize'>{props.character.name}</span>
    </div>
    );
}

export default CharacterItem;