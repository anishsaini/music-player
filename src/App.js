import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Function to generate a color based on string
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Function to get initials from title
const getInitials = (title) => {
  return title
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const cleanSongTitle = (title) => {
    return title.replace('[SPOTDOWNLOADER.COM] ', '');
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/songs');
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      const data = await response.json();
      setSongs(data.map(song => ({
        ...song,
        title: cleanSongTitle(song.title)
      })));
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleProgressChange = (e) => {
    const time = e.target.value;
    setCurrentTime(time);
    audioRef.current.currentTime = time;
  };

  const handleVolumeChange = (e) => {
    const volume = e.target.value;
    setVolume(volume);
    audioRef.current.volume = volume;
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSongSelect = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex + 1) % songs.length);
    setIsPlaying(false);
  };

  const handlePrevious = () => {
    setCurrentSongIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
    setIsPlaying(false);
  };

  if (isLoading) {
    return <div className="loading"></div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchSongs}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="player-container">
        <div className="player">
          <div className="cover-art">
            <div 
              className="cover-image"
              style={{ backgroundColor: stringToColor(songs[currentSongIndex]?.title) }}
            >
              <div className="cover-initials">
                {getInitials(songs[currentSongIndex]?.title)}
              </div>
            </div>
          </div>
          <div className="song-info">
            <h2>{songs[currentSongIndex]?.title}</h2>
            <p>{songs[currentSongIndex]?.artist}</p>
          </div>
          <div className="controls">
            <button onClick={handlePrevious}>⏮</button>
            <button className="play-pause" onClick={handlePlayPause}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={handleNext}>⏭</button>
          </div>
          <div className="progress-container">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleProgressChange}
              className="progress-bar"
            />
          </div>
          <div className="time-info">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="volume-container">
            <span>🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
            <span>🔊</span>
          </div>
        </div>
        <div className="playlist">
          <h3>Playlist</h3>
          <ul>
            {songs.map((song, index) => (
              <li
                key={index}
                className={index === currentSongIndex ? 'active' : ''}
                onClick={() => handleSongSelect(index)}
              >
                {song.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={songs[currentSongIndex]?.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />
    </div>
  );
}

export default App;
