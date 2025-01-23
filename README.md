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
7. [License](#license)
8. [Acknowledgements](#acknowledgements)

---

## Overview

The **Cobalt Open Data Portal** is a modern, responsive frontend built with **React** that interacts with a **CKAN** backend via its RESTful API. It provides an intuitive interface for users to search, explore, and download datasets, as well as for administrators to manage data resources.

This project is currently in **alpha testing** and is being evaluated alongside other open data portal tools.

---

## Features

- **Search and Filter**: Easily search and filter datasets by keywords, organizations, and resource types.
- **Dataset Details**: View detailed information about datasets, including metadata, resources, and download links.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices.
- **CKAN API Integration**: Seamlessly communicates with a CKAN instance using its RESTful API.
- **Alpha Testing Tools**: Includes features for alpha testers to provide feedback and report issues.

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
   git clone https://github.com/your-username/cobalt-open-data-portal.git
   cd cobalt-open-data-portal
```

2. Install dependencies:
```bash
    npm install
```

3.  Start the development server:
```bash
    npm start
    Open your browser and navigate to http://localhost:3000.
```

### Configuration
To connect the frontend to your CKAN instance, update the API endpoint in the configuration file:

Open src/config.js.

Replace the CKAN_API_URL with your CKAN instance's API endpoint:

```javascript
export const CKAN_API_URL = 'https://your-ckan-instance/api/3/action';
```

## Usage
### For Users
Search for Datasets: Use the search bar on the homepage to find datasets by keyword.

Explore Datasets: Click on a dataset to view its details, including metadata and downloadable resources.

Download Resources: Download datasets in various formats (e.g., CSV, PDF).

### For Alpha Testers
Provide Feedback: Use the feedback form (accessible via the footer) to share your thoughts and report issues.

Test Features: Explore all features and provide feedback on usability, performance, and functionality.

## API Integration
The frontend interacts with CKAN using its RESTful API. Key API endpoints used include:

Package Search: /api/3/action/package_search

Package Show: /api/3/action/package_show

Organization List: /api/3/action/organization_list

For more information, refer to the CKAN API Documentation.
