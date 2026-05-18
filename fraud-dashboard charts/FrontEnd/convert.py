import re

with open('healthcare_fraud_detection_platform.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Extract CSS
css_match = re.search(r'<style>(.*?)</style>', html_content, re.DOTALL)
if css_match:
    css = css_match.group(1).strip()
    with open('src/index.css', 'w', encoding='utf-8') as f:
        f.write('@import "tailwindcss";\n' + css)

# Extract body content
body_match = re.search(r'<div class="app">(.*?)</div>\s*<script>', html_content, re.DOTALL)
if not body_match:
    print("Body not found")
    exit(1)

body_html = '<div className="app">' + body_match.group(1) + '</div>'

# Convert HTML to JSX
jsx = body_html
jsx = jsx.replace('class="', 'className="')

def style_replacer(match):
    style_str = match.group(1)
    props = []
    for prop in style_str.split(';'):
        prop = prop.strip()
        if not prop: continue
        if ':' not in prop: continue
        k, v = prop.split(':', 1)
        k = k.strip()
        v = v.strip()
        k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
        v = v.replace("'", "\\'")
        props.append(f"{k}: '{v}'")
    return "style={{" + ", ".join(props) + "}}"

jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)

jsx = jsx.replace('<br>', '<br/>')
jsx = jsx.replace('<hr>', '<hr/>')
jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx)

# Remove IDs that we don't need or will replace
jsx = jsx.replace('id="claimsToday"', '')
jsx = jsx.replace('id="flaggedCount"', '')

# Inject dynamic components
jsx = jsx.replace('2,847', '{claimsCount.toLocaleString()}')
jsx = jsx.replace('<tbody id="claimsBody"></tbody>', '{renderClaims()}')
jsx = jsx.replace('<div className="minichart" id="minichart"></div>', '<div className="minichart">{renderMinichart()}</div>')

# Fix Tabs active state logic
jsx = jsx.replace('onClick={() => setActiveTab(\'dashboard\')} className="nav-tab active"', 'className={`nav-tab ${activeTab === \'dashboard\' ? \'active\' : \'\'}`} onClick={() => setActiveTab(\'dashboard\')}')
jsx = jsx.replace('className="content page active" id="page-dashboard"', 'className={`content page ${activeTab === \'dashboard\' ? \'active\' : \'\'}`}')

for tab in ['dashboard', 'claim', 'features', 'roadmap', 'arch']:
    jsx = jsx.replace(f'onclick="showTab(\'{tab}\')"', f'onClick={{() => setActiveTab(\'{tab}\')}}')
    jsx = jsx.replace(f'className="nav-tab active" onClick={{() => setActiveTab(\'{tab}\')}}', f'className={{`nav-tab ${{activeTab === \'{tab}\' ? \'active\' : \'\'}}`}} onClick={{() => setActiveTab(\'{tab}\')}}')
    jsx = jsx.replace(f'className="nav-tab" onClick={{() => setActiveTab(\'{tab}\')}}', f'className={{`nav-tab ${{activeTab === \'{tab}\' ? \'active\' : \'\'}}`}} onClick={{() => setActiveTab(\'{tab}\')}}')
    jsx = jsx.replace(f'id="page-{tab}"', f'className={{`content page ${{activeTab === \'{tab}\' ? \'active\' : \'\'}}`}}')

jsx = jsx.replace('className="content page active" className={`content page ${activeTab === \'dashboard\' ? \'active\' : \'\'}`}', 'className={`content page ${activeTab === \'dashboard\' ? \'active\' : \'\'}`}')
jsx = jsx.replace('className="content page" className={`content page', 'className={`content page')


react_code = f"""import React, {{ useState, useEffect }} from 'react';

const claimsData = [
  {{id:'CLM-2024-8841',provider:'Dr. Martinez',amount:'$18,400',icd:'Z00.00',risk:'high',score:87,flags:'Overbill, velocity'}},
  {{id:'CLM-2024-8840',provider:'City Radiology',amount:'$3,200',icd:'M54.5',risk:'med',score:58,flags:'Duplicate suspected'}},
  {{id:'CLM-2024-8839',provider:'St. Hope Hosp.',amount:'$940',icd:'J06.9',risk:'low',score:12,flags:'None'}},
  {{id:'CLM-2024-8838',provider:'NPI 9876543',amount:'$7,100',icd:'F32.1',risk:'high',score:79,flags:'Network cluster'}},
  {{id:'CLM-2024-8837',provider:'Westside Clinic',amount:'$210',icd:'Z23',risk:'low',score:8,flags:'None'}},
  {{id:'CLM-2024-8836',provider:'Dr. Patel',amount:'$4,500',icd:'E11.65',risk:'med',score:44,flags:'Upcoding signal'}},
  {{id:'CLM-2024-8835',provider:'FastMed Inc.',amount:'$22,000',icd:'Z00.01',risk:'high',score:93,flags:'Overbill, ghost'}},
  {{id:'CLM-2024-8834',provider:'Lakeview Lab',amount:'$380',icd:'Z13.6',risk:'low',score:19,flags:'None'}},
];

function App() {{
  const [activeTab, setActiveTab] = useState('dashboard');
  const [claimsCount, setClaimsCount] = useState(2847);
  const [selectedClaimId, setSelectedClaimId] = useState('CLM-2024-8841');

  useEffect(() => {{
    const interval = setInterval(() => {{
      setClaimsCount(prev => prev + Math.floor(Math.random()*3));
    }}, 3000);
    return () => clearInterval(interval);
  }}, []);

  const riskBadge = (r, s) => {{
    const cls = r==='high'?'risk-high':r==='med'?'risk-med':'risk-low';
    return <span className={{`risk ${{cls}}`}}>{{s}}</span>;
  }};

  const scoreBar = (s) => {{
    const col = s>70?'#ef4444':s>40?'#f59e0b':'#10b981';
    return <div className="score-bar"><div className="score-fill" style={{{{width: `${{s}}%`, background: col}}}}></div></div>;
  }};

  const renderClaims = () => {{
    return claimsData.map((c, i) => (
      <tr key={{c.id}} className={{`claim-row ${{selectedClaimId === c.id ? 'selected' : ''}}`}} onClick={{() => {{ setSelectedClaimId(c.id); setActiveTab('claim'); }}}}>
        <td className="mono" style={{{{color:'var(--amber)', fontSize:'11px'}}}}>{{c.id}}</td>
        <td>{{c.provider}}</td>
        <td className="mono">{{c.amount}}</td>
        <td className="mono" style={{{{color:'var(--muted)', fontSize:'11px'}}}}>{{c.icd}}</td>
        <td>{{riskBadge(c.risk, c.score)}}</td>
        <td>{{scoreBar(c.score)}}</td>
        <td style={{{{color:'var(--muted)', fontSize:'11px'}}}}>{{c.flags}}</td>
      </tr>
    ));
  }};

  const renderMinichart = () => {{
    const vals = [28,35,42,38,55,67,44,51,48,72,89,61];
    return vals.map((v, i) => {{
      const cls = v>70?'hot':v>50?'med':'';
      return <div key={{i}} className={{`minichart-bar ${{cls}}`}} style={{{{height: `${{v/89*100}}%`}}}}></div>;
    }});
  }};

  return (
    {jsx}
  );
}}

export default App;
"""

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(react_code)
print("Done")
