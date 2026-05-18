import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, AlertCircle, Calendar, Hash } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useFilters } from '../../context/FilterContext';
import { formatDate } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const HighlightReason = ({ text }) => {
  const keywords = ['duplicate', 'upcoding', 'mismatch', 'excessive', 'identity theft', 'post-patient', 'frequent'];
  let highlightedText = text;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<span class="text-red-400 font-semibold bg-red-500/10 px-1 rounded">$1</span>');
  });

  return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
};

const TableSkeleton = () => (
  <div className="w-full flex flex-col gap-2 mt-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="w-full h-16 bg-gray-800/50 rounded-lg animate-pulse"></div>
    ))}
  </div>
);

const AuditTable = ({ claims, loading }) => {
  const { activeRiskFilter, clearFilters } = useFilters();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedClaims = useMemo(() => {
    let result = claims || [];

    if (activeRiskFilter) {
      result = result.filter(c => c.risk_level === activeRiskFilter);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.claim_id.toLowerCase().includes(lowerSearch) ||
        c.doctor.toLowerCase().includes(lowerSearch) ||
        c.patient.toLowerCase().includes(lowerSearch) ||
        c.reason.toLowerCase().includes(lowerSearch)
      );
    }

    result.sort((a, b) => {
      if (sortConfig.key === 'score') {
        return sortConfig.direction === 'asc' 
          ? a.risk_score - b.risk_score 
          : b.risk_score - a.risk_score;
      }
      if (sortConfig.key === 'timestamp') {
        return sortConfig.direction === 'asc'
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return 0;
    });

    return result;
  }, [claims, activeRiskFilter, searchTerm, sortConfig]);

  if (loading) {
    return (
      <Card className="lg:col-span-3">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-200">Recent Claims Audit</h3>
        </div>
        <TableSkeleton />
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-3 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-200">Recent Claims Audit</h3>
          {activeRiskFilter && (
            <div className="flex items-center gap-2 bg-gray-800/80 px-3 py-1 rounded-full text-sm">
              <span className="text-gray-400">Filtered:</span>
              <Badge level={activeRiskFilter} />
              <button onClick={clearFilters} className="text-gray-400 hover:text-white ml-1">&times;</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search claims, doctors..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <button className="p-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="text-xs uppercase bg-gray-800/30 text-gray-400 border-b border-gray-700/50">
            <tr>
              <th className="px-4 py-3 font-medium">Claim ID</th>
              <th className="px-4 py-3 font-medium cursor-pointer group" onClick={() => handleSort('score')}>
                <div className="flex items-center gap-1">
                  Risk Score
                  <Hash className="w-3 h-3 group-hover:text-gray-300 transition-colors" />
                </div>
              </th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Doctor / Patient</th>
              <th className="px-4 py-3 font-medium cursor-pointer group" onClick={() => handleSort('timestamp')}>
                <div className="flex items-center gap-1">
                  Date
                  <Calendar className="w-3 h-3 group-hover:text-gray-300 transition-colors" />
                </div>
              </th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedClaims.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No claims found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedClaims.map((claim) => (
                <React.Fragment key={claim.claim_id}>
                  <tr 
                    className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors cursor-pointer"
                    onClick={() => toggleRow(claim.claim_id)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-300">{claim.claim_id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              claim.risk_score >= 80 ? "bg-red-500" : claim.risk_score >= 40 ? "bg-yellow-400" : "bg-green-500"
                            )}
                            style={{ width: `${claim.risk_score}%` }}
                          />
                        </div>
                        <span className="text-xs">{claim.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge level={claim.risk_level} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-gray-300">{claim.doctor}</span>
                        <span className="text-xs text-gray-500">{claim.patient}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {formatDate(claim.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1 rounded-md hover:bg-gray-700/50 transition-colors">
                        {expandedRows.has(claim.claim_id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(claim.claim_id) && (
                    <tr className="bg-gray-900/30 border-b border-gray-800/50">
                      <td colSpan="6" className="px-4 py-4">
                        <div className="flex items-start gap-3 pl-4 border-l-2 border-gray-700">
                          <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Flagged Reason:</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              <HighlightReason text={claim.reason} />
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AuditTable;
