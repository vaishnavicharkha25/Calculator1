const initialLogsState = {
    logs: []
  };
  
  export const calculatorReducer = (state = initialLogsState, action) => {
    switch (action.type) {
      case 'SET_LOGS':
        return { ...state, logs: action.payload };
      default:
        return state;
    }
  };