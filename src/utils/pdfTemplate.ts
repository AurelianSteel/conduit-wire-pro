/**
 * PDF Template Generator
 * Creates professional PDF reports for calculation results
 */

import { ShareData } from '../services/shareService';

/**
 * Generate professional PDF HTML template
 * This is a lower-level utility for advanced PDF customization
 */
export function generatePDFTemplate(data: ShareData): string {
  const date = data.timestamp 
    ? data.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const time = data.timestamp
    ? data.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.calculatorTitle} - Conduit & Wire Pro</title>
  <style>
    @page { 
      margin: 0.5in;
      size: auto;
    }
    * { box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #1a1a1a;
      line-height: 1.5;
    }
    
    .header {
      background: linear-gradient(135deg, #1E2337 0%, #141829 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    
    .logo {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #4A9EFF;
      margin-bottom: 8px;
    }
    
    .app-name {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 4px;
    }
    
    .report-type {
      font-size: 16px;
      color: #8E8E93;
      font-weight: 600;
    }
    
    .content { padding: 0 8px; }
    
    .calc-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
      border-bottom: 2px solid #4A9EFF;
      padding-bottom: 8px;
    }
    
    .date-line {
      font-size: 12px;
      color: #636366;
      margin-bottom: 20px;
    }
    
    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #8E8E93;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .inputs-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    
    .inputs-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #E5E5EA;
    }
    
    .inputs-table tr:last-child td { border-bottom: none; }
    
    .input-label {
      font-size: 13px;
      color: #636366;
      width: 40%;
    }
    
    .input-value {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .result-box {
      background: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
      border: 2px solid #4A9EFF;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-bottom: 16px;
    }
    
    .result-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #8E8E93;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .result-value {
      font-size: 36px;
      font-weight: 800;
      color: #4A9EFF;
      margin-bottom: 4px;
    }
    
    .result-details { margin-top: 16px; }
    
    .formula-box {
      background: #F2F2F7;
      border-radius: 6px;
      padding: 12px 16px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 14px;
      color: #1a1a1a;
    }
    
    .nec-box {
      background: #FFF9E6;
      border-left: 4px solid #FFD60A;
      padding: 12px 16px;
      margin-bottom: 16px;
      border-radius: 0 6px 6px 0;
    }
    
    .nec-title {
      font-size: 11px;
      font-weight: 700;
      color: #8E8E93;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .nec-reference {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .nec-article {
      font-style: italic;
      color: #636366;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .warnings {
      background: #FFF5F5;
      border: 1px solid #FF453A;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    
    .warnings-title {
      font-size: 11px;
      font-weight: 700;
      color: #FF453A;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    .warning-item {
      font-size: 12px;
      color: #1a1a1a;
      padding: 4px 0;
      padding-left: 16px;
      position: relative;
    }
    
    .warning-item:before {
      content: "•";
      color: #FF453A;
      position: absolute;
      left: 4px;
    }
    
    .disclaimer {
      background: #FFF9E6;
      border: 1px solid #FFD60A;
      border-radius: 6px;
      padding: 12px 16px;
      margin-top: 24px;
      font-size: 11px;
      color: #636366;
      line-height: 1.6;
    }
    
    .disclaimer-title {
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px solid #E5E5EA;
      text-align: center;
      font-size: 10px;
      color: #8E8E93;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ILLWIRED</div>
    <div class="app-name">Conduit & Wire Pro</div>
    <div class="report-type">Calculation Report</div>
  </div>
  
  <div class="content">
    <div class="calc-title">${data.calculatorTitle}</div>
    <div class="date-line">Generated on ${date} at ${time}</div>
    
    <div class="section">
      <div class="section-title">INPUT PARAMETERS</div>
      <table class="inputs-table">
        ${Object.entries(data.inputs)
          .filter(([_, value]) => value !== undefined && value !== '')
          .map(([key, value]) => `
            <tr>
              <td class="input-label">${formatLabel(key)}</td>
              <td class="input-value">${formatValue(value)}</td>
            </tr>
          `).join('')}
      </table>
    </div>
    
    <div class="section">
      <div class="section-title">CALCULATED RESULT</div>
      <div class="result-box">
        <div class="result-label">${data.result.label}</div>
        <div class="result-value">${data.result.value}</div>
      </div>
    </div>
    
    ${data.formula ? `
    <div class="section">
      <div class="section-title">FORMULA</div>
      <div class="formula-box">
        <code>${data.formula}</code>
      </div>
    </div>
    ` : ''}
    
    <div class="nec-box">
      <div class="nec-title">NEC Reference</div>
      <div class="nec-reference">${data.necReference}</div>
      <div class="nec-article">Article ${data.necArticle}</div>
    </div>
    
    ${data.warnings && data.warnings.length > 0 ? `
    <div class="warnings">
      <div class="warnings-title">⚠️ WARNINGS</div>
      ${data.warnings.map(w => `<div class="warning-item">${w}</div>`).join('')}
    </div>
    ` : ''}
    
    <div class="disclaimer">
      <div class="disclaimer-title">⚠️ FOR REFERENCE ONLY</div>
      This calculation provides reference values based on NEC 2023 formulas. Always verify with a licensed electrician and your local Authority Having Jurisdiction (AHJ). Local codes may have amendments.
    </div>
  </div>
  
  <div class="footer">
    Generated by Conduit & Wire Pro<br>
    NEC 2023 Compliant • illwired.com
  </div>
</body>
</html>`;
}

// Helper functions
function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' \$1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
}

function formatValue(value: string | number | boolean | undefined): string {
  if (value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
