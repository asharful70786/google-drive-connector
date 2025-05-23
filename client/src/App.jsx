import  { useEffect, useState } from 'react';
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [files, setFiles] = useState([]);

  // Get Google Auth URL from backend
  const getGoogleAuthUrl = async () => {
    const res = await fetch('http://localhost:5000/auth/url');
    const { url } = await res.json();
    window.location.href = url;
  };

  // Fetch Drive files using token
  const loadFiles = async () => {
    const res = await fetch('http://localhost:5000/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setFiles(data);
  };

  // On redirect back from Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/auth-success') {
      const token = JSON.parse(decodeURIComponent(params.get('token')));
      setToken(token);
      window.history.replaceState(null, '', '/');  }
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Google Drive Media Viewer</h1>
      {!token ? (
        <button onClick={getGoogleAuthUrl}>Sign in with Google</button>
      ) : (
        <>
          <button onClick={loadFiles}>Load My Drive Media</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 200px)', gap: '1rem', marginTop: '2rem' }}>
           <div className="gallery">
  {files.map(file => (
    <div className="card" key={file.id}>
      <strong>{file.name}</strong>
      {file.thumbnailLink && <img src={file.thumbnailLink} alt={file.name} />}
      <p><a href={file.webViewLink} target="_blank" rel="noreferrer">View</a></p>
    </div>
  ))}
</div>

          </div>
        </>
      )}
    </div>
  );
}

export default App;
