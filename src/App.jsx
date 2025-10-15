import React, { useState, useEffect, useRef } from 'react';
import { Search, User, History, Download, Copy, ExternalLink, Zap, ToggleLeft, ToggleRight, Brain } from 'lucide-react';
import OpenAI from 'openai';

// ResultCard Component
const ResultCard = ({ result, templates, aiSearchEnabled, selectedChannel, copyTemplate, exportHistory }) => {
  const [showAngry, setShowAngry] = useState(false);
  
  const defaultTemplate = {
    neutral: {
      inapp: `Zalopay đã ghi nhận vấn đề "${result.title}". Chúng tôi đang xử lý theo hướng dẫn: ${result.solution}`,
      livechat: `Xin chào! Về vấn đề "${result.title}", chúng tôi sẽ hỗ trợ bạn theo quy trình: ${result.solution}`,
      email: `Kính gửi quý khách,\n\nVề vấn đề: ${result.title}\n\nChúng tôi đang xử lý theo hướng dẫn.\n\nTrân trọng,\nTeam Zalopay CS`
    },
    angry: {
      inapp: `Zalopay xin lỗi vì bạn gặp vấn đề này. Chúng tôi sẽ ưu tiên xử lý ngay cho bạn.`,
      livechat: `Tôi hiểu bạn đang bức xúc. Để tôi ưu tiên hỗ trợ bạn ngay.`,
      email: `Kính gửi quý khách,\n\nZalopay chân thành xin lỗi. Chúng tôi đang ưu tiên xử lý.\n\nTrân trọng,\nTeam Zalopay CS`
    }
  };
  
  const displayTemplates = templates || defaultTemplate;
  
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-gray-800">
              {result.errorCode}: {result.title}
            </h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {result.scope}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {Math.round(result.matchScore || 0)}%
            </span>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span>📦 {result.product}</span>
            <span>•</span>
            <span>🔧 {result.feature}</span>
            <span>•</span>
            <span className={result.severity?.includes('L1') ? 'text-red-600 font-medium' : 'text-gray-600'}>
              ⚠️ {result.severity}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => exportHistory()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
        >
          <Download size={16} />
          Export
        </button>
        <a
          href={result.sopLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
        >
          <ExternalLink size={16} />
          Xem SOP gốc
        </a>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
        <p className="text-gray-700"><strong>🔍 Nguyên nhân:</strong> {result.cause}</p>
        <p className="text-gray-700"><strong>✅ Hướng xử lý:</strong> {result.solution}</p>
        {result.notes && <p className="text-gray-700"><strong>📝 Lưu ý:</strong> {result.notes}</p>}
      </div>

      {aiSearchEnabled && displayTemplates && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-purple-50 rounded-lg p-3">
            <span className="text-sm font-medium text-purple-800">
              KH bức xúc?
            </span>
            <button
              onClick={() => setShowAngry(!showAngry)}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
            >
              {showAngry ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              <span className="text-sm font-medium">
                {showAngry ? 'Bản calming' : 'Bản neutral'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`bg-green-50 rounded-lg p-4 border-2 ${!showAngry ? 'border-green-500' : 'border-transparent'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  😊 Template Neutral
                </h4>
                <button
                  onClick={() => copyTemplate(displayTemplates.neutral[selectedChannel])}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {displayTemplates.neutral[selectedChannel]}
              </pre>
            </div>

            <div className={`bg-orange-50 rounded-lg p-4 border-2 ${showAngry ? 'border-orange-500' : 'border-transparent'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                  😤→😌 Template Calming
                </h4>
                <button
                  onClick={() => copyTemplate(displayTemplates.angry[selectedChannel])}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-xs font-medium"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {displayTemplates.angry[selectedChannel]}
              </pre>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200 mt-4">
        <span className="flex items-center gap-1">
          📄 {result.sopFile}
        </span>
        <span>
          📍 {result.sourceType}
        </span>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [learnedUsers, setLearnedUsers] = useState([]);
  const [aiSearchEnabled, setAiSearchEnabled] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('inapp');
  const [isSearching, setIsSearching] = useState(false);
  
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [templates, setTemplates] = useState({});
  const [embeddings, setEmbeddings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const userInputRef = useRef(null);
  const openaiRef = useRef(null);

  const WEBHOOK_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL';
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';

  const CS_AGENTS = [
    'HongLNP', 'BaoNT9', 'CanhPQ', 'ChienNT', 'CuongNT10', 'HangPTV', 'HieuMTT', 
    'HieuVNN', 'HuyBQ', 'LanDNT', 'NganNTB3', 'NhiHY3', 'ThangDQ7', 
    'ThaoLNT', 'ThyLVM', 'ToanPB', 'TrucHNT2', 'AnhMH', 'DatNTT', 
    'HaoVD', 'HieuTK3', 'KienNT', 'LinhHTM3', 'LinhLTT4', 'NhuTDQ', 
    'PhungLM3', 'PhuongDTT', 'PhuongMBH', 'ThaoTTT14', 'TrangPTT6', 
    'TranHH', 'TrinhNTT7', 'TuTNT', 'XuanNTT5', 'DaoVT', 'NhiNTT4', 
    'ThaoNTP16', 'ThienNB', 'TuyenNTK2', 'VanPNH', 'VyDTT', 'AnNTH3', 
    'ThamNTH3', 'BinhPLV', 'DuocNT', 'MinhVG', 'NgocNTN6', 'QueTN', 
    'ThuHTM', 'ThuVA', 'QuiTP', 'MaiLTN', 'HuyGG', 'TuKT', 'YenDTH', 
    'DoanPNK', 'QuyNP', 'QuyenTTT', 'TrinhNNV', 'TrangNTH', 'ThienLPM', 
    'TrangHTT2'
  ];

  const allUsers = [...new Set([...CS_AGENTS, ...learnedUsers])].sort();
  const filteredSuggestions = allUsers.filter(agent =>
    agent.toLowerCase().includes(currentUser.toLowerCase())
  );

  // Initialize OpenAI
  useEffect(() => {
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY') {
      try {
        openaiRef.current = new OpenAI({
          apiKey: OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });
        console.log('✅ OpenAI initialized');
      } catch (err) {
        console.error('OpenAI init error:', err);
      }
    }
  }, [OPENAI_API_KEY]);

  // Load data from JSON files
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const kbResponse = await fetch('/data/knowledge_base.json');
        if (!kbResponse.ok) throw new Error('Failed to load knowledge base');
        const kbData = await kbResponse.json();
        setKnowledgeBase(kbData);
        
        const templatesResponse = await fetch('/data/templates.json');
        if (!templatesResponse.ok) throw new Error('Failed to load templates');
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData);
        
        // Try to load pre-generated embeddings
        try {
          const embeddingsResponse = await fetch('/data/embeddings.json');
          if (embeddingsResponse.ok) {
            const embeddingsData = await embeddingsResponse.json();
            setEmbeddings(embeddingsData);
            console.log('✅ Loaded pre-generated embeddings');
          }
        } catch (e) {
          console.log('No pre-generated embeddings found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load history & learned users
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) setSearchHistory(JSON.parse(history));
    
    const savedUsers = localStorage.getItem('learnedUsers');
    if (savedUsers) setLearnedUsers(JSON.parse(savedUsers));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userInputRef.current && !userInputRef.current.contains(event.target)) {
        setShowUserSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cosine similarity calculation
  const cosineSimilarity = (a, b) => {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  };

  // OpenAI Semantic Search
  const semanticSearch = async (query) => {
    if (!openaiRef.current) {
      console.error('OpenAI not initialized');
      return fallbackSearch(query);
    }

    try {
      setIsSearching(true);
      
      // Generate embedding for query
      const queryEmbeddingResponse = await openaiRef.current.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      });
      
      const queryEmbedding = queryEmbeddingResponse.data[0].embedding;
      
      // Calculate similarity with all cases
      const results = knowledgeBase.map((item, idx) => {
        let similarity = 0;
        
        if (embeddings[idx]) {
          // Use pre-generated embeddings
          similarity = cosineSimilarity(queryEmbedding, embeddings[idx]);
        } else {
          // Fallback to keyword matching
          const combinedText = `${item.errorCode} ${item.title} ${item.cause} ${item.solution}`.toLowerCase();
          const queryLower = query.toLowerCase();
          const words = queryLower.split(/\s+/);
          const matchCount = words.filter(word => combinedText.includes(word)).length;
          similarity = matchCount / words.length;
        }
        
        return {
          ...item,
          matchScore: similarity * 100
        };
      });
      
      // Filter and sort by similarity
      const filtered = results
        .filter(r => r.matchScore > 20)
        .sort((a, b) => b.matchScore - a.matchScore);
      
      setIsSearching(false);
      return filtered;
      
    } catch (error) {
      console.error('Semantic search error:', error);
      setIsSearching(false);
      return fallbackSearch(query);
    }
  };

  // Fallback search (multi-word keyword matching)
  const fallbackSearch = (query) => {
    const queryLower = query.toLowerCase().trim();
    const words = queryLower.split(/\s+/).filter(w => w.length > 1);
    
    const results = knowledgeBase.map(item => {
      const combinedText = `${item.errorCode} ${item.title} ${item.product} ${item.feature} ${item.cause} ${item.solution}`.toLowerCase();
      
      let score = 0;
      let matchCount = 0;
      
      // Exact code match
      if (item.errorCode.toLowerCase() === queryLower) {
        return { ...item, matchScore: 100 };
      }
      
      // Multi-word matching
      words.forEach(word => {
        if (item.errorCode.toLowerCase().includes(word)) {
          score += 30;
          matchCount++;
        }
        if (item.title.toLowerCase().includes(word)) {
          score += 25;
          matchCount++;
        }
        if (item.product.toLowerCase().includes(word)) {
          score += 15;
          matchCount++;
        }
        if (item.cause.toLowerCase().includes(word)) {
          score += 10;
          matchCount++;
        }
        if (item.solution.toLowerCase().includes(word)) {
          score += 10;
          matchCount++;
        }
      });
      
      // Bonus for multiple matches
      if (matchCount > 1) {
        score += matchCount * 5;
      }
      
      return {
        ...item,
        matchScore: Math.min(score, 100)
      };
    });
    
    return results
      .filter(r => r.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const sendLogToSheets = async (logData) => {
    if (WEBHOOK_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL') {
      console.log('Webhook chưa config, log local:', logData);
      return;
    }
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
    } catch (error) {
      console.error('Error sending log:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    if (currentUser && !allUsers.includes(currentUser)) {
      const updatedLearnedUsers = [...learnedUsers, currentUser];
      setLearnedUsers(updatedLearnedUsers);
      localStorage.setItem('learnedUsers', JSON.stringify(updatedLearnedUsers));
    }

    let results = [];
    
    // Use semantic search if AI enabled and OpenAI available
    if (aiSearchEnabled && openaiRef.current) {
      results = await semanticSearch(searchQuery);
      if (selectedScope !== 'all') {
        results = results.filter(r => 
          r.scope.toLowerCase().includes(selectedScope.toLowerCase())
        );
      }
    } else {
      results = fallbackSearch(searchQuery);
      if (selectedScope !== 'all') {
        results = results.filter(r => 
          r.scope.toLowerCase().includes(selectedScope.toLowerCase())
        );
      }
    }

    setSearchResults(results);

    const newHistory = {
      timestamp: new Date().toISOString(),
      user: currentUser || 'Anonymous',
      query: searchQuery,
      scope: selectedScope,
      resultsCount: results.length,
      searchType: aiSearchEnabled && openaiRef.current ? 'semantic' : 'keyword'
    };

    const updatedHistory = [newHistory, ...searchHistory].slice(0, 15);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    sendLogToSheets({
      ...newHistory,
      topResult: results[0]?.title || 'No results'
    });
  };

  const copyTemplate = (template) => {
    navigator.clipboard.writeText(template);
    alert('✅ Đã copy template!');
  };

  const exportHistory = () => {
    const csv = [
      ['Thời gian', 'User', 'Từ khóa', 'Scope', 'Số kết quả', 'Loại search'],
      ...searchHistory.map(h => [
        new Date(h.timestamp).toLocaleString('vi-VN'),
        h.user,
        h.query,
        h.scope,
        h.resultsCount,
        h.searchType || 'keyword'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải knowledge base...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Lỗi tải dữ liệu</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Zalopay CS Knowledge Base
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {knowledgeBase.length} cases • OpenAI Semantic Search
                {embeddings.length > 0 && ' • Embeddings Ready'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAiSearchEnabled(!aiSearchEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  aiSearchEnabled
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {aiSearchEnabled ? <Brain size={18} fill="white" /> : <Brain size={18} />}
                <span className="font-medium">AI Search</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                >
                  <History size={18} />
                  <span className="font-medium">Lịch sử ({searchHistory.length})</span>
                </button>
                
                {showHistory && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border max-h-96 overflow-y-auto z-10">
                    <div className="p-3 border-b flex justify-between items-center">
                      <span className="font-semibold">Lịch sử tìm kiếm</span>
                      <button onClick={exportHistory} className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                    {searchHistory.length === 0 ? (
                      <p className="p-4 text-gray-500 text-sm">Chưa có lịch sử</p>
                    ) : (
                      <div className="divide-y">
                        {searchHistory.map((h, idx) => (
                          <div key={idx} className="p-3 hover:bg-gray-50">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-800">"{h.query}"</span>
                              <span className="text-gray-500">{h.resultsCount} kết quả</span>
                            </div>
                            <div className="flex gap-2 mt-1 text-xs text-gray-500">
                              <span>{h.user}</span>
                              <span>•</span>
                              <span>{h.searchType || 'keyword'}</span>
                              <span>•</span>
                              <span>{new Date(h.timestamp).toLocaleString('vi-VN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative" ref={userInputRef}>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">
                  <User size={18} />
                  <input
                    type="text"
                    value={currentUser}
                    onChange={(e) => {
                      setCurrentUser(e.target.value);
                      setShowUserSuggestions(true);
                    }}
                    onFocus={() => setShowUserSuggestions(true)}
                    placeholder="Nhập tên CS..."
                    className="bg-transparent font-medium outline-none w-32 placeholder-blue-400"
                  />
                </div>
                
                {showUserSuggestions && currentUser && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full mt-1 w-48 bg-white rounded-lg shadow-xl border max-h-48 overflow-y-auto z-20">
                    {filteredSuggestions.map((agent, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentUser(agent);
                          setShowUserSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 text-sm font-medium"
                      >
                        {agent}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm kiếm mã lỗi, vấn đề, keywords... (VD: Nạp tiền tiết kiệm lỗi NFC)"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Tìm kiếm
                </>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <span className="text-sm text-gray-600 py-2">Lọc theo:</span>
            {['Tất cả', 'Khuyến mãi', 'Tiết kiệm', 'Risk'].map((scope) => (
              <button
                key={scope}
                onClick={() => setSelectedScope(scope === 'Tất cả' ? 'all' : scope)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  (scope === 'Tất cả' && selectedScope === 'all') || selectedScope.includes(scope.toLowerCase())
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>

          {aiSearchEnabled && searchResults.length > 0 && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-600 py-2">Channel:</span>
              {['inapp', 'livechat', 'email'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSelectedChannel(ch)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedChannel === ch
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {ch === 'inapp' ? 'In-app' : ch === 'livechat' ? 'Live Chat' : 'Email'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {searchResults.map((result) => (
            <ResultCard
              key={result.id}
              result={result}
              templates={templates[result.errorCode]}
              aiSearchEnabled={aiSearchEnabled}
              selectedChannel={selectedChannel}
              copyTemplate={copyTemplate}
              exportHistory={exportHistory}
            />
          ))}
        </div>

        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              Không tìm thấy kết quả cho "{searchQuery}"
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Thử tìm kiếm với từ khóa khác hoặc chọn scope khác
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;