import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Nav from './components/Nav';
import DashboardPage from './components/DashboardPage';
import ClaimInspectorPage from './components/ClaimInspectorPage';
import FeaturesPage from './components/FeaturesPage';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClaimId, setSelectedClaimId] = useState(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockClaims = [
        {id:'CLM-2024-8841',provider:'Dr. Martinez',amount:'₹18,400',icd:'Z00.00',risk:'high',score:87,flags:'Overbill, velocity'},
        {id:'CLM-2024-8840',provider:'City Radiology',amount:'₹3,200',icd:'M54.5',risk:'med',score:58,flags:'Duplicate suspected'},
        {id:'CLM-2024-8839',provider:'St. Hope Hosp.',amount:'₹940',icd:'J06.9',risk:'low',score:12,flags:'None'},
        {id:'CLM-2024-8838',provider:'NPI 9876543',amount:'₹7,100',icd:'F32.1',risk:'high',score:79,flags:'Network cluster'},
        {id:'CLM-2024-8837',provider:'Westside Clinic',amount:'₹210',icd:'Z23',risk:'low',score:8,flags:'None'},
        {id:'CLM-2024-8836',provider:'Dr. Patel',amount:'₹4,500',icd:'E11.65',risk:'med',score:44,flags:'Upcoding signal'},
        {id:'CLM-2024-8835',provider:'FastMed Inc.',amount:'₹22,000',icd:'Z00.01',risk:'high',score:93,flags:'Overbill, ghost'},
        {id:'CLM-2024-8834',provider:'Lakeview Lab',amount:'₹380',icd:'Z13.6',risk:'low',score:19,flags:'None'},
      ];
      
      setClaims(mockClaims);
      if (mockClaims.length > 0 && !selectedClaimId) {
        setSelectedClaimId(mockClaims[0].id);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load mock claims.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectClaim = (id) => {
    setSelectedClaimId(id);
    setActiveTab('claim');
  };

  return (
    <div className="app flex flex-col min-h-screen bg-bg text-text font-sans">
      <Header />
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="content p-5 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red/10 border border-red/25 text-red px-4 py-3 rounded font-mono text-sm">
            {error}
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage 
                claims={claims} 
                onInspect={handleInspectClaim} 
              />
            )}
            {activeTab === 'claim' && (
              <ClaimInspectorPage 
                claimId={selectedClaimId} 
                onSelectClaim={setSelectedClaimId}
                claims={claims}
              />
            )}
            {activeTab === 'features' && <FeaturesPage />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
