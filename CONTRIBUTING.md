# Contributing to Restaurant Management System

First off, thank you for considering contributing to Restaurant Management System! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why is this enhancement useful?
- **Possible implementation** if you have ideas

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (local or Atlas)

### Setup Steps

1. **Clone your fork**
```bash
git clone https://github.com/your-username/restaurant-management.git
cd restaurant-management
```

2. **Install dependencies**
```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

3. **Setup environment variables**
```bash
# Root .env
cp .env.example .env
# Edit .env with your values

# Client .env
cp client/.env.example client/.env
# Edit client/.env with your values
```

4. **Run development servers**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## 🔄 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update README.md** with details of changes if applicable
5. **Follow the coding standards** below
6. **Request review** from maintainers

### PR Checklist

- [ ] Code follows the project's coding standards
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated and passing
- [ ] Dependent changes merged and published

## 📝 Coding Standards

### JavaScript/React

- Use **ES6+** syntax
- Use **functional components** with hooks
- Use **meaningful variable names**
- Add **comments** for complex logic
- Keep functions **small and focused**
- Use **async/await** instead of promises when possible

### Example:
```javascript
// Good
const fetchMenuItems = async () => {
  try {
    const response = await axiosInstance.get('/api/menu');
    return response.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};

// Avoid
function getMenu() {
  return axiosInstance.get('/api/menu').then(res => res.data).catch(err => console.log(err));
}
```

### CSS

- Use **meaningful class names**
- Follow **BEM naming** convention when possible
- Use **mobile-first** approach
- Add **comments** for complex styles

### Example:
```css
/* Good */
.menu-item {
  padding: 16px;
}

.menu-item__title {
  font-size: 18px;
  font-weight: 600;
}

.menu-item--featured {
  border: 2px solid gold;
}

/* Mobile first */
@media (max-width: 768px) {
  .menu-item {
    padding: 12px;
  }
}
```

### Backend

- Use **async/await** for asynchronous operations
- Add **error handling** for all routes
- Use **middleware** for authentication
- Validate **input data**
- Add **comments** for complex logic

### Example:
```javascript
// Good
router.post('/menu', authMiddleware, async (req, res) => {
  try {
    const { name, price, category } = req.body;
    
    // Validate input
    if (!name || !price || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }
    
    const menuItem = await MenuItem.create({ name, price, category });
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});
```

## 💬 Commit Messages

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(menu): add search functionality

Add search bar to menu page with real-time filtering
by name and category.

Closes #123

---

fix(auth): resolve token expiration issue

Fixed bug where JWT tokens were expiring too quickly.
Updated token expiration to 7 days.

Fixes #456

---

docs(readme): update installation instructions

Added more detailed steps for MongoDB setup and
environment variable configuration.
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test
```

### Writing Tests
- Write tests for **new features**
- Update tests for **modified features**
- Ensure **all tests pass** before submitting PR

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Ant Design Documentation](https://ant.design/)

## ❓ Questions?

Feel free to:
- Open an issue for questions
- Join our discussions
- Contact maintainers

## 🙏 Thank You!

Your contributions make this project better for everyone. Thank you for taking the time to contribute! ⭐

---

**Happy Coding! 🚀**

