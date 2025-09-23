-- Users table
CREATE TABLE user_info (
    sno SERIAL UNIQUE NOT NULL,
    spotify_id TEXT PRIMARY KEY,
    spotify_username TEXT NOT NULL UNIQUE
);

-- Album reviews (composite key: album + user)
CREATE TABLE album_review (
    sno SERIAL UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    album_id TEXT NOT NULL,
    album_name TEXT NOT NULL,
    review TEXT NOT NULL,
    PRIMARY KEY (album_id, user_id),
    FOREIGN KEY (user_id) REFERENCES user_info(spotify_id)
);

-- Track info (reference table for track metadata)
CREATE TABLE track_info (
    sno SERIAL NOT NULL,
    track_id TEXT PRIMARY KEY,
    track_name TEXT NOT NULL
);

-- Track reviews (composite key: track + user)
CREATE TABLE track_review (
    sno SERIAL UNIQUE NOT NULL,
    track_id TEXT NOT NULL,
    track_name TEXT NOT NULL,
    user_id TEXT NOT NULL,
    album_id TEXT NOT NULL,
    review TEXT NOT NULL,
    PRIMARY KEY (track_id, user_id),
    FOREIGN KEY (user_id) REFERENCES user_info(spotify_id),
    FOREIGN KEY (album_id) REFERENCES album_review(album_id)
);
