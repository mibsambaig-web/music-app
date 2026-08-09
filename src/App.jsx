import { useState, useRef, useEffect } from 'react'

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef(null)
  const intervalRef = useRef(null)

  const search = async () => {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=${query}&key=AIzaSyC1akkmZoYBdSVKy-Zgl6akiDwmXv37DCc`
    )
    const data = await res.json()
    setResults(data.items)
  }

  useEffect(() => {
    const loadSuggestions = async () => {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&q=talha+anjum+karan+aujla&maxResults=20&key=AIzaSyC1akkmZoYBdSVKy-Zgl6akiDwmXv37DCc`

      )

      const data = await res.json()
      setResults(data.items)
      const formatted = data.items.map(item => ({
        id: { videoId: item.id },
        snippet: item.snippet
      }))
      setResults(formatted)
    }

    loadSuggestions()
  }, [])

  const playSong = (item) => {
    setCurrentSong(item)
    setProgress(0)

    if (playerRef.current) {
      playerRef.current.loadVideoById(item.id.videoId)
      setIsPlaying(true)
    } else{
      playerRef.current = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        videoId: item.id.videoId,
        playerVars: { autoplay: 1 },
        events: {
          onReady: () => setIsPlaying(true), 
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              PlayNext()
            }
            if (e.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true)
              setDuration(playerRef.current.getDuration())

              clearInterval(intervalRef.current)
              intervalRef.current = setInterval(() => {
                const t = playerRef.current.getCurrentTime()
                const d = playerRef.current.getDuration()
                setProgress((t / d) * 100)
              }, 1000)
            }
            if (e.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false)
              clearInterval(intervalRef.current)
            }
          }
        } 
      })
    }
  }

  const playNext = () => {
    if (!currentSong || results.length === 0) return
    const idx = results.findIndex(r => r.id.videoId === currentSong.id.videoId)
    const next = results[idx + 1]
    if (next) playSong(next)
  }

  const togglePlay = () => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleSeek = (e) => {
    const val = e.target.value
    setProgress(val)
    if (playerRef.current) {
      playerRef.current.seekTo((val / 100) * duration)
    }
  }

  return (
    <div className="app">
      <h1>Mibbooo Music</h1>

      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Search for a song..."
        />
        <button onClick={search}>Search</button>
      </div>

      <div className="results">
        {results.map(item => (
          <div
            key={item.id.videoId}
            onClick={() => playSong(item)}
            className={`song-item ${currentSong?.id.videoId === item.id.videoId ? 'active' : ''}`}
          >
            <img src={item.snippet.thumbnails.default.url} />
            <div className="song-info">
              <p>{item.snippet.title}</p>
              <p>{item.snippet.channelTitle}</p>
            </div>
          </div>
        ))}
      </div>
      <div id="yt-player" /> 
      {currentSong && (
        <div className="player">
          <img src={currentSong.snippet.thumbnails.default.url} />
          <div className='player-info'>
            <p>{currentSong.snippet.title}</p>
            <p>{currentSong.snippet.channelTitle}</p>
          </div>
          <button onClick={togglePlay}>
            {isPlaying ? '⏸' : '▶'}
            </button>
            <input
            type="range"
            min="0" max="100"
            value={progress}
            onChange={handleSeek}
            className="progress-bar"
            />
            </div>
      )}

    </div>
    
  )
}


export default App