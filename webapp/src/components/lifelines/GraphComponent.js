import { useEffect, useState } from 'react';
import { Box, useTheme, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const GraphComponent = ({ correctAnswer, distractors }) => {
  const [probabilities, setProbabilities] = useState({});
  const theme = useTheme();

  useEffect(() => {
    const answers = [correctAnswer, ...distractors];
    let randomProbabilities = answers.map(() => Math.random());
    const total = randomProbabilities.reduce((acc, val) => acc + val, 0);
    randomProbabilities = randomProbabilities.map(p => p / total);

    const correctIndex = 0;
    randomProbabilities[correctIndex] = Math.max(...randomProbabilities) + 0.1;

    const correctedTotal = randomProbabilities.reduce((acc, val) => acc + val, 0);
    randomProbabilities = randomProbabilities.map(p => p / correctedTotal);

    const probData = answers.reduce((acc, answer, i) => {
      acc[answer] = randomProbabilities[i];
      return acc;
    }, {});

    setProbabilities(probData);
  }, [correctAnswer, distractors]);

  const data = Object.keys(probabilities).map((key) => ({
    answer: key.toUpperCase(),
    probability: probabilities[key] || 0,
    probabilityLabel: probabilities[key] > 0 ? `${(probabilities[key] * 100).toFixed(1)}%` : ''
  }));

  return (
    <Box sx={{
      width: '100%',
      p: 3,
      background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
      borderRadius: '30px',
      border: `5px solid ${theme.palette.primary.main}`,
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Top Title */}
      <Typography
        variant="h4" // Hacemos que sea h4 para más tamaño
        sx={{
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', md: '2rem' },
          letterSpacing: '3px',
          color: theme.palette.primary.main,
          mb: 1,
          textTransform: 'uppercase',
        }}
      >
        📺 Live Poll
      </Typography>

      {/* Inner TV */}
      <Box sx={{
        width: '100%',
        height: 300,
        background: theme.palette.background.paper,
        borderRadius: '20px',
        padding: 2,
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis type="number" hide domain={[0, 1]} />
            <YAxis
              dataKey="answer"
              type="category"
              tick={{
                fontSize: 16,
                fontWeight: 'bold',
                fill: theme.palette.text.primary,
              }}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                fontSize: 12,
                color: theme.palette.text.primary,
              }}
              formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
            />
            <Bar
              dataKey="probability"
              fill={theme.palette.primary.main}
              radius={[0, 10, 10, 0]}
              barSize={28}
            >
              <LabelList
                dataKey="probabilityLabel"
                position="right"
                style={{
                  fill: theme.palette.text.primary,
                  fontWeight: 'bold',
                  fontSize: 13,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GraphComponent;