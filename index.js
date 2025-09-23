import express from "express";
import bodyParser from "body-parser"; 
import pg from "pg";
import dotenv from "dotenv";
import querystring from 'querystring'; 
import axios from "axios";
import session from "express-session";
dotenv.config();

const app=express();
const port=3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "album",
  password: "learner",
  port: 5432,
});
db.connect();

app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine','ejs');

var client_id = process.env.CLIENT_ID;
var client_secret=process.env.CLIENT_SECRET;
var redirect_uri = 'http://127.0.0.1:3000/callback';

app.get("/",(req,res)=>{
  res.render("login.ejs");
});

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}

var state;

app.get('/auth/login', function(req, res) {

  var scope = 'user-read-private user-read-email user-library-read';
  state = generateRandomString(16);
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback',async function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  
  if (state === null) {
    return res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } 
    try {
    // Exchange code for access & refresh tokens
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token',
      querystring.stringify({
        code,
        redirect_uri,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;
    // Fetch user profile using access token
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    req.session.user_id = userResponse.data.id;

    await db.query("INSERT INTO user_info(spotify_ID,spotify_username) VALUES($1,$2) ON CONFLICT (spotify_ID) DO NOTHING",[userResponse.data.id,userResponse.data.display_name]);

    const albumResponse=await db.query("SELECT album_id,album_name,review from album_review where user_id=$1",[req.session.user_id]);

    const trackResponse=await db.query("SELECT album_id,track_name,review from track_review where user_id=$1",[req.session.user_id]);

    // Redirect back to frontend with tokens
    res.render("profile.ejs",{
      user:userResponse.data,
      albumReviews:albumResponse.rows,
      trackReviews:trackResponse.rows
    });

  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
  }
});

async function spotifyApiRequest(req, url, method = "GET", data = null, params = null) {
  let access_token = req.session.access_token;

  try {
    // Try the request with the current token
    const response = await axios({
      method,
      url,
      headers: { Authorization: `Bearer ${access_token}` },
      data,
      params
    });

    return response.data;
  } catch (error) {
    // If token expired (401 Unauthorized), refresh it
    if (error.response && error.response.status === 401) {
      console.log("Access token expired. Refreshing...");

      try {
        const refreshResponse = await axios.post(
          "https://accounts.spotify.com/api/token",
          querystring.stringify({
            grant_type: "refresh_token",
            refresh_token: req.session.refresh_token
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization:
                "Basic " +
                Buffer.from(`${client_id}:${client_secret}`).toString("base64")
            }
          }
        );

        // Save new token in session
        access_token = refreshResponse.data.access_token;
        req.session.access_token = access_token;

        // Retry the original request with the new token
        const retryResponse = await axios({
          method,
          url,
          headers: { Authorization: `Bearer ${access_token}` },
          data,
          params
        });

        return retryResponse.data;
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError.message);
        throw refreshError;
      }
    } else {
      // Some other error (not token expiry)
      console.error("Spotify API request failed:", error.message);
      throw error;
    }
  }
}

app.get('/saved_albums',async(req,res)=>{
  const access_token = req.session.access_token;
  const response=await axios.get('https://api.spotify.com/v1/me/albums',{
  headers:{
    'Authorization': `Bearer ${access_token}`
  }
});
res.render("saved-album.ejs",{albums:response.data});
});

app.get('/album/:id',async(req,res)=>{
  const access_token = req.session.access_token;
  const albumID=req.params.id;
  const response = await spotifyApiRequest(req, `https://api.spotify.com/v1/albums/${albumID}`);
  const tracks=await spotifyApiRequest(req,`https://api.spotify.com/v1/albums/${albumID}/tracks`);
  for(const item of tracks.items){
    await db.query("INSERT into track_info (track_id,track_name) VALUES ($1,$2) ON CONFLICT (track_id) DO NOTHING",[item.id,item.name]);
  }
  req.session.albumID = albumID;
  req.session.albumName = response.name;
  res.render("album-deets.ejs",{album:response});
});


app.post("/album/:id/review", async (req, res) => {
  const review = req.body.albumreview;
  const album_id = req.params.id;

  req.session.albumID = album_id;

  try {
    // UPSERT: insert new review or update if exists
    await db.query(
      `INSERT INTO album_review (user_id, album_id, album_name, review)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (album_id, user_id)
       DO UPDATE SET review = EXCLUDED.review`,
      [req.session.user_id, album_id, req.session.albumName, review]
    );
    res.redirect(`/album/${album_id}`);
  } catch (error) {
    console.error("Album review error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/track/:id/review", async (req, res) => {
  const user_id = req.session.user_id;
  const album_id = req.session.albumID;
  const review = req.body.trackreview;
  const track_id = req.params.id;

  try {
    // Get track name
    const trackResult = await db.query(
      "SELECT track_name FROM track_info WHERE track_id=$1",
      [track_id]
    );
    const track_name = trackResult.rows[0]?.track_name;

    // UPSERT: insert new review or update if exists
    await db.query(
      `INSERT INTO track_review (track_id, track_name, user_id, album_id, review)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (track_id, user_id)
       DO UPDATE SET review = EXCLUDED.review`,
      [track_id, track_name, user_id, album_id, review]
    );

    res.redirect(`/album/${album_id}`);
  } catch (error) {
    console.error("Track review error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.get('/refresh_token', async (req, res) => {
  const { refresh_token } = req.query;

  try {
    const refreshResponse = await axios.post('https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64')
        }
      }
    );

    res.json({
      access_token: refreshResponse.data.access_token,
      refresh_token: refreshResponse.data.refresh_token
    });
  } catch (error) {
    console.error('Refresh failed:', error.response?.data || error.message);
    res.status(400).json({ error: 'Could not refresh token' });
  }
});

app.listen(port,()=>{
  console.log("Server is running on port.");
});



