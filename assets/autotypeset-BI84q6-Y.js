var e=[/^\s*(?:正文\s*)?[【\[※▲·\s]*第\s*[0-9零〇一二两三四五六七八九十百千万]+\s*[章节回卷篇章部集][】\]\s]*[^\n]{0,40}$/,/^\s*(序章|序言|序|楔子|引子|序幕|尾声|后记|终章|结局|大结局|番外[^\n]{0,20})$/,/^\s*#{1,4}\s+[^\n#]{1,40}$/,/^\s*chapter\s*[0-9ivxlc]+[^\n]{0,40}$/i],t=[/^\s*[(（]?\d{1,4}[)）]?\s*[、.．:：\s]\s*\S[^\n]{0,30}$/];function n(t){let n=t.trim();return!n||n.length>50?!1:e.some(e=>e.test(n))}function r(e){let t=e.replace(/\r\n?/g,`
`).split(`
`),n=[],r=0;for(let e of t){let t=e.replace(/^[ \t\u3000]+/,``).replace(/[ \t\u3000]+$/,``);t?(r>0&&n.length>0&&n.push(``),r=0,n.push(t)):r+=1}return n.join(`
`).trim()}function i(e,i={}){let o=i.fallbackSize??3e3,s=i.fallbackTitle??`第`,c=e.replace(/\r\n?/g,`
`),l=c.split(`
`),u=[];l.forEach((e,t)=>{n(e)&&u.push(t)}),u.length<2&&(l.forEach((e,n)=>{t.some(t=>t.test(e.trim()))&&u.push(n)}),u.sort((e,t)=>e-t));let d=e=>e.replace(/^\s*#{1,4}\s+/,``).replace(/^[【\[※▲·\s]+/,``).replace(/[】\]\s]+$/,``).trim().replace(/\s+/g,` `).slice(0,40);if(u.length===0){let e=r(c);if(!e)return[];if(o<=0)return[{title:`全文`,content:e}];let t=e.split(`
`).filter(e=>e!==``),n=[],i=[],a=0;for(let e of t)i.push(e),a+=e.length,a>=o&&(n.push({title:`${s}${n.length+1}章`,content:i.join(`

`)}),i=[],a=0);return i.length&&n.push({title:`${s}${n.length+1}章`,content:i.join(`

`)}),n}let f=[],p=r(l.slice(0,u[0]).join(`
`));return p&&f.push({title:`前言`,content:p}),u.forEach((e,t)=>{let n=t+1<u.length?u[t+1]:l.length,i=d(l[e]),a=r(l.slice(e+1,n).join(`
`));(a||i)&&f.push({title:i||`${s}${f.length+1}章`,content:a})}),a(f)}function a(e){if(e.length<=1)return e;let t=0,n=e=>e.content.replace(/\s/g,``).length<20,r=0;for(;t+r<e.length&&n(e[t+r]);)r+=1;r>=5&&r<e.length&&(t=r);let i=e.slice(t),a=new Map;return i.forEach((e,t)=>{let n=e.title.replace(/\s/g,``);if(!n)return;let r=a.get(n);r===void 0?a.set(n,t):i[r].content.length<e.content.length&&(i[r]={...i[r],content:e.content},i[t].content=``)}),i.filter((e,t)=>e.content.trim()||i.length===1&&t===0)}function o(e,t){let n=/(\d+)|(\D+)/g,r=e.toLowerCase().match(n)??[],i=t.toLowerCase().match(n)??[],a=Math.min(r.length,i.length);for(let e=0;e<a;e+=1){let t=r[e],n=i[e],a=/^\d+$/.test(t),o=/^\d+$/.test(n);if(a&&o){let e=Number(t)-Number(n);if(e!==0)return e}else if(t!==n)return t<n?-1:1}return r.length-i.length}function s(e,t=20){let n=Math.max(1,Math.round(t)),r=[];for(let t=0;t<e.length;t+=n)r.push(e.slice(t,t+n));return r}function c(e){return e.replace(/\r\n?/g,`
`).split(`
`).map(e=>e.trim()).filter(Boolean).slice(0,6)}function l(e){return e.reduce((e,t)=>e+t.content.replace(/\s/g,``).length,0)}export{s as a,r as i,o as n,i as o,c as r,l as t};