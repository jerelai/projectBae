import { HappySVG } from 'assets/SVG'
import "./_style.scss";

interface HappyIndexProps {
    index: number;
}

export default function HappyIndex( props: HappyIndexProps) {

    return (
        <div className="happy-index relative flex items-center py-[6px]">
            <div className="flex gap-[30px] px-[30px] py-[6px] bg-[#1E2026] rounded-[110px]">
                {
                    HappySVG.map( (item, idx) => 
                        <span key={idx} className='opacity-[0.45]'>
                            {item}
                        </span> 
                    )
                }
            </div>
            {
                <div className="absolute bg-[#44C849] p-[6px] rounded-full" style={{ left: `${(props.index+1) * 30 + 20}px`}} >
                    <span className='active'>
                        {HappySVG[props.index]}
                    </span> 
                </div>
            }
        </div>
    )

}