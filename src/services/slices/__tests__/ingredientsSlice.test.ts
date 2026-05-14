import ingredientsReducer, {
  fetchIngredients,
} from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://example.com/bun.png',
    image_large: 'https://example.com/bun-large.png',
    image_mobile: 'https://example.com/bun-mobile.png',
  },
  {
    _id: '643d69a5c3f7b9001cfa093e',
    name: 'Филе Люминесцентного тетраодонтимформа',
    type: 'main',
    proteins: 44,
    fat: 26,
    carbohydrates: 85,
    calories: 643,
    price: 988,
    image: 'https://example.com/main.png',
    image_large: 'https://example.com/main-large.png',
    image_mobile: 'https://example.com/main-mobile.png',
  },
];

describe('ingredientsSlice reducer', () => {
  const initialState = {
    ingredients: [],
    isLoading: false,
    error: null,
  };

  describe('fetchIngredients.pending', () => {
    it('should set isLoading to true and clear error', () => {
      const action = { type: fetchIngredients.pending.type };
      const state = ingredientsReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchIngredients.fulfilled', () => {
    it('should set isLoading to false and store ingredients data', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients,
      };
      const state = ingredientsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.ingredients).toEqual(mockIngredients);
      expect(state.ingredients).toHaveLength(2);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchIngredients.rejected', () => {
    it('should set isLoading to false and store error message', () => {
      const errorMessage = 'Network Error';
      const action = {
        type: fetchIngredients.rejected.type,
        error: { message: errorMessage },
      };
      const state = ingredientsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.ingredients).toHaveLength(0);
    });

    it('should set default error message when error is not provided', () => {
      const action = {
        type: fetchIngredients.rejected.type,
        error: {},
      };
      const state = ingredientsReducer(initialState, action);

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Ошибка загрузки ингредиентов');
    });
  });
});
