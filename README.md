# Spotify Album & Track Review App 🎵

## 📌 About the Project
This is a mini-project built using **Node.js, Express, PostgreSQL, and the Spotify Web API**.  
The app allows users to:
- Log in with their Spotify account (OAuth2.0 flow).  
- Fetch their Spotify profile details.  
- View and manage their saved albums.  
- Write and store reviews for albums and individual tracks.  
- Persist reviews in a PostgreSQL database with proper relationships between users, albums, and tracks.  

## 🛠️ What I Learned
Through this project, I gained hands-on experience with:
- Implementing **OAuth2.0 authentication** using Spotify’s API.  
- Using **Express sessions** to manage user tokens securely.  
- Writing **PostgreSQL queries** (INSERT, UPDATE, UPSERT, foreign keys, etc.) and handling schema design for user–album–track relations.  
- Integrating **Axios** to make authenticated API calls to Spotify endpoints.  
- Working with **EJS templates** to render dynamic data and user reviews.  
- Debugging issues like unique constraint violations and handling **UPSERT logic** in PostgreSQL.  

## 🚀 Future Enhancements
Some improvements planned for the future:
- Show user reviews alongside each saved album for better integration.  
- Allow users to **edit existing reviews** directly from the UI.  
- Add pagination or search functionality for large saved album/track lists.  
- Implement a **dark/light theme toggle** for better user experience.  
- Improve frontend UI with richer animations and modern Spotify-like styling.  

## ⚡ Tech Stack
- **Backend:** Node.js, Express  
- **Frontend:** EJS, CSS  
- **Database:** PostgreSQL  
- **API:** Spotify Web API  
