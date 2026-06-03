import React from 'react';
import { Route } from 'react-router-dom';
import NotificationPage from './NotificationPage';

// Isso define a variável como um Elemento JSX direto.
// É isso que permite usar {NotificationRoutes} no App.tsx sem erro.
const NotificationRoutes = (
  <Route key="notifications" path="/notifications" element={<NotificationPage />} />
);

export default NotificationRoutes;
