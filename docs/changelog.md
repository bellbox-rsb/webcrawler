# Changelog

All notable changes to the WebCrawler project.

## [v2.1.1] - 2025-12-28
### Fixed
-   **Dependencies**: Added `setuptools` to `requirements.txt` to fix `ModuleNotFoundError: No module named 'pkg_resources'` required by `python-Wappalyzer`.

## [v2.1.0] - 2025-12-28
### Added
-   **Deployment**: Support for Vercel Serverless Functions via `api/index.py` and `vercel.json`.

### Fixed
-   **Deployment**: Fixed `ModuleNotFoundError: No module named 'Wappalyzer'` by updating `requirements.txt` to use `python-Wappalyzer`.

## [v2.0.0] - 2024-12-28
### Released
-   **New UI**: Complete redesign using **Tailwind CSS** and "Nexus" aesthetic (Dark mode, glassmorphism).
-   **Core Refactor**: Modularized `crawler.py` with type hints and robust error handling.
-   **Live Documentation**: Added `/docs` route to view project documentation in-app.
-   **Mobile Support**: Fully responsive navigation and layout.

## [v1.1.0] - 2024-12-27
### Added
-   **QuillJS Editor**: Replaced standard textarea with rich text editor.
-   **Client-Side Save**: Native file saving using File System Access API.
-   **Copy Button**: Instant clipboard copy for Markdown.

## [v1.0.0] - 2024-12-26
### Released
-   Initial release with basic crawling and tech stack detection.
