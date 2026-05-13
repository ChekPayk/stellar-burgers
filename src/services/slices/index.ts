export { default as ingredientsReducer } from './ingredientsSlice';
export { default as feedReducer } from './feedSlice';
export { default as constructorReducer } from './constructorSlice';
export { default as userReducer } from './userSlice';
export { default as orderReducer } from './orderSlice';
export { default as ordersReducer } from './ordersSlice';

// Ингредиенты
export {
  fetchIngredients,
  selectIngredients,
  selectIsLoading as selectIngredientsIsLoading,
  selectError as selectIngredientsError
} from './ingredientsSlice';

// Лента заказов
export {
  fetchFeeds,
  selectFeedOrders,
  selectFeedTotal,
  selectFeedTotalToday,
  selectFeedIsLoading,
  selectFeedError
} from './feedSlice';

// Конструктор
export {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  resetConstructor,
  selectConstructorBun,
  selectConstructorIngredients,
  selectConstructorItems
} from './constructorSlice';

// Пользователь
export {
  loginUser,
  registerUser,
  logoutUser,
  checkUserAuth,
  updateUser,
  setAuthChecked,
  selectUser,
  selectIsAuthChecked,
  selectIsLoading as selectUserIsLoading,
  selectError as selectUserError
} from './userSlice';

// Текущий заказ
export {
  submitOrder,
  fetchOrderByNumber,
  closeOrderModal,
  selectOrderRequest,
  selectOrderModalData,
  selectOrderByNumber,
  selectOrderIsLoading,
  selectOrderError
} from './orderSlice';

// История заказов
export {
  fetchOrders,
  selectOrders,
  selectOrdersIsLoading,
  selectOrdersError
} from './ordersSlice';
