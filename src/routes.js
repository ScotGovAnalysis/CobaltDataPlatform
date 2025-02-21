import Dataset from './pages/Dataset';
import Datasets from './pages/Datasets';
import Home from './pages/Home';
import Organisations from './pages/Organisations';
import Privacy from './pages/Privacy';
import Accessibility from './pages/Accessibility';
import About from './pages/About';
import Categories from './pages/Categories';
import Help from './pages/Help';
import Organisation from './pages/Organisation';
import Resource from './pages/Resource';
import Category from './pages/Category';
import Contact from './pages/Contact';

const routes = [
  { path: '/about', element: <About /> },
  { path: '/accessibility', element: <Accessibility /> },
  { path: '/categories', element: <Categories /> },
  { path: '/category/:categoryName', element: <Category /> },
  { path: '/contact', element: <Contact /> },
  { path: '/home', element: <Home /> },
  { path: '/results', element: <Datasets /> },
  { path: '/dataset/:id', element: <Dataset /> },
  { path: '/dataset/:id/explore/:resourceId', element: <Resource /> },
  { path: '/datasets', element: <Datasets /> },
  { path: '/organisations', element: <Organisations /> },
  { path: '/organisation/:organisationName', element: <Organisation /> },
  { path: '/privacy', element: <Privacy /> },
  { path: '/help', element: <Help /> },
];

export default routes;