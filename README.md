# Cobalt Open Data Portal (Alpha)

A React-based frontend for CKAN, designed to provide a user-friendly interface for exploring and managing open data. This project is part of an alpha testing phase to evaluate its effectiveness among a range of open data portal tools.



---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Configuration](#configuration)
4. [Usage](#usage)
5. [API Integration](#api-integration)
6. [Contributing](#contributing)

---

## Overview

The Cobalt Open Data Portal is a frontend built with React that interacts with a CKAN backend via its RESTful API.

This project is currently in alpha testing and is being evaluated alongside other open data portal tools. It follows the Scottish Government Design System to ensure consistency with public sector digital services.
---

## Features

- **Search and Filter**: Easily search and filter datasets by keywords, organizations, and resource types.
- **Dataset Details**: View detailed information about datasets, including metadata, resources, and download links.
- **CKAN API Integration**: Seamlessly communicates with a CKAN instance using its RESTful API.
- **CSV Exploration**: Allows users to visualize and slice data from CSV resources.

---

## Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (v8 or higher)
- A running instance of [CKAN](https://ckan.org/) (for backend API)

## Installation

1. Clone the repository:
```bash
   git clone https://github.com/ScotGovAnalysis/CobaltDataPlatform.git
   cd CobaltDataPlatform
```

2. Install dependencies:
```bash
    npm install
```

### Configuration

Before running the project, configure the environment:

1.  Copy the appropriate environment template:

For development:
```bash
    cp .env.development.template .env.development
```

For release:
```bash
   cp .env.release.template .env.release
```
2.  Populate the .env.development or .env.release file with the necessary configuration values.

## Usage
### Running in Development

To start the development server:

```bash
   npm start
```
Open your browser and navigate to http://localhost:3000.

### Building for Production
To create a development build:

```bash
   npm run build:dev
```
To create a release build:

```bash
   npm run build:release
```

To serve the built app locally:

```bash
   npx serve -s build --single -l 3000
```

## API Integration
The frontend interacts with CKAN using its RESTful API. Key API endpoints used include:

- Package Search: /api/3/action/package_search

- Package Show: /api/3/action/package_show

- Organisation List: /api/3/action/organization_list

For more information, refer to the CKAN API Documentation.

## Contributing
We welcome contributions! Please follow these guidelines when reporting issues:

- Bug Description (include screenshots if possible)
- Expected Behavior
- Actual Behavior
- Steps to Reproduce
For feature requests, please describe the proposed functionality and its potential impact.
