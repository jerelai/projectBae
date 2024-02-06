import { BrowserRouter } from 'react-router-dom';
import { Router } from './routes';
import MainLayout from 'layouts/Main';

export default function App() {

  return (
    <BrowserRouter>
      <MainLayout>
        <Router />
      </MainLayout>
    </BrowserRouter>
  );
}