import { Navigate } from 'react-router';
import CatalogPage from '../catalog/pages/CatalogPage';
import HomePage from '../home/HomePage';
import AppLayout from '../layout/AppLayout';
import PrivateRoute from '../users/components/PrivateRoute';
import LoginPage from '../users/pages/LoginPage';
import OAuth2RedirectHandler from '../users/pages/OAuth2RedirectHandler';

export const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/oauth2/redirect', element: <OAuth2RedirectHandler /> },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'catalog', element: <CatalogPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
