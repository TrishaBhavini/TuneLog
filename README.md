# TuneLog — Spotify Album & Track Review Application

**Live Application:** https://tunelog.onrender.com/

TuneLog is a full-stack web application that integrates the **Spotify Web API** with a **PostgreSQL database** to allow users to explore their saved albums and create reviews for the saved albums and their respective tracks.

The project was developed to gain practical experience with **OAuth 2.0 authentication, REST API integration, server-side rendering, session management, relational database design, and PostgreSQL queries**.

## Features

* **Spotify OAuth 2.0 Authentication**

  * Users authenticate through their Spotify account.
  * Authorization Code flow is used to obtain Spotify access and refresh tokens.
  * User profile information is retrieved through the Spotify Web API.

* **Saved Album Management**

  * Retrieves albums saved in the user's Spotify library.
  * Displays album and track information using Spotify API data.

* **Album Reviews**

  * Users can write and update reviews for albums.
  * Reviews are persisted in PostgreSQL.
  * PostgreSQL `UPSERT` logic prevents duplicate reviews for the same user and album.

* **Track Reviews**

  * Users can write and update reviews for individual tracks.
  * Track metadata and reviews are stored in PostgreSQL.

* **Session Management**

  * Express sessions maintain authenticated user state.
  * Spotify access and refresh tokens are associated with the user's session.

* **Relational Data Persistence**

  * PostgreSQL is used to store users, albums, tracks, and reviews.
  * Foreign-key relationships and unique constraints maintain data integrity.

## Architecture

```text
User
 │
 ▼
EJS / Express Application
 │
 ├── Spotify OAuth 2.0
 │        │
 │        ▼
 │   Spotify Web API
 │
 └── PostgreSQL
      ├── User information
      ├── Album information
      ├── Track information
      ├── Album reviews
      └── Track reviews
```

The application is deployed as a Node.js web service on **Render**, with PostgreSQL used as the persistent data layer.

## Technology Stack

| Layer              | Technology             |
| ------------------ | ---------------------- |
| Runtime            | Node.js                |
| Backend            | Express.js             |
| Frontend           | EJS, HTML, CSS         |
| Authentication     | Spotify OAuth 2.0      |
| API Integration    | Spotify Web API, Axios |
| Database           | PostgreSQL             |
| Database Driver    | `pg`                   |
| Session Management | `express-session`      |
| Configuration      | `dotenv`               |
| Deployment         | Render                 |

## Project Structure

```text
TuneLog/
│
├── public/                 # Static assets such as CSS and client-side files
│
├── views/                  # EJS templates
│   ├── login.ejs
│   ├── profile.ejs
│   ├── saved-album.ejs
│   └── album-deets.ejs
│
├── index.js                # Express application and API routes
├── queries.sql             # PostgreSQL schema and queries
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Locked dependency versions
└── README.md
```

## Authentication Flow

TuneLog uses Spotify's **OAuth 2.0 Authorization Code flow**.

```text
User
 │
 │ Login
 ▼
TuneLog
 │
 │ Authorization request
 ▼
Spotify
 │
 │ Authorization code
 ▼
TuneLog /callback
 │
 │ Exchange code for tokens
 ▼
Spotify API
 │
 │ Access token + refresh token
 ▼
Express Session
 │
 ▼
Authenticated application
```

The application stores the Spotify access token and refresh token within the user's server-side session. When an access token expires, the application uses the refresh token to request a new access token.

Environment variables are used for sensitive configuration such as:

```text
CLIENT_ID
CLIENT_SECRET
SESSION_SECRET
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
REDIRECT_URI
```

Secrets are not stored directly in the source code.

## Database

PostgreSQL is used to persist application data.

The database maintains relationships between users, albums, tracks, and reviews. SQL operations include:

* `INSERT`
* `SELECT`
* `UPDATE`
* `UPSERT`
* `ON CONFLICT`
* Foreign-key relationships
* Unique constraints

The application uses parameterized queries through the `pg` library to interact with PostgreSQL.

## API Integration

TuneLog communicates with the Spotify Web API using Axios.

Key API operations include:

* Retrieving the authenticated user's Spotify profile
* Retrieving the user's saved albums
* Retrieving album metadata
* Retrieving album tracks
* Refreshing expired Spotify access tokens

The application sends the user's access token through the HTTP `Authorization` header when making authenticated Spotify API requests.

## Deployment

The application is deployed on Render:

**Live:** https://tunelog.onrender.com/

Production configuration uses environment variables for database credentials, Spotify credentials, session configuration, and the production OAuth redirect URI.

## Key Learning Outcomes

This project provided hands-on experience with:

* Designing and implementing an OAuth 2.0 authentication flow
* Managing authenticated sessions with Express
* Integrating third-party REST APIs
* Handling access-token expiration and refresh flows
* Designing relational PostgreSQL schemas
* Writing parameterized SQL queries
* Implementing PostgreSQL `UPSERT` operations
* Maintaining data integrity using constraints and relationships
* Server-side rendering with EJS
* Managing application secrets through environment variables
* Deploying a Node.js application to a cloud hosting platform

## Future Improvements

* Display existing reviews alongside saved albums and tracks.
* Improve the review editing experience.
* Add pagination and search for large album collections.
* Introduce improved authentication/session handling for production use.
* Add responsive UI improvements and a dark/light theme.
* Improve error handling and user-facing error messages.
* Add automated tests for API routes and database operations.
* Improve session persistence using a production-ready shared session store.
