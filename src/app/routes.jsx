import { Navigate } from 'react-router';
import CatalogPage from '../catalog/pages/CatalogPage';
import HomePage from '../home/HomePage';
import AppLayout from '../layout/AppLayout';
import AdminRoute from '../users/components/AdminRoute';
import PrivateRoute from '../users/components/PrivateRoute';
import LoginPage from '../users/pages/LoginPage';
import OAuth2RedirectHandler from '../users/pages/OAuth2RedirectHandler';
import UserDetailPage from '../users/pages/UserDetailPage';
import UsersPage from '../users/pages/UsersPage';

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
          {
            element: <AdminRoute />,
            children: [
              { path: 'users', element: <UsersPage /> },
              { path: 'users/:id', element: <UserDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];
