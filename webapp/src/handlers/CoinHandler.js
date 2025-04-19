import { useState } from "react";

const useCoinHandler = (axios, auth) => {
  const [coins, setCoins] = useState(0);
  const [spentCoins, setSpentCoins] = useState(0);

  const canAfford = (cost) => {
    return coins >= cost;
  }

  const spendCoins = async (cost) => {
    if (!canAfford(cost)) {
      alert("You don't have enough coins!");
      return false;
    }
    else {
      await updateUserCoins(-cost);
      setSpentCoins(prev => prev + cost);
      return true;
    }
  }

  const fetchUserCoins = async () => {
    if (auth && auth.username) {
      try {
        const response = await axios.get(`/usercoins/${auth.username}`);
        setCoins(response.data.coins);
      } catch (error) {
        console.error("Error fetching user coins:", error);
      }
    }
  };

  const updateUserCoins = async (amount) => {
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

  return { coins, spentCoins, setSpentCoins, canAfford, spendCoins, fetchUserCoins, updateUserCoins };
}

export default useCoinHandler;
