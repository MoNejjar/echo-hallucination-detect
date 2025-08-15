# Echo Hallucination Detection - Architecture

## Overview

Echo Hallucination Detection is a full-stack web application that provides real-time analysis of AI prompts to identify potential hallucination risks using advanced LLM-based assessment techniques.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   React Client  │◄──►│  FastAPI Server │◄──►│   OpenAI API    │
│   (Frontend)    │    │   (Backend)     │    │     (LLM)       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │
│   Static Files  │    │  Configuration  │
│   (Assets)      │    │   (.env files)  │
│                 │    │                 │
└─────────────────┘    └─────────────────┘
```

## Frontend Architecture (React + TypeScript)

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn/UI components
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Fetch API
- **Icons**: Lucide React

### Component Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── AnalysisSection.tsx    # Main analysis display
│   ├── AnalysisView.tsx       # Analysis results view
│   ├── ChatPanel.tsx          # Chat interface
│   ├── Editor.tsx             # Text editor with file upload
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── ThemeProvider.tsx      # Dark/light mode
├── lib/
│   ├── api.ts          # API client
│   └── utils.ts        # Utility functions
├── types.ts            # TypeScript type definitions
└── App.tsx            # Main application component
```

### Key Frontend Features
- **Real-time Analysis**: Live prompt analysis with progress indicators
- **Expandable Risk Sections**: Collapsible UI for detailed risk criteria
- **File Upload**: Drag-and-drop or click-to-upload prompt files
- **Chat Interface**: Interactive prompt refinement with LLM assistance
- **Theme Support**: Dark/light mode with system preference detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Backend Architecture (FastAPI + Python)

### Technology Stack
- **Framework**: FastAPI
- **Language**: Python 3.13+
- **HTTP Server**: Uvicorn
- **LLM Integration**: OpenAI GPT API
- **Data Validation**: Pydantic
- **Environment**: python-dotenv

### Project Structure
```
server/
├── routes/
│   ├── analyze.py      # Prompt analysis endpoints
│   ├── health.py       # Health check endpoints
│   ├── refine.py       # Prompt refinement endpoints
│   └── refine_stream.py # Streaming refinement
├── services/
│   ├── llm.py          # OpenAI LLM service
│   ├── checker.py      # Analysis logic
│   ├── assistant.py    # Chat assistant
│   └── sanitizer.py    # Input sanitization
├── models/
│   ├── prompt.py       # Prompt data models
│   └── response.py     # Response data models
├── utils/
│   ├── logging.py      # Logging configuration
│   └── highlight_parser.py # Text parsing utilities
├── config.py           # Configuration management
└── main.py            # FastAPI application entry point
```

### API Endpoints

#### Analysis Endpoints
- `POST /api/analyze/` - Analyze prompt for hallucination risks
- `GET /api/health/` - Health check

#### Refinement Endpoints
- `POST /api/refine/` - Get prompt refinement suggestions
- `GET /api/refine/stream` - Streaming refinement (SSE)

#### Debug Endpoints (Development)
- `GET /api/debug/test` - Basic connectivity test
- `GET /api/debug/env` - Environment configuration check

## Data Models

### Risk Assessment Structure
```typescript
interface RiskCriterion {
  name: string;           // Criterion name (e.g., "Ambiguous References")
  risk: 'high' | 'medium' | 'low';  // Risk level
  percentage: number;     // Risk percentage (0-100)
  description: string;    // Detailed description
}

interface OverallAssessment {
  percentage: number;     // Overall risk percentage
  description: string;    // Summary assessment
}

interface RiskAssessment {
  criteria: RiskCriterion[];
  overall_assessment: OverallAssessment;
}
```

### API Response Format
```typescript
interface AnalyzePromptResponse {
  annotated_prompt: string;        // HTML-highlighted prompt
  analysis_summary: string;        // Human-readable summary
  risk_assessment?: RiskAssessment; // Structured risk data
}
```

## LLM Integration

### OpenAI GPT Integration
- **Model**: GPT-4 (configurable)
- **Purpose**: 
  - Hallucination risk assessment
  - Prompt improvement suggestions
  - Interactive chat assistance

### XML-Structured Responses
The system uses XML formatting to extract structured data from LLM responses:

```xml
<RISK_ASSESSMENT>
  <CRITERION name="Ambiguous References" risk="high" percentage="85">
    Pronouns and unclear subject references that may lead to confusion
  </CRITERION>
  <CRITERION name="Context Completeness" risk="medium" percentage="60">
    Sufficient background information provided
  </CRITERION>
  <OVERALL_ASSESSMENT percentage="72">
    The prompt shows high potential for hallucination due to ambiguous references
  </OVERALL_ASSESSMENT>
</RISK_ASSESSMENT>
```

## Security Considerations

### Environment Variables
- API keys stored in `.env` files (excluded from git)
- Separate configuration for development/production
- Environment validation on startup

### CORS Configuration
- Configured for development (localhost)
- Should be restricted for production deployment

### Input Sanitization
- HTML sanitization for user inputs
- File upload validation
- Rate limiting (recommended for production)

## Deployment Architecture

### Development Environment
```
Frontend (Vite): http://localhost:5174
Backend (Uvicorn): http://localhost:8001
```

### Production Considerations
- **Frontend**: Build static files, serve via CDN or web server
- **Backend**: Deploy on cloud platform (AWS, GCP, Azure)
- **Environment**: Use container orchestration (Docker/Kubernetes)
- **Database**: Consider adding persistent storage for analytics
- **Caching**: Implement Redis for response caching
- **Monitoring**: Add logging and monitoring services

## Performance Considerations

### Frontend Optimizations
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization with Vite

### Backend Optimizations
- Async/await for non-blocking operations
- Connection pooling for external APIs
- Response caching for repeated requests
- Background task processing for long-running analyses

## Scalability

### Horizontal Scaling
- Stateless backend design enables load balancing
- Frontend can be served from CDN
- Database sharding for user data (if added)

### Vertical Scaling
- Increase server resources for LLM processing
- Memory optimization for large prompt handling
- CPU optimization for text processing algorithms

## Monitoring and Observability

### Logging
- Structured logging with correlation IDs
- Error tracking and alerting
- Performance metrics collection

### Health Checks
- Application health endpoints
- Database connectivity checks
- External service dependency monitoring

## Future Enhancements

### Technical Improvements
- Add database layer for prompt history
- Implement user authentication and authorization
- Add real-time collaboration features
- Integrate multiple LLM providers

### Feature Enhancements
- Batch prompt analysis
- Custom risk criteria configuration
- Export analysis reports
- Integration with popular writing tools
