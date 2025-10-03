import React, { useState } from 'react';
import { Search, FileText, AlertCircle, Clock, Copy, CheckCircle } from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Knowledge Base từ SOP files
  const knowledgeBase = [
    {
      id: 'v3003',
      question: 'Mã lỗi -3003: Sai MAC',
      answer: 'Nguyên nhân: Sai MAC (Message Authentication Code)\n\nHướng xử lý: Chuyển case cho group KM kiểm tra.\n\nĐây là lỗi hệ thống, không phải lỗi từ phía khách hàng.',
      customerTemplate: 'Chào bạn,\n\nHệ thống ghi nhận có lỗi kỹ thuật khi xử lý voucher của bạn (Mã lỗi: -3003).\n\nZalopay đã ghi nhận và chuyển bộ phận kỹ thuật kiểm tra. Chúng tôi sẽ phản hồi kết quả trong vòng 24-48 giờ làm việc.\n\nRất xin lỗi vì sự bất tiện này.',
      scope: 'Dịch vụ - KM',
      source: 'ZION-CS-KM-D.07-Bảng mã lỗi Voucher',
      errorCodes: ['-3003'],
      keywords: ['voucher', 'mac', 'lỗi hệ thống', 'sai mac', '3003']
    },
    {
      id: 'v3008',
      question: 'Mã lỗi -3008: Voucher đã được sử dụng',
      answer: 'Nguyên nhân: Voucher đã được sử dụng trước đó.\n\nHướng xử lý: CS kiểm tra xem User đã từng sử dụng voucher này ở giao dịch nào chưa?\n\nNếu đã dùng → Giải thích cho khách.\nNếu chưa dùng → Chuyển group KM xử lý.',
      customerTemplate: 'Chào bạn,\n\nVoucher này đã được sử dụng trong giao dịch trước đó vào [ngày/giờ].\n\nMỗi voucher chỉ có thể sử dụng 1 lần. Vui lòng kiểm tra lại lịch sử giao dịch hoặc sử dụng voucher khác.',
      scope: 'Dịch vụ - KM',
      source: 'ZION-CS-KM-D.07-Bảng mã lỗi Voucher',
      errorCodes: ['-3008'],
      keywords: ['voucher', 'đã sử dụng', 'duplicate', '3008', 'trùng']
    },
    {
      id: 'blacklist',
      question: 'Xử lý tài khoản Blacklist',
      answer: 'Risk Level: Malicious (Blacklist)\n\nĐịnh nghĩa: User cố tình lợi dụng chương trình khuyến mãi sai mục đích, tạo nhiều tài khoản ảo, hoặc có hành vi gian lận rõ ràng.\n\nHướng xử lý:\n1. TỪ CHỐI hoàn toàn yêu cầu\n2. KHÔNG cần báo cáo lên LINE\n3. Phản hồi khách hàng theo template chuẩn',
      customerTemplate: 'Chào bạn,\n\nSau khi kiểm tra, chúng tôi nhận thấy tài khoản của bạn có dấu hiệu vi phạm điều khoản sử dụng dịch vụ Zalopay.\n\nTheo chính sách, chúng tôi không thể hỗ trợ yêu cầu này. Vui lòng tuân thủ điều khoản để tiếp tục sử dụng dịch vụ.',
      scope: 'Dịch vụ - KM',
      source: 'ZION-CS-KM-D.01-Quy trình xử lý',
      errorCodes: [],
      keywords: ['blacklist', 'gian lận', 'vi phạm', 'tài khoản ảo', 'lợi dụng']
    },
    {
      id: 'greylist',
      question: 'Xử lý tài khoản Greylist (Casual)',
      answer: 'Risk Level: Casual (Greylist)\n\nĐịnh nghĩa: User có dấu hiệu lợi dụng KM nhưng chưa rõ ràng, hoặc vi phạm nhẹ.\n\nHướng xử lý:\n1. CHUYỂN case cho Line Leader đánh giá\n2. Line sẽ quyết định có hỗ trợ hay không\n3. Nếu được phê duyệt → Xử lý theo hướng dẫn\n4. Nếu từ chối → Phản hồi khách theo template',
      customerTemplate: 'Chào bạn,\n\nYêu cầu của bạn đang được bộ phận chuyên trách xem xét. Chúng tôi sẽ phản hồi kết quả trong vòng 24-48 giờ làm việc.\n\nCảm ơn bạn đã kiên nhẫn chờ đợi.',
      scope: 'Dịch vụ - KM',
      source: 'ZION-CS-KM-D.01-Quy trình xử lý',
      errorCodes: [],
      keywords: ['greylist', 'casual', 'nghi ngờ', 'line leader', 'đánh giá']
    },
    {
      id: 'cashback',
      question: 'Khiếu nại chưa nhận Cashback',
      answer: 'Bước 1: Kiểm tra điều kiện\n- Giao dịch đã hoàn thành chưa?\n- Có nằm trong thời gian KM không?\n- Đã đủ điều kiện tham gia chưa?\n\nBước 2: Check hệ thống\n- Vào tool kiểm tra trạng thái cashback\n- Xem log giao dịch\n\nBước 3: Xử lý\n- Nếu thiếu: Tạo ticket hoàn\n- Nếu không đủ điều kiện: Giải thích cho khách\n- Nếu lỗi hệ thống: Chuyển Tech',
      customerTemplate: 'Chào bạn,\n\nSau khi kiểm tra, giao dịch của bạn [đã/chưa] đủ điều kiện nhận Cashback.\n\n[Nếu đủ điều kiện]: Chúng tôi đã tạo yêu cầu hoàn Cashback. Bạn sẽ nhận được trong vòng 24h.\n\n[Nếu không đủ]: Do [lý do cụ thể], giao dịch này chưa đủ điều kiện. Vui lòng tham khảo điều khoản KM.',
      scope: 'Dịch vụ - KM',
      source: 'ZION-CS-KM-D.02-Xử lý Cashback',
      errorCodes: [],
      keywords: ['cashback', 'hoàn tiền', 'chưa nhận', 'thiếu cashback']
    }
  ];

  // Hàm tìm kiếm thông minh
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      
      const results = knowledgeBase
        .map(item => {
          let score = 0;
          
          // Tìm trong keywords
          item.keywords.forEach(keyword => {
            if (query.includes(keyword) || keyword.includes(query)) {
              score += 10;
            }
          });
          
          // Tìm trong question
          if (item.question.toLowerCase().includes(query)) {
            score += 8;
          }
          
          // Tìm trong answer
          if (item.answer.toLowerCase().includes(query)) {
            score += 5;
          }
          
          // Tìm mã lỗi
          item.errorCodes.forEach(code => {
            if (query.includes(code.toLowerCase())) {
              score += 15;
            }
          });
          
          // Filter theo scope
          if (selectedScope !== 'all' && !item.scope.includes(selectedScope)) {
            score = 0;
          }
          
          return { ...item, relevance: score };
        })
        .filter(item => item.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance);
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ZaloPay CS Knowledge Base</h1>
              <p className="text-sm text-gray-600 mt-1">Hệ thống tra cứu SOP & FAQ nhanh</p>
            </div>
            <div className="text-sm text-gray-500">
              {knowledgeBase.length} cases
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            {/* Scope Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'Tài khoản', 'Dịch vụ', 'Travelling'].map(scope => (
                <button
                  key={scope}
                  onClick={() => setSelectedScope(scope)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedScope === scope
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {scope === 'all' ? 'Tất cả' : scope}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Nhập từ khóa, mã lỗi, hoặc mô tả vấn đề..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
              />
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </div>

        {/* Results */}
        {isSearching ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tìm kiếm...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Tìm thấy {searchResults.length} kết quả</p>
            {searchResults.map((result) => (
              <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{result.question}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {result.scope}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{result.answer}</pre>
                </div>

                {result.customerTemplate && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">Template phản hồi khách:</h4>
                      <button
                        onClick={() => handleCopy(result.customerTemplate, result.id + '-template')}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {copiedId === result.id + '-template' ? (
                          <>
                            <CheckCircle size={16} />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{result.customerTemplate}</pre>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {result.source}
                  </span>
                  {result.errorCodes.length > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={14} />
                      {result.errorCodes.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Không tìm thấy kết quả phù hợp</p>
            <p className="text-sm text-gray-500 mt-2">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}