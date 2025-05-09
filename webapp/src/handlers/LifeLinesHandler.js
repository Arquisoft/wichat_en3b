import { useState } from "react"

const useLifeLinesHandler = (roundData, spendCoins) => {
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [callFriendUsed, setCallFriendUsed] = useState(false);
  const [askAudience, setAskAudience] = useState(false);
  const [isCallFriendOpen, setIsCallFriendOpen] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [showGraph, setShowGraph] = useState(false); // State to control the visibility of GraphComponent
  const [selectedCharacter, setSelectedCharacter] = useState(null);

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

  const handleSelectCharacter = (character) => {
    if (!roundData || !spendCoins(character.price)) return false;
    
    setSelectedCharacter(character);
    return true;
  };

  const isTrue = (lifeLine) => {
    switch(lifeLine) {
      case "50": return fiftyFiftyUsed;
      case "AskAudience": return askAudience;
      case "CallFriend": return callFriendUsed;
      case "CallFriendOpen": return isCallFriendOpen;
      case "ShowGraph": return showGraph;
      default: alert("Unknown");
    }
  }

  const newGame = () => {
    setFiftyFiftyUsed(false);
    setCallFriendUsed(false);
    setAskAudience(false);
    setHiddenOptions([]);
    setSelectedCharacter(null);
  }

  return { handleFiftyFifty, handleCallFriend, handleCloseCallFriend, handleAudienceCall, selectedCharacter,
    handleSelectCharacter, hiddenOptions, isTrue, setHiddenOptions, setShowGraph, newGame }
}

export default useLifeLinesHandler;