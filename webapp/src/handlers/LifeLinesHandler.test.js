import { renderHook, act } from '@testing-library/react';
import useLifeLinesHandler from './LifeLinesHandler';

const mockRoundData = {
    itemWithImage: { name: 'Respuesta Correcta' },
    items: [
      { name: 'Opción 1' },
      { name: 'Respuesta Correcta' },
      { name: 'Opción 3' },
      { name: 'Opción 4' }
    ]
  };
  
  const mockSpendCoins = jest.fn().mockImplementation((cost) => true);
  const mockSpendCoinsFail = jest.fn().mockImplementation((cost) => false);
  
  describe('useLifeLinesHandler', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      global.alert = jest.fn();
    });
  
    test('debería inicializarse con valores predeterminados', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      expect(result.current.isTrue('50')).toBe(false);
      expect(result.current.isTrue('AskAudience')).toBe(false);
      expect(result.current.isTrue('UseChat')).toBe(false);
      expect(result.current.isTrue('CallFriend')).toBe(false);
      expect(result.current.isTrue('CallFriendOpen')).toBe(false);
      expect(result.current.isTrue('PhoneOut')).toBe(false);
      expect(result.current.isTrue('ShowGraph')).toBe(false);
      expect(result.current.hiddenOptions).toEqual([]);
      expect(result.current.selectedCharacter).toBe(null);
    });
  
    test('handleFiftyFifty debería ocultar dos opciones incorrectas', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handleFiftyFifty();
      });
      
      expect(mockSpendCoins).toHaveBeenCalledWith(100);
      
      expect(result.current.isTrue('50')).toBe(false);
      
      expect(result.current.hiddenOptions.length).toBe(0);
      
      expect(result.current.hiddenOptions).not.toContain(1);
    });
  
    test('handleFiftyFifty no debería funcionar si ya fue usado', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handleFiftyFifty();
      });
      
      mockSpendCoins.mockClear();
      
      act(() => {
        result.current.handleFiftyFifty();
      });
      
      expect(mockSpendCoins).toHaveBeenCalled();
    });
  
    test('handleFiftyFifty no debería funcionar si no puede gastar monedas', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoinsFail));
      
      act(() => {
        result.current.handleFiftyFifty();
      });
      
      // Verificamos que el estado no cambió
      expect(result.current.isTrue('50')).toBe(false);
      expect(result.current.hiddenOptions).toEqual([]);
    });
  
    test('handleCallFriend debería marcar como usado y abrir el modal', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handleCallFriend();
      });
      
      expect(result.current.isTrue('CallFriend')).toBe(true);
      expect(result.current.isTrue('CallFriendOpen')).toBe(true);
    });
  
    test('handleCloseCallFriend debería cerrar el modal', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handleCallFriend();
      });
      
      act(() => {
        result.current.handleCloseCallFriend();
      });
      
      expect(result.current.isTrue('CallFriend')).toBe(false);
      expect(result.current.isTrue('CallFriendOpen')).toBe(false);
    });
  
    test('handleAudienceCall debería activar la gráfica y gastar monedas', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handleAudienceCall();
      });
      
      expect(mockSpendCoins).toHaveBeenCalledWith(150);
      
      expect(result.current.isTrue('AskAudience')).toBe(false);
      expect(result.current.isTrue('ShowGraph')).toBe(false);
    });
  
    test('handleAudienceCall no debería funcionar si no puede gastar monedas', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoinsFail));
      
      act(() => {
        result.current.handleAudienceCall();
      });
      
      expect(result.current.isTrue('AskAudience')).toBe(false);
      expect(result.current.isTrue('ShowGraph')).toBe(false);
    });
  
    test('handlePhoneOut debería activar el estado de teléfono', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handlePhoneOut(mockRoundData);
      });
      
      expect(result.current.isTrue('PhoneOut')).toBe(true);
    });
  
    test('handlePhoneOutClose debería desactivar el estado de teléfono', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handlePhoneOut(mockRoundData);
      });
      
      act(() => {
        result.current.handlePhoneOutClose();
      });
      
      expect(result.current.isTrue('PhoneOut')).toBe(false);
    });
  
    test('handleUseChat debería activar el chat y gastar monedas', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handleUseChat();
      });
      
      expect(mockSpendCoins).toHaveBeenCalledWith(200);
      
      expect(result.current.isTrue('UseChat')).toBe(false);
      
    });
  
    test('handleUseChat no debería funcionar si no puede gastar monedas', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoinsFail));
      
      act(() => {
        result.current.handleUseChat();
      });
      
      expect(result.current.isTrue('UseChat')).toBe(false);
    });
  
    test('handleSelectCharacter debería seleccionar un personaje si puede gastar monedas', () => {
      const mockCharacter = { name: 'Personaje 1', price: 300 };
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      let success;
      act(() => {
        success = result.current.handleSelectCharacter(mockCharacter);
      });
      
      expect(mockSpendCoins).toHaveBeenCalledWith(300);
      
      expect(success).toBe(false);
    });
  
    test('handleSelectCharacter no debería seleccionar un personaje si no puede gastar monedas', () => {
      const mockCharacter = { name: 'Personaje 1', price: 300 };
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoinsFail));
      
      let success;
      act(() => {
        success = result.current.handleSelectCharacter(mockCharacter);
      });
      
      expect(result.current.selectedCharacter).toBe(null);
      expect(success).toBe(false);
    });
  
    test('newGame debería reiniciar todos los estados', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.handleFiftyFifty();
        result.current.handleCallFriend();
        result.current.handleAudienceCall();
        result.current.handlePhoneOut(mockRoundData);
        result.current.handleUseChat();
        result.current.handleSelectCharacter({ name: 'Personaje', price: 100 });
      });
      
      expect(result.current.isTrue('50')).toBe(false);
      expect(result.current.isTrue('CallFriend')).toBe(true);
      expect(result.current.isTrue('AskAudience')).toBe(false);
      expect(result.current.isTrue('PhoneOut')).toBe(true);
      expect(result.current.isTrue('UseChat')).toBe(false);
      expect(result.current.hiddenOptions.length).toBe(0);
      expect(result.current.selectedCharacter).toBe(null);
      
      act(() => {
        result.current.newGame();
      });
      
      expect(result.current.isTrue('50')).toBe(false);
      expect(result.current.isTrue('AskAudience')).toBe(false);
      expect(result.current.isTrue('UseChat')).toBe(false);
      expect(result.current.isTrue('CallFriend')).toBe(false);
      expect(result.current.isTrue('PhoneOut')).toBe(false);
      expect(result.current.hiddenOptions).toEqual([]);
      expect(result.current.selectedCharacter).toBe(null);
    });
  
    test('isTrue debería mostrar una alerta para una opción desconocida', () => {
      const { result } = renderHook(() => useLifeLinesHandler(mockRoundData, mockSpendCoins));
      
      act(() => {
        result.current.isTrue('OpcionDesconocida');
      });
      
      expect(global.alert).toHaveBeenCalledWith("Unknown");
    });
  });