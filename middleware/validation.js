/**
 * Validation middleware for user-related requests
 */
const validateUserInput = (req, res, next) => {
  const { userName, email, password } = req.body;
  const errors = [];

  if (!userName || userName.trim() === '') {
    errors.push('Username is required');
  }

  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validation middleware for task-related requests
 */
const validateTaskInput = (req, res, next) => {
  const { title, creatorId } = req.body;
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push('Title is required');
  }

  if (!creatorId) {
    errors.push('Creator ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

/**
 * Validation middleware for task completion requests
 */
const validateCompletionInput = (req, res, next) => {
  const { taskId, userId } = req.body;
  const errors = [];

  if (!taskId) {
    errors.push('Task ID is required');
  }

  if (!userId) {
    errors.push('User ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateUserInput,
  validateTaskInput,
  validateCompletionInput
}; 