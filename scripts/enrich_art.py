from pathlib import Path
import re
root=Path.cwd()
for p in (root/'assets/icons').rglob('*.svg'):
    s=p.read_text(encoding='utf-8')
    if 'id="art-light"' in s: continue
    tower=p.parent.name=='towers'
    colors=['#35e6cf','#ffbd42','#92a4ff','#ff6d91','#a8e75b','#cc8aff','#48d8f6']
    color=colors[sum(map(ord,p.stem))%len(colors)]
    if tower:
        match=re.search(r'<circle cx="64" cy="57" r="47" fill="([^"]+)"',s)
        if match: color=match.group(1)
    defs=f'<defs><linearGradient id="art-bg" x2="1" y2="1"><stop stop-color="{color}"/><stop offset="1" stop-color="#182d63"/></linearGradient><linearGradient id="art-light" x2=".7" y2="1"><stop stop-color="#ffffff" stop-opacity=".32"/><stop offset=".5" stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#08143a" stop-opacity=".25"/></linearGradient></defs>'
    s=s.replace('viewBox="0 0 128 128">','viewBox="0 0 128 128">'+defs)
    s=s.replace('fill="#142734"','fill="url(#art-bg)"').replace('fill="#193442"','fill="url(#art-bg)"').replace('opacity=".15"','opacity=".3"')
    detail='<path d="M8 45V17Q8 8 17 8H44M84 120H111Q120 120 120 111V84" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2"/><path d="M8 64H28M100 64H120M64 8V18" stroke="#b1f9ff" stroke-opacity=".4"/>'
    if tower:
        detail+='<path d="M31 88L43 92M28 94L40 98M67 104V125" stroke="#edf8ff" stroke-opacity=".65" stroke-width="2"/><path d="M48 39H81M46 46H83" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><rect x="25" y="106" width="14" height="9" rx="2" fill="#ffdf68"/><path d="M29 109H35M29 112H33" stroke="#675632" stroke-width="1.5"/><circle cx="51" cy="53" r="1.4" fill="#fff"/><circle cx="75" cy="53" r="1.4" fill="#fff"/>'
    else:
        s=s.replace('stroke="#a6e7d7"','stroke="#f2fcff"')
        detail+='<circle cx="108" cy="20" r="5" fill="#ffe180"/><path d="M17 115H38" stroke="#7efaff" stroke-width="3"/>'
    s=s.replace('</svg>',detail+'<rect width="128" height="128" rx="20" fill="url(#art-light)" pointer-events="none"/></svg>')
    p.write_text(s,encoding='utf-8')
