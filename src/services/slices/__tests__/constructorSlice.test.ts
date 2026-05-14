import constructorReducer, {
  addIngredient,
  removeIngredient,
  moveIngredientUp,
  moveIngredientDown,
  resetConstructor,
} from '../constructorSlice';
import { submitOrder } from '../orderSlice';
import { TConstructorIngredient, TIngredient } from '@utils-types';

// Mock uuid to return predictable ids
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

const mockBun: TIngredient = {
  _id: 'bun-1',
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
};

const mockMain: TIngredient = {
  _id: 'main-1',
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
};

const mockSauce: TIngredient = {
  _id: 'sauce-1',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://example.com/sauce.png',
  image_large: 'https://example.com/sauce-large.png',
  image_mobile: 'https://example.com/sauce-mobile.png',
};

describe('burgerConstructor reducer', () => {
  const initialState = {
    bun: null,
    ingredients: [],
  };

  describe('addIngredient', () => {
    it('should add a bun ingredient to the bun field', () => {
      const action = addIngredient(mockBun);
      const state = constructorReducer(initialState, action);

      expect(state.bun).not.toBeNull();
      expect(state.bun!._id).toBe('bun-1');
      expect(state.bun!.type).toBe('bun');
      expect(state.bun!.id).toBe('test-uuid-123');
      expect(state.ingredients).toHaveLength(0);
    });

    it('should replace the existing bun when adding a new bun', () => {
      const stateWithBun = {
        bun: { ...mockBun, id: 'old-uuid' } as TConstructorIngredient,
        ingredients: [],
      };

      const newBun: TIngredient = {
        ...mockBun,
        _id: 'bun-2',
        name: 'Флюоресцентная булка R2-D3',
        price: 988,
      };

      const action = addIngredient(newBun);
      const state = constructorReducer(stateWithBun, action);

      expect(state.bun!._id).toBe('bun-2');
      expect(state.bun!.name).toBe('Флюоресцентная булка R2-D3');
    });

    it('should add a main ingredient to the ingredients list', () => {
      const action = addIngredient(mockMain);
      const state = constructorReducer(initialState, action);

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]._id).toBe('main-1');
      expect(state.ingredients[0].id).toBe('test-uuid-123');
    });

    it('should add a sauce ingredient to the ingredients list', () => {
      const action = addIngredient(mockSauce);
      const state = constructorReducer(initialState, action);

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(1);
      expect(state.ingredients[0]._id).toBe('sauce-1');
    });

    it('should add multiple ingredients to the list', () => {
      let state = constructorReducer(initialState, addIngredient(mockMain));
      state = constructorReducer(state, addIngredient(mockSauce));
      state = constructorReducer(state, addIngredient(mockMain));

      expect(state.ingredients).toHaveLength(3);
    });
  });

  describe('removeIngredient', () => {
    it('should remove an ingredient by its id', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [
          { ...mockMain, id: 'id-1' },
          { ...mockSauce, id: 'id-2' },
          { ...mockMain, id: 'id-3' },
        ] as TConstructorIngredient[],
      };

      const action = removeIngredient('id-2');
      const state = constructorReducer(stateWithIngredients, action);

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients.find((item) => item.id === 'id-2')).toBeUndefined();
    });

    it('should not remove anything if id does not match', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [
          { ...mockMain, id: 'id-1' },
          { ...mockSauce, id: 'id-2' },
        ] as TConstructorIngredient[],
      };

      const action = removeIngredient('non-existent-id');
      const state = constructorReducer(stateWithIngredients, action);

      expect(state.ingredients).toHaveLength(2);
    });

    it('should not affect bun when removing ingredient', () => {
      const stateWithBunAndIngredients = {
        bun: { ...mockBun, id: 'bun-id' } as TConstructorIngredient,
        ingredients: [
          { ...mockMain, id: 'id-1' },
        ] as TConstructorIngredient[],
      };

      const action = removeIngredient('id-1');
      const state = constructorReducer(stateWithBunAndIngredients, action);

      expect(state.bun).not.toBeNull();
      expect(state.bun!._id).toBe('bun-1');
      expect(state.ingredients).toHaveLength(0);
    });
  });

  describe('moveIngredientUp', () => {
    it('should move an ingredient up in the list', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [
          { ...mockMain, id: 'id-1' },
          { ...mockSauce, id: 'id-2' },
          { ...mockMain, id: 'id-3' },
        ] as TConstructorIngredient[],
      };

      const action = moveIngredientUp(2); // move index 2 up
      const state = constructorReducer(stateWithIngredients, action);

      expect(state.ingredients[1].id).toBe('id-3');
      expect(state.ingredients[2].id).toBe('id-2');
    });

    it('should not move the first ingredient up', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [
          { ...mockMain, id: 'id-1' },
          { ...mockSauce, id: 'id-2' },
        ] as TConstructorIngredient[],
      };

      const action = moveIngredientUp(0);
      const state = constructorReducer(stateWithIngredients, action);

      expect(state.ingredients[0].id).toBe('id-1');
      expect(state.ingredients[1].id).toBe('id-2');
    });
  });

  describe('moveIngredientDown', () => {
    it('should move an ingredient down in the list', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [
          { ...mockMain, id: 'id-1' },
          { ...mockSauce, id: 'id-2' },
          { ...mockMain, id: 'id-3' },
        ] as TConstructorIngredient[],
      };

      const action = moveIngredientDown(0); // move index 0 down
      const state = constructorReducer(stateWithIngredients, action);

      expect(state.ingredients[0].id).toBe('id-2');
      expect(state.ingredients[1].id).toBe('id-1');
    });

    it('should not move the last ingredient down', () => {
      const stateWithIngredients = {
        bun: null,
        ingredients: [
          { ...mockMain, id: 'id-1' },
          { ...mockSauce, id: 'id-2' },
        ] as TConstructorIngredient[],
      };

      const action = moveIngredientDown(1);
      const state = constructorReducer(stateWithIngredients, action);

      expect(state.ingredients[0].id).toBe('id-1');
      expect(state.ingredients[1].id).toBe('id-2');
    });
  });

  describe('resetConstructor', () => {
    it('should reset constructor to initial state', () => {
      const stateWithItems = {
        bun: { ...mockBun, id: 'bun-id' } as TConstructorIngredient,
        ingredients: [
          { ...mockMain, id: 'id-1' },
          { ...mockSauce, id: 'id-2' },
        ] as TConstructorIngredient[],
      };

      const action = resetConstructor();
      const state = constructorReducer(stateWithItems, action);

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });
  });

  describe('extraReducers - submitOrder.fulfilled', () => {
    it('should reset constructor when order is submitted successfully', () => {
      const stateWithItems = {
        bun: { ...mockBun, id: 'bun-id' } as TConstructorIngredient,
        ingredients: [
          { ...mockMain, id: 'id-1' },
        ] as TConstructorIngredient[],
      };

      const action = { type: submitOrder.fulfilled.type, payload: {} };
      const state = constructorReducer(stateWithItems, action);

      expect(state.bun).toBeNull();
      expect(state.ingredients).toHaveLength(0);
    });
  });
});
