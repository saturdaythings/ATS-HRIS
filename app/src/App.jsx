import { useState, useEffect } from 'react';
import { getApiBaseUrl } from './config';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [candidates, setCandidates] = useState([]);
  const [devices, setDevices] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', stage: 'prospect' });

  useEffect(() => {
    fetchMetrics();
    fetchCandidates();
    fetchDevices();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/dashboard/metrics`);
      const data = await res.json();
      setMetrics(data.data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/candidates?limit=10`);
      const data = await res.json();
      setCandidates(data.data || []);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/devices?limit=10`);
      const data = await res.json();
      setDevices(data.data || []);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ name: '', email: '', stage: 'prospect' });
        setShowAddCandidate(false);
        fetchCandidates();
      }
    } catch (err) {
      console.error('Failed to add candidate:', err);
    }
    setLoading(false);
  };

  const styles = {
    container: { display: 'flex', height: '100vh', background: '#f8f9fa' },
    sidebar: {
      width: '280px',
      background: '#2c3e50',
      color: 'white',
      padding: '30px 20px',
      overflow: 'auto',
      borderRight: '1px solid #34495e',
    },
    logo: { fontSize: '24px', fontWeight: 'bold', marginBottom: '40px', color: '#ecf0f1' },
    navBtn: {
      display: 'block',
      width: '100%',
      padding: '12px 16px',
      margin: '8px 0',
      background: 'transparent',
      color: '#ecf0f1',
      border: '1px solid #34495e',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      textAlign: 'left',
      transition: 'all 0.2s',
    },
    activeNavBtn: {
      background: '#3498db',
      borderColor: '#3498db',
      fontWeight: 'bold',
    },
    main: { flex: 1, padding: '40px', overflow: 'auto', background: 'white' },
    header: { marginBottom: '30px', borderBottom: '2px solid #ecf0f1', paddingBottom: '20px' },
    title: { fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#2c3e50' },
    subtitle: { color: '#7f8c8d', margin: 0 },
    btn: {
      padding: '10px 16px',
      background: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginRight: '10px',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
    card: {
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
    },
    cardValue: { fontSize: '28px', fontWeight: 'bold', color: '#3498db', margin: '10px 0' },
    cardLabel: { color: '#7f8c8d', margin: 0 },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '20px',
    },
    th: { padding: '12px', textAlign: 'left', background: '#ecf0f1', fontWeight: 'bold', borderBottom: '2px solid #bdc3c7' },
    td: { padding: '12px', borderBottom: '1px solid #ecf0f1' },
    form: { background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px' },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      border: '1px solid #bdc3c7',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>V.Two Ops</div>
        <nav>
          {['dashboard', 'candidates', 'devices'].map(item => (
            <button
              key={item}
              onClick={() => setPage(item)}
              style={{
                ...styles.navBtn,
                ...(page === item ? styles.activeNavBtn : {}),
              }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div style={styles.main}>
        {page === 'dashboard' && (
          <div>
            <div style={styles.header}>
              <h1 style={styles.title}>Dashboard</h1>
              <p style={styles.subtitle}>Real-time metrics overview</p>
            </div>

            <div style={styles.grid}>
              <div style={styles.card}>
                <p style={styles.cardLabel}>Open Candidates</p>
                <p style={styles.cardValue}>{metrics?.candidatesInPipeline || '--'}</p>
              </div>
              <div style={styles.card}>
                <p style={styles.cardLabel}>In Onboarding</p>
                <p style={styles.cardValue}>{metrics?.onboardingInProgress || '--'}</p>
              </div>
              <div style={styles.card}>
                <p style={styles.cardLabel}>Devices Assigned</p>
                <p style={styles.cardValue}>{metrics?.deviceAssignments || '--'}</p>
              </div>
              <div style={styles.card}>
                <p style={styles.cardLabel}>Total Devices</p>
                <p style={styles.cardValue}>{metrics?.deviceInventory?.total || '--'}</p>
              </div>
            </div>
          </div>
        )}

        {page === 'candidates' && (
          <div>
            <div style={styles.header}>
              <h1 style={styles.title}>Candidates</h1>
              <p style={styles.subtitle}>ATS pipeline management</p>
              <button
                style={styles.btn}
                onClick={() => setShowAddCandidate(!showAddCandidate)}
              >
                {showAddCandidate ? 'Cancel' : 'Add Candidate'}
              </button>
            </div>

            {showAddCandidate && (
              <form style={styles.form} onSubmit={addCandidate}>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <input
                  style={styles.input}
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <select
                  style={styles.input}
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                >
                  <option>prospect</option>
                  <option>applied</option>
                  <option>screening</option>
                  <option>interview</option>
                  <option>offer</option>
                </select>
                <button type="submit" style={styles.btn} disabled={loading}>
                  {loading ? 'Adding...' : 'Add Candidate'}
                </button>
              </form>
            )}

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Stage</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.id}>
                    <td style={styles.td}>{c.name}</td>
                    <td style={styles.td}>{c.email}</td>
                    <td style={styles.td}><strong>{c.stage}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {page === 'devices' && (
          <div>
            <div style={styles.header}>
              <h1 style={styles.title}>Device Inventory</h1>
              <p style={styles.subtitle}>Asset management and tracking</p>
            </div>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Serial</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Condition</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(d => (
                  <tr key={d.id}>
                    <td style={styles.td}>{d.type}</td>
                    <td style={styles.td}>{d.serialNumber || '-'}</td>
                    <td style={styles.td}><strong>{d.status}</strong></td>
                    <td style={styles.td}>{d.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
