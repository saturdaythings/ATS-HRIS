export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>V.Two Ops - ATS Platform</h1>
      <p>✅ Frontend is running!</p>
      <p>Backend API: <a href="http://localhost:3001/api/health" target="_blank">http://localhost:3001/api/health</a></p>
      <hr />
      <h2>Dashboard</h2>
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '10px' }}>
        <h3>Metrics</h3>
        <p>Open Candidates: Loading...</p>
        <p>Onboarding in Progress: Loading...</p>
        <p>Device Assignments: Loading...</p>
      </div>
      <h2>Navigation</h2>
      <ul>
        <li>Candidates</li>
        <li>Onboarding</li>
        <li>Devices</li>
        <li>Reports</li>
        <li>Search</li>
      </ul>
    </div>
  );
}
