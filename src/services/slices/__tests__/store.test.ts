import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from '../ingredientsSlice';
import feedReducer from '../feedSlice';
import constructorReducer from '../constructorSlice';
import userReducer from '../userSlice';
import orderReducer from '../orderSlice';
import ordersReducer from '../ordersSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  feed: feedReducer,
  burgerConstructor: constructorReducer,
  user: userReducer,
  order: orderReducer,
  orders: ordersReducer,
});

describe('rootReducer initialization', () => {
  it('initializes the state correctly', () => {
    const initAction = { type: '@@INIT' };
    const state = rootReducer(undefined, initAction);

    expect(state).toEqual({
      ingredients: ingredientsReducer(undefined, initAction),
      feed: feedReducer(undefined, initAction),
      burgerConstructor: constructorReducer(undefined, initAction),
      user: userReducer(undefined, initAction),
      order: orderReducer(undefined, initAction),
      orders: ordersReducer(undefined, initAction)
    });
  });

  it('handles unknown action correctly', () => {
    const fakeAction = { type: 'UNKNOWN_ACTION' };
    const state = rootReducer(undefined, fakeAction);

    expect(state).toEqual({
      ingredients: ingredientsReducer(undefined, fakeAction),
      feed: feedReducer(undefined, fakeAction),
      burgerConstructor: constructorReducer(undefined, fakeAction),
      user: userReducer(undefined, fakeAction),
      order: orderReducer(undefined, fakeAction),
      orders: ordersReducer(undefined, fakeAction)
    });
  });
});
