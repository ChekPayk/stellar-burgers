import { FC, ReactElement, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from '../../services/store';
import {
  selectUser,
  selectIsAuthChecked,
  checkUserAuth
} from '../../services/slices';
import { Preloader } from '@ui';

type ProtectedRouteProps = {
  onlyUnAuth?: boolean;
  children: ReactElement;
};

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  onlyUnAuth = false,
  children
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  useEffect(() => {
    if (!isAuthChecked) {
      dispatch(checkUserAuth());
    }
  }, [dispatch, isAuthChecked]);

  if (!isAuthChecked) {
    return <Preloader />;
  }

  // Если маршрут только для неавторизованных (login, register, forgot-password, reset-password)
  if (onlyUnAuth) {
    if (user) {
      // Пользователь уже авторизован — перенаправляем на главную
      const from = location.state?.from?.pathname || '/';
      return <Navigate to={from} replace />;
    }
    // Не авторизован — показываем страницу
    return children;
  }

  // Маршрут только для авторизованных (profile, profile/orders и т.д.)
  if (!user) {
    // Не авторизован — перенаправляем на login, запоминаем откуда пришли
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Авторизован — показываем страницу
  return children;
};
