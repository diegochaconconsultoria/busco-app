const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar autenticação
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Verificar se o token existe no header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Faça login para continuar.' });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o usuário ainda existe
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    // Adicionar usuário à requisição
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

// Middleware para verificar tipo de conta
exports.restrictTo = (...accountTypes) => {
  return (req, res, next) => {
    if (!accountTypes.includes(req.user.accountType)) {
      return res.status(403).json({ 
        message: 'Você não tem permissão para acessar este recurso' 
      });
    }
    next();
  };
};


