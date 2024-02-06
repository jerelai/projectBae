interface ICharacter {
    name: string,
    image: string,
    idleAnimation: string,
    voice: string,
    style: string,
    happyIndex: number, // 0 - 4 // how about float value?
    background: string
}

interface IConfig {
    characters: Array<ICharacter>;
    selectedCharacter: ICharacter;
    showCaption: boolean;
}

const characters = [
    {
        name: 'ashley',
        image: 'https://res.cloudinary.com/dtysxszqe/image/upload/v1701071571/Bae/mmo1sk9sfreddmpwufuu.png',
        idleAnimation: 'https://res.cloudinary.com/dtysxszqe/video/upload/v1701510590/Bae/rztsatwlkh7dqvpzyeye.mp4', 
        voice: 'en-US-JennyNeural',
        style: 'Cheerful',
        happyIndex: 2,
        background: "I spent my early days growing up in New York. I had a blast bonding with my fellows. During my time there, I learned about the importance of taking care of others and making everyone around me happy. ",
    },
    {
        name: 'captain',
        image: 'https://res.cloudinary.com/dtysxszqe/image/upload/v1701071571/Bae/d0cndjfeggffrvrdsxrb.png',
        idleAnimation: 'https://res.cloudinary.com/dtysxszqe/video/upload/v1701510590/Bae/jyzswowypxge1oqqcqpt.mp4', 
        voice: 'zh-CN-YunxiNeural',
        style: 'Cheerful',
        happyIndex: 2,
        background: "I spent my early days growing up in New York. I had a blast bonding with my fellows. During my time there, I learned about the importance of taking care of others and making everyone around me happy. ",
    },
    {
        name: 'girl',
        image: 'https://res.cloudinary.com/dtysxszqe/image/upload/v1701071571/Bae/duliq6ycffxapu1a7uon.png',
        idleAnimation: 'https://res.cloudinary.com/dtysxszqe/video/upload/v1701510590/Bae/q8rzhirci2tktlophxb6.mp4', 
        voice: 'en-US-JennyNeural',
        style: 'Cheerful',
        happyIndex: 2,
        background: "I spent my early days growing up in New York. I had a blast bonding with my fellows. During my time there, I learned about the importance of taking care of others and making everyone around me happy. ",
    },
    {
        name: 'boy',
        image: 'https://res.cloudinary.com/dtysxszqe/image/upload/v1701071571/Bae/kjs9lmgosy5baft5gghf.png',
        idleAnimation: 'https://res.cloudinary.com/dtysxszqe/video/upload/v1701510590/Bae/hndc3fkxad9k8wmapja2.mp4', 
        voice: 'zh-CN-YunxiNeural',
        style: 'Cheerful',
        happyIndex: 2,
        background: "I spent my early days growing up in New York. I had a blast bonding with my fellows. During my time there, I learned about the importance of taking care of others and making everyone around me happy. ",
    },
]

export class ConfigManager {
    state: IConfig;

    constructor() {
        this.state = {
            characters: characters,
            selectedCharacter: characters[0],
            showCaption: true,
        };

        // const storedValue = localStorage.getItem("configuration");
        // if(storedValue)
        //     this.state = JSON.parse(storedValue)
        // else
        //     this.setConfig(this.state)
    }

    setConfig(value: IConfig) {
        this.state = value;
        // localStorage.setItem('configuration', JSON.stringify(value));
    }
}