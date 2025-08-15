# Contributing to Echo Hallucination Detection

Thank you for your interest in contributing to Echo Hallucination Detection! This guide will help you get started with contributing to the project.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Contribution Workflow](#contribution-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Deployment](#deployment)

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **Git**
- **OpenAI API Key** (for LLM integration)

### Fork and Clone
1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/echo-hallucination-detect.git
cd echo-hallucination-detect
```

## Development Setup

### 1. Environment Configuration
Create environment files for both frontend and backend:

```bash
# Root directory - Backend environment
cp .env.example .env
# Edit .env and add your OpenAI API key
```

Example `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4
OPENAI_API_BASE=https://api.openai.com/v1
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install Python dependencies
pip install -r requirements.txt

# Start the development server
python -m server.main
```

The backend will be available at `http://localhost:8001`

### 3. Frontend Setup
```bash
# Navigate to client directory
cd client

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5174`

## Project Structure

### Frontend (`/client`)
```
client/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── AnalysisSection.tsx
│   │   ├── ChatPanel.tsx
│   │   └── ...
│   ├── lib/                # Utilities and API client
│   ├── types.ts            # TypeScript type definitions
│   └── App.tsx             # Main application
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
└── tailwind.config.js      # Tailwind CSS configuration
```

### Backend (`/server`)
```
server/
├── routes/                 # API route handlers
├── services/               # Business logic services
├── models/                 # Data models and schemas
├── utils/                  # Utility functions
├── config.py              # Configuration management
├── main.py                # Application entry point
└── requirements.txt       # Python dependencies
```

## Coding Standards

### TypeScript/JavaScript (Frontend)
- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **Prettier** for code formatting
- Prefer **functional components** with hooks
- Use **descriptive variable names**

Example component structure:
```typescript
interface Props {
  title: string;
  onSubmit: (data: FormData) => void;
}

export function MyComponent({ title, onSubmit }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {/* Component content */}
    </div>
  );
}
```

### Python (Backend)
- Follow **PEP 8** style guide
- Use **type hints** for all functions
- Use **async/await** for I/O operations
- Follow **FastAPI** best practices
- Use **Pydantic** models for data validation

Example service structure:
```python
from typing import Optional
from pydantic import BaseModel

class AnalysisRequest(BaseModel):
    prompt: str
    options: Optional[dict] = None

class AnalysisService:
    def __init__(self, llm_client: LLMClient):
        self.llm_client = llm_client
    
    async def analyze_prompt(self, request: AnalysisRequest) -> AnalysisResponse:
        """Analyze a prompt for hallucination risks."""
        try:
            result = await self.llm_client.analyze(request.prompt)
            return AnalysisResponse(
                risk_assessment=result.risk_assessment,
                summary=result.summary
            )
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            raise
```

### CSS/Styling
- Use **Tailwind CSS** classes
- Follow **mobile-first** responsive design
- Use **CSS custom properties** for theming
- Prefer **utility classes** over custom CSS

## Contribution Workflow

### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes
- Write clear, concise commit messages
- Keep commits focused and atomic
- Test your changes locally

### 3. Commit Guidelines
Follow conventional commit format:
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
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(frontend): add file upload functionality"
git commit -m "fix(backend): resolve XML parsing edge case"
git commit -m "docs(readme): update installation instructions"
```

### 4. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```

Create a pull request with:
- Clear title and description
- Reference any related issues
- Include screenshots for UI changes
- List breaking changes if any

## Testing Guidelines

### Frontend Testing
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Build project (tests compilation)
npm run build
```

### Backend Testing
```bash
# Run tests (when available)
python -m pytest

# Run linting
flake8 server/

# Type checking
mypy server/
```

### Manual Testing Checklist
- [ ] Frontend builds without errors
- [ ] Backend starts without errors
- [ ] API endpoints respond correctly
- [ ] UI components render properly
- [ ] Dark/light mode works
- [ ] File upload functionality works
- [ ] Chat interface responds
- [ ] Risk assessment displays correctly

## Documentation

### Code Documentation
- Add **JSDoc comments** for complex functions
- Use **docstrings** for Python functions
- Update **type definitions** when changing interfaces
- Keep **README** files up to date

### API Documentation
- Document new endpoints in code
- Include request/response examples
- Update OpenAPI schemas (automatically generated by FastAPI)

## Deployment

### Frontend Deployment
```bash
cd client
npm run build
# Deploy dist/ folder to your hosting platform
```

### Backend Deployment
```bash
cd server
# Create production environment file
# Deploy using your preferred platform (Docker, AWS, etc.)
```

## Common Issues and Solutions

### Environment Issues
- **OpenAI API Key**: Ensure your API key is valid and has sufficient credits
- **Port Conflicts**: Check if ports 8001 (backend) or 5174 (frontend) are in use
- **CORS Errors**: Verify backend is running on correct port

### Development Issues
- **TypeScript Errors**: Run `npm run type-check` to identify type issues
- **Build Failures**: Clear node_modules and reinstall dependencies
- **Python Import Errors**: Ensure you're running from the correct directory

## Getting Help

### Resources
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Documentation**: Check the `/docs` folder for detailed guides

### Contact
- Create an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## Code of Conduct

### Our Standards
- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or insults
- Publishing private information
- Spam or off-topic content

## Recognition

Contributors will be acknowledged in:
- **Contributors file**
- **Release notes** for significant contributions
- **GitHub contributors** section

Thank you for contributing to Echo Hallucination Detection! 🎉
