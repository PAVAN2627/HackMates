# Contributing to HackMates

First off, thank you for considering contributing to HackMates! It's people like you that make HackMates such a great platform for the developer community.

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if possible

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior** and **explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### 🔧 Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## 📝 Development Process

### Setting Up Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/HackMates.git
   cd HackMates
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Fill in your Firebase configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   └── hackathon/      # Hackathon-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── contexts/           # React Context providers
├── lib/                # Utility functions
└── types/              # TypeScript definitions
```

### 🎨 Coding Standards

#### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

#### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces
- Implement proper error boundaries

#### Styling
- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure responsive design
- Use semantic HTML elements

#### Code Quality
- Write self-documenting code
- Add comments for complex logic
- Follow ESLint rules
- Use meaningful commit messages

### 🧪 Testing

- Write unit tests for utility functions
- Test React components with React Testing Library
- Ensure all tests pass before submitting PR
- Add integration tests for critical user flows

### 📚 Documentation

- Update README.md if needed
- Document new features and APIs
- Add inline code comments
- Update TypeScript interfaces

## 🔄 Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add social login with Google
fix(chat): resolve message ordering issue
docs(readme): update installation instructions
```

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## 🎯 Development Guidelines

### Performance
- Optimize bundle size
- Use lazy loading for routes
- Implement proper caching strategies
- Monitor Core Web Vitals

### Accessibility
- Follow WCAG guidelines
- Use semantic HTML
- Ensure keyboard navigation
- Test with screen readers

### Security
- Validate all user inputs
- Use proper authentication
- Implement CSRF protection
- Follow Firebase security rules

### Mobile-First
- Design for mobile first
- Test on various screen sizes
- Ensure touch-friendly interfaces
- Optimize for performance on mobile

## 🚀 Release Process

1. **Version Bump**: Update version in `package.json`
2. **Changelog**: Update `CHANGELOG.md` with new features and fixes
3. **Testing**: Ensure all tests pass
4. **Documentation**: Update documentation if needed
5. **Release**: Create a new release on GitHub

## 📞 Getting Help

- **Discord**: Join our community Discord server
- **GitHub Issues**: For bug reports and feature requests
- **Email**: Contact the maintainers directly
- **Documentation**: Check the comprehensive docs

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Community Discord
- Annual contributor highlights

## 📄 License

By contributing to HackMates, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to HackMates! Together, we're building the future of hackathon collaboration in India.** 🚀