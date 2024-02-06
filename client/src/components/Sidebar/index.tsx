import React from 'react';
import { NavLink } from "react-router-dom";
import { PlusSquareSVG, UserSVG, QuestSVG, AwardSVG, GamePadSVG, CurrencySVG, HandShakeSVG, CogSVG, LogoutSVG }  from 'assets/SVG';

const avatarImgLink = '/avatars/bae.png';

const Sidebar = () => {

    return (
    <div className="hidden sm:block flex-shrink-0 sidebar w-[240px] h-screen p-[36px] bg-[#000] text-[#fff] text-[16px] leading-normal">
        <div className='h-full flex flex-col items-center px-[2px]'>
            <div className='h-full flex flex-col items-center gap-[40px]'>
                <NavLink to="#">
                    <img className="rounded-[10px]" src={avatarImgLink} alt='avatar' />
                </NavLink>
                <NavLink to="#">
                    <button className="flex rounded-[10px] bg-[#E23D3D] px-[25px] py-[12px] gap-[16px]">
                        <PlusSquareSVG />
                        <span className='font-bold'>Subscribe</span>
                    </button>
                </NavLink>
                <div className='flex flex-col flex-grow justify-between'>
                    <div className="navbar flex flex-col gap-[30px]">
                        <NavLink to="/" className="navbar-item flex gap-[1rem]">
                            <UserSVG />
                            <span>Automise</span>
                        </NavLink>
                        <NavLink to="#" className="navbar-item flex gap-[1rem]">
                            <QuestSVG />
                            <span>Quest</span>
                        </NavLink>
                        <NavLink to="#" className="navbar-item flex gap-[1rem]">
                            <AwardSVG />
                            <span>Awards</span>
                        </NavLink>
                        <NavLink to="#" className="navbar-item flex gap-[1rem]">
                            <GamePadSVG />
                            <span>Games</span>
                        </NavLink>
                        <NavLink to="#" className="navbar-item flex gap-[1rem]">
                            <CurrencySVG />
                            <span>Currency</span>
                        </NavLink>
                        <NavLink to="#" className="navbar-item flex gap-[1rem]">
                            <HandShakeSVG />
                            <span>Partnership</span>
                        </NavLink>
                        <NavLink to="/settings" className="navbar-item flex gap-[1rem]">
                            <CogSVG />
                            <span>Settings</span>
                        </NavLink>
                    </div>
                    <button className="flex pb-[48px] gap-4">
                        <LogoutSVG />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
}

export default Sidebar;