const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'backend-api',
    message: 'SmartIntern AI backend is running',
  });
};

module.exports = {
  getHealth,
};

