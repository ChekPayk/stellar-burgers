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
  it('should return initial state when called with undefined and UNKNOWN_ACTION', () => {
    const state = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });

    // ingredients slice
    expect(state.ingredients).toEqual({
      ingredients: [],
      isLoading: false,
      error: null,
    });

    // feed slice
    expect(state.feed).toEqual({
      orders: [],
      total: 0,
      totalToday: 0,
      isLoading: false,
      error: null,
    });

    // burgerConstructor slice
    expect(state.burgerConstructor).toEqual({
      bun: null,
      ingredients: [],
    });

    // user slice
    expect(state.user).toEqual({
      user: null,
      isAuthChecked: false,
      isLoading: false,
      error: null,
    });

    // order slice
    expect(state.order).toEqual({
      orderRequest: false,
      orderModalData: null,
      orderByNumber: null,
      isLoading: false,
      error: null,
    });

    // orders slice
    expect(state.orders).toEqual({
      orders: [],
      isLoading: false,
      error: null,
    });
  });
});
