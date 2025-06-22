import React, { useEffect, useState } from 'react'
import './App.css'

interface Patron {
  id: string;
  name: string;
  email?: string;
  birthday?: string;
  joinedAt: string;
  loyaltyProgramJoinedAt: string;
  totalPints: number;
  avatarUrl?: string;
}

interface LeaderboardEntry {
  patronId: string;
  patronName: string;
  totalPints: number;
  rank: number;
}

interface PintLogEntry {
  patronId: string;
  patronName: string;
  quantity: number;
}

const App: React.FC = () => {
  console.log('App component is loading!');
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'log-pints'>('leaderboard');
  
  // Pint logging state
  const [selectedPatrons, setSelectedPatrons] = useState<PintLogEntry[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [logMessage, setLogMessage] = useState('');
  const [patronSearch, setPatronSearch] = useState('');

  useEffect(() => {
    checkApiStatus();
    fetchData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + 1 for leaderboard, Ctrl/Cmd + 2 for log pints
      if ((event.ctrlKey || event.metaKey) && event.key === '1') {
        event.preventDefault();
        setActiveTab('leaderboard');
      } else if ((event.ctrlKey || event.metaKey) && event.key === '2') {
        event.preventDefault();
        setActiveTab('log-pints');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/health');
      if (response.ok) {
        setApiStatus('🟢 Connected');
      } else {
        setApiStatus('🔴 Error');
      }
    } catch {
      setApiStatus('🔴 Disconnected');
    }
  };

  const fetchData = async () => {
    try {
      const [patronsResponse, leaderboardResponse] = await Promise.all([
        fetch('http://localhost:4000/api/patrons'),
        fetch('http://localhost:4000/api/leaderboard')
      ]);

      if (patronsResponse.ok && leaderboardResponse.ok) {
        const patronsData = await patronsResponse.json();
        const leaderboardData = await leaderboardResponse.json();
        
        setPatrons(patronsData);
        setLeaderboard(leaderboardData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter patrons based on search
  const filteredPatrons = patrons.filter(patron =>
    patron.name.toLowerCase().includes(patronSearch.toLowerCase()) ||
    patron.id.toLowerCase().includes(patronSearch.toLowerCase())
  );

  const addPatronToLog = (patron: Patron) => {
    const existing = selectedPatrons.find(p => p.patronId === patron.id);
    if (existing) {
      setSelectedPatrons(prev => prev.map(p => 
        p.patronId === patron.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      setSelectedPatrons(prev => [...prev, {
        patronId: patron.id,
        patronName: patron.name,
        quantity: 1
      }]);
    }
  };

  const updatePatronQuantity = (patronId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedPatrons(prev => prev.filter(p => p.patronId !== patronId));
    } else {
      setSelectedPatrons(prev => prev.map(p => 
        p.patronId === patronId ? { ...p, quantity } : p
      ));
    }
  };

  const logPints = async () => {
    if (selectedPatrons.length === 0) return;

    setIsLogging(true);
    setLogMessage('');

    try {
      const pintsData = selectedPatrons.map(patron => ({
        patronId: patron.patronId,
        bartenderId: 'bartender-123', // TODO: Get from auth
        quantity: patron.quantity
      }));

      const response = await fetch('http://localhost:4000/api/pints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pints: pintsData })
      });

      if (response.ok) {
        const result = await response.json();
        setLogMessage(`✅ Successfully logged ${result.summary.totalPints} pints!`);
        setSelectedPatrons([]);
        // Refresh data
        setTimeout(() => {
          fetchData();
          setLogMessage('');
        }, 2000);
      } else {
        const error = await response.text();
        setLogMessage(`❌ Error: ${error}`);
      }
    } catch {
      setLogMessage('❌ Network error - please try again');
    } finally {
      setIsLogging(false);
    }
  };

  const totalPintsToLog = selectedPatrons.reduce((sum, patron) => sum + patron.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-800">Loading StoutScout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🍺 StoutScout</h1>
              <p className="text-orange-100">The Dead Poet's Loyalty Tracker</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-100">API Status: {apiStatus}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-md mb-4">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'leaderboard'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-orange-600'
            }`}
            title="Leaderboard (Ctrl+1)"
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('log-pints')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors text-sm ${
              activeTab === 'log-pints'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-orange-600'
            }`}
            title="Log Pints (Ctrl+2)"
          >
            🍺 Log Pints
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {/* Quick Stats - More Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Patrons</h3>
                <p className="text-2xl font-bold text-orange-600">{patrons.length}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Top Patron</h3>
                <p className="text-lg font-bold text-orange-600">
                  {leaderboard[0]?.patronName || 'N/A'}
                </p>
                <p className="text-xs text-gray-600">
                  {leaderboard[0]?.totalPints || 0} pints
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Pints</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {patrons.reduce((sum, patron) => sum + patron.totalPints, 0)}
                </p>
              </div>
            </div>

            {/* Leaderboard - More Compact */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-700">
                <h2 className="text-lg font-bold text-white">🏆 Top Patrons</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {leaderboard.map((entry, index) => (
                  <div key={entry.patronId} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{entry.patronName}</p>
                          <p className="text-xs text-gray-600">#{entry.patronId.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-600">{entry.totalPints}</p>
                        <p className="text-xs text-gray-600">pints</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing top {leaderboard.length} patrons
                </div>
                <button
                  onClick={() => setActiveTab('log-pints')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  🍺 Log Pints
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'log-pints' && (
          <div className="space-y-4">
            {/* Log Message */}
            {logMessage && (
              <div className={`p-3 rounded-lg ${
                logMessage.includes('✅') 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {logMessage}
              </div>
            )}

            {/* Compact Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Patron Selection - Left Side */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-700">
                  <h2 className="text-lg font-bold text-white">👥 Select Patrons</h2>
                </div>
                <div className="p-4">
                  {/* Search Input */}
                  <div className="mb-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Search patrons by name or ID..."
                        value={patronSearch}
                        onChange={(e) => setPatronSearch(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                      {filteredPatrons.length > 0 && (
                        <button
                          onClick={() => {
                            filteredPatrons.forEach(patron => addPatronToLog(patron));
                            setPatronSearch('');
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          title="Add all filtered patrons"
                        >
                          Add All
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                      {filteredPatrons.map((patron) => (
                        <button
                          key={patron.id}
                          onClick={() => addPatronToLog(patron)}
                          className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">{patron.name}</div>
                              <div className="text-sm text-gray-600">
                                {patron.totalPints} pints • #{patron.id.slice(0, 8)}
                              </div>
                            </div>
                            <div className="text-orange-600 font-bold">+</div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {filteredPatrons.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        {patronSearch ? 'No patrons found matching your search' : 'No patrons available'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Selected Patrons - Right Side */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700">
                  <h2 className="text-lg font-bold text-white">
                    🍺 Pints to Log ({totalPintsToLog})
                  </h2>
                </div>
                <div className="p-4">
                  {selectedPatrons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🍺</div>
                      <p>Select patrons from the left to start logging pints</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {selectedPatrons.map((patron) => (
                        <div key={patron.patronId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{patron.patronName}</p>
                            <p className="text-sm text-gray-600">#{patron.patronId.slice(0, 8)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updatePatronQuantity(patron.patronId, patron.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors text-sm"
                            >
                              -
                            </button>
                            <span className="text-lg font-bold text-gray-900 min-w-[1.5rem] text-center">
                              {patron.quantity}
                            </span>
                            <button
                              onClick={() => updatePatronQuantity(patron.patronId, patron.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedPatrons.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 mt-4">
                      <button
                        onClick={logPints}
                        disabled={isLogging}
                        className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-red-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLogging ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Logging Pints...
                          </span>
                        ) : (
                          `Log ${totalPintsToLog} Pint${totalPintsToLog !== 1 ? 's' : ''}`
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {selectedPatrons.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{selectedPatrons.length}</span> patron{selectedPatrons.length !== 1 ? 's' : ''} selected
                  </div>
                  <button
                    onClick={() => setSelectedPatrons([])}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
