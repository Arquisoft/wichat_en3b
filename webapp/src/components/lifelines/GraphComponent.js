import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const GraphComponent = ({ correctAnswer, distractors }) => {
  const [probabilities, setProbabilities] = useState({});

  useEffect(() => {
    const answers = [correctAnswer, ...distractors];

    let randomProbabilities = answers.map(() => Math.random());

    const totalProbability = randomProbabilities.reduce((acc, value) => acc + value, 0);
    randomProbabilities = randomProbabilities.map((prob) => prob / totalProbability);

    const correctAnswerIndex = 0;
    randomProbabilities[correctAnswerIndex] = Math.max(...randomProbabilities) + 0.1;

    const totalCorrectedProbability = randomProbabilities.reduce((acc, value) => acc + value, 0);
    randomProbabilities = randomProbabilities.map((prob) => prob / totalCorrectedProbability);

    const probabilityData = answers.reduce((acc, answer, index) => {
      acc[answer] = randomProbabilities[index];
      return acc;
    }, {});

    setProbabilities(probabilityData);
  }, [correctAnswer, distractors]);

  const data = Object.keys(probabilities).map((key) => ({
    answer: key,
    probability: probabilities[key] || 0,
    probabilityLabel: `${(probabilities[key] * 100).toFixed(1)}%` // Formato porcentaje
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="answer" tick={false} /> {/* Ocultar etiquetas del eje X */}
        <YAxis tick={false} /> {/* Ocultar etiquetas del eje Y */}
        <Tooltip />
        <Bar dataKey="probability" fill="#8884d8">
          {/* Mostrar el porcentaje arriba de la barra */}
          <LabelList dataKey="probabilityLabel" position="top" style={{ fill: 'black', fontSize: 14 }} />
          {/* Mostrar el nombre abajo de la barra */}
          <LabelList dataKey="answer" position="bottom" style={{ fill: 'gray', fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GraphComponent;