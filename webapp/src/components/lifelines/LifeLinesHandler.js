export default class LifeLineHandler {

    constructor({ 
      coinManager, 
      getState, 
      setState 
    }) {
      this.coinManager = coinManager;
      this.getState = getState;  
      this.setState = setState;  
    }
  
    useFiftyFifty() {
      const state = this.getState();
      if (state.fiftyFiftyUsed || !state.roundData) return;
  
      if (!this.coinManager.spendCoins(100)) return;
  
      const correctIndex = state.roundData.items.findIndex(
        (item) => item.name === state.roundData.itemWithImage.name
      );
  
      let incorrectIndices = [0, 1, 2, 3].filter((i) => i !== correctIndex);
      incorrectIndices = incorrectIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
  
      this.setState({
        fiftyFiftyUsed: true,
        hiddenOptions: incorrectIndices
      });
    }
  
    useCallFriend() {
      const state = this.getState();
      if (state.callFriendUsed || !state.roundData) return;
  
      this.setState({
        callFriendUsed: true,
        isCallFriendOpen: true
      });
    }
  
    closeCallFriend() {
      this.setState({
        callFriendUsed: false,
        isCallFriendOpen: false
      });
    }
  
    useAudienceCall() {
      const state = this.getState();
      if (state.askAudience || !state.roundData) return;
  
      if (!this.coinManager.spendCoins(150)) return;
  
      this.setState({
        askAudience: true,
        showGraph: true
      });
    }
  }
  