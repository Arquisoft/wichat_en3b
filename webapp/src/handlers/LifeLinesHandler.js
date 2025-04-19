import { useState } from "react"

const useLifeLinesHandler = (roundData, spendCoins) => {

  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [callFriendUsed, setCallFriendUsed] = useState(false);
  const [phoneOut, setPhoneOut] = useState(false);
  const [askAudience, setAskAudience] = useState(false);
  const [useChatUsed, setUseChatUsed] = useState(false);
  const [isCallFriendOpen, setIsCallFriendOpen] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [showGraph, setShowGraph] = useState(false); // State to control the visibility of GraphComponent

  const handleFiftyFifty = () => {
    if (fiftyFiftyUsed || !roundData || !spendCoins(100)) return

    // Find the correct answer index
    const correctIndex = roundData.items.findIndex((item) => item.name === roundData.itemWithImage.name)

    // Get two random incorrect indices
    let incorrectIndices = [0, 1, 2, 3].filter((i) => i !== correctIndex)
    // Shuffle and take first two
    incorrectIndices = incorrectIndices.sort(() => 0.5 - Math.random()).slice(0, 2)

    setHiddenOptions(incorrectIndices)
    setFiftyFiftyUsed(true)
  }

  const handleCallFriend = () => {
    if (callFriendUsed || !roundData) return;
    // Implement logic to simulate calling a friend
    // alert("Your friend thinks the answer might be: " + roundData.itemWithImage.name);
    setCallFriendUsed(true);
    setIsCallFriendOpen(true);
  };

  const handleCloseCallFriend = () => {
    setCallFriendUsed(false);
    setIsCallFriendOpen(false);
  };

  const handleAudienceCall = () => {
    if (askAudience || !roundData || !spendCoins(150)) return

    setAskAudience(true)
    setShowGraph(true); // Make the graph visible when the audience call is used
  }

  const handlePhoneOut = () => {
    if (phoneOut || !roundData) return;
    setPhoneOut(true);
  };

  const handlePhoneOutClose = () => {
    setPhoneOut(false);
  };

  const handleUseChat = () => {
    if (useChatUsed || !roundData || !spendCoins(200)) return
    
    // Implement logic to use the chat

    alert("Chat is now available to help you!")
    setUseChatUsed(true)
  }

  const isTrue = (lifeLine) => {
    switch(lifeLine) {
      case "50": return fiftyFiftyUsed;
      case "AskAudience": return askAudience;
      case "UseChat": return useChatUsed;
      case "CallFriend": return callFriendUsed;
      case "CallFriendOpen": return isCallFriendOpen;
      case "PhoneOut": return phoneOut;
      case "ShowGraph": return showGraph;
      default: alert("Unknown");
    }
  }

  const newGame = () => {
    setFiftyFiftyUsed(false);
    setCallFriendUsed(false);
    setPhoneOut(false);
    setAskAudience(false);
    setUseChatUsed(false);
    setHiddenOptions([]);
  }

  return { handleFiftyFifty, handleCallFriend, handleCloseCallFriend, handleAudienceCall, handlePhoneOut, handlePhoneOutClose, handleUseChat, 
    hiddenOptions, setHiddenOptions, isTrue, setShowGraph, newGame }
}

export default useLifeLinesHandler;