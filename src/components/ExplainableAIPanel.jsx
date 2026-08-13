import { useState, useEffect } from 'react';
import { Loader2, BrainCircuit, AlertTriangle, TrendingDown } from 'lucide-react';
import { fetchExplanation } from '../services/xaiService';
import '../styles/pages.css';

export default function ExplainableAIPanel({ memberId, type, title }) {
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadExplanation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchExplanation(memberId, type);
        if (isMounted) setExplanation(data);
      } catch (err) {
        if (isMounted) setError('Failed to load AI explanation.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadExplanation();

    return () => {
      isMounted = false;
    };
  }, [memberId, type]);

  if (isLoading) {
    return (
      <div className="explanation-box fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
        <Loader2 size={24} color="var(--color-primary-blue)" style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
        <span style={{ fontSize: '14px', color: 'var(--color-gray-500)' }}>Querying Explainable AI Engine...</span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explanation-box fade-in" style={{ padding: '16px', color: 'var(--color-urgent-text)', backgroundColor: 'var(--color-urgent-bg)', borderRadius: '8px' }}>
        <AlertTriangle size={16} style={{ marginBottom: '-3px', marginRight: '4px' }} />
        {error}
      </div>
    );
  }

  if (!explanation || !explanation.features || explanation.features.length === 0) {
    return (
      <div className="explanation-box fade-in">
        No significant explanatory features found.
      </div>
    );
  }

  return (
    <div className="explanation-box fade-in" style={{ marginTop: '12px', padding: '16px', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <BrainCircuit size={16} color="var(--color-primary-blue)" />
        <strong style={{ color: 'var(--color-primary-navy)', fontSize: '14px' }}>
          {title || 'AI Feature Importance (SHAP)'}
        </strong>
      </div>
      
      <div className="bar-chart" style={{ gap: '12px' }}>
        {explanation.features.map((feature, idx) => {
          const isPositive = feature.direction === 'positive';
          const maxImpact = explanation.features[0].impact; // Since it's sorted, the first is max
          const fillWidth = Math.min(100, Math.round((feature.impact / maxImpact) * 100)); // relative bar width
          
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--color-gray-700)', fontWeight: '500' }}>{feature.name}</span>
                <span style={{ color: isPositive ? 'var(--color-urgent-text)' : 'var(--color-success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {!isPositive && <TrendingDown size={12} />}
                  {isPositive ? '+' : '-'}{feature.impact.toFixed(1)}%
                </span>
              </div>
              <div className="bar-chart__track" style={{ height: '8px', backgroundColor: 'var(--color-gray-200)' }}>
                <div 
                  className="bar-chart__fill" 
                  style={{ 
                    width: `${fillWidth}%`, 
                    background: isPositive ? 'var(--color-urgent-text)' : 'var(--color-success)'
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
