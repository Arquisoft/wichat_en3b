import { useState } from "react";

const useCoinHandler = () => {
  const [coins, setCoins] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);

  const getCoins = () => {
    return coins;
  }

  const getSpentCoins = () => {
    return spentCoins;
  }

  const canAfford = (cost) => {
    return coins >= cost;
  }

  const spendCoins = (cost) => {
    if (!canAfford(cost)) 
      alert("You don't have enough coins!");
    else {
      setCoins(coins - cost);
      setSpentCoins(spentCoins + cost);
      updateUserCoins(-cost);
    }
  }

  const fetchUserCoins = async (axios, auth) => {
    if (auth && auth.username) {
      try {
        const response = await axios.get(`/usercoins/${auth.username}`);
        setCoins(response.data.coins);
      } catch (error) {
        console.error("Error fetching user coins:", error);
      }
    }
  };

  const updateUserCoins = async (axios, auth, amount) => {
    try {
      const response = await axios.post("/updatecoins", {
        username: auth.username,
        amount: amount
      });
      setCoins(response.data.newBalance);
      return true;
    } catch (error) {
      console.error("Error updating user coins:", error);
      return false;
    }
  };

  const updateSpentCoins = (spent) => {
    setSpentCoins(spent);
  };

  return { getCoins, getSpentCoins, canAfford, spendCoins, fetchUserCoins, updateUserCoins, updateSpentCoins };
}

export default useCoinHandler;
