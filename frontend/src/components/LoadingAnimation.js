// src/components/LoadingAnimation.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const LoadingAnimation = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        <ShoppingCartIcon 
          sx={{ 
            fontSize: 60, 
            color: '#b51f19',
            mb: 2
          }} 
        />
      </motion.div>
      
      <Typography 
        variant="h6" 
        color="text.secondary"
      >
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Carregando...
        </motion.span>
      </Typography>
    </Box>
  );
};

export default LoadingAnimation;