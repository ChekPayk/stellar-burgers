import { FC, ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCookie } from '../../utils/cookie';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const location = useLocation();
  const accessToken = getCookie('accessToken');

  // Если маршрут только для неавторизованных (login, register, forgot-password, reset-password)
  if (onlyUnAuth) {
    if (accessToken) {
      // Пользователь уже авторизован — перенаправляем на главную
      const from = location.state?.from || '/';
      return <Navigate to={from} replace />;
    }
    // Не авторизован — показываем страницу
    return children;
  }

  // Маршрут только для авторизованных (profile, profile/orders и т.д.)
  if (!accessToken) {
    // Не авторизован — перенаправляем на login, запоминаем откуда пришли
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Авторизован — показываем страницу
  return children;
};
