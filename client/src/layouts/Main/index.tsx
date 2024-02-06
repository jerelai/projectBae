import Sidebar from 'components/Sidebar';
import './_style.scss';

export interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout(props : MainLayoutProps) {
  return (
    <div className='w-full h-screen flex overflow-hidden'>
      <Sidebar />
      <div className='w-full bg-gradient-to-b from-[#1B1B1D] from-0% via-[#1B1B1D] via-80% to-[#000] to-100%'>
        {props.children}
      </div>
    </div>
  );
}

export default MainLayout;
