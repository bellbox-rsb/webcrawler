# Technical Architecture

[← Back to README](../README.md)

## Project Structure

```
backend/
├── app/
│   ├── services/       # Core logic (Crawler, Extractors)
│   ├── api/            # Route handlers
│   └── __init__.py     # App factory
├── tests/              # Pytest tests
├── run.py              # Entry point
└── requirements.txt    # Python dependencies
```

## Key Components

### Crawler Service
- **Orchestrator**: `crawl_url()` handles the flow.
- **Extractors**: Strategy pattern for distinct content types (Youtube, generic).
- **Tech Detector**: Rules-based detection of frameworks/servers.

### Error Handling
Standardized JSON responses for 400/500 errors.
