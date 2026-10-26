import{t as e}from"./react-vendor-uA-yI9nz.js";import{t,u as n}from"./utils-y6WbtxQ0.js";import{a as r,o as i}from"./svg-DU6kuTM-.js";var a=e();function o({scene:e,seed:n,variant:o=`scene`,className:s}){let c=o===`poster`?r(e,n):i(e,n);return(0,a.jsx)(`div`,{className:t(`h-full w-full overflow-hidden`,s),dangerouslySetInnerHTML:{__html:c}})}var s=Object.keys(n),c=s.includes(`sea`)?`sea`:s[0]??`sea`,l=/[^\w\u4e00-\u9fa5.-]+/g;function u(e,t){return(e??``).trim().replace(/\s+/g,`-`).replace(l,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``)||`n${t+1}`}function d(e){let t=(e??``).trim();if(!t)return c;if(n[t])return t;let r=Object.entries(n).find(([,e])=>e===t);return r?r[0]:c}function f(e,t){let n=e,r=Array.isArray(n)?n:Array.isArray(n?.nodes)?n.nodes:Array.isArray(n?.scenes)?n.scenes:[];r.length===0&&t.push({level:`error`,msg:`JSON 里没有找到 nodes / scenes 数组`});let i=r.map((e,t)=>{let n=e??{},r=Array.isArray(n.choices)?n.choices:Array.isArray(n.options)?n.options:[];return{id:u(String(n.id??n.nodeId??n.name??``),t),scene:d(String(n.scene??n.bg??n.background??``)),char:n.char?String(n.char):void 0,speaker:n.speaker??n.who??n.role?String(n.speaker??n.who??n.role):void 0,text:String(n.text??n.content??n.body??``).replace(/\r\n/g,`
`).trim(),ending:n.ending===!0||n.isEnding===!0,endingTitle:n.endingTitle?String(n.endingTitle):void 0,choices:r.map(e=>{if(typeof e==`string`){let t=e.match(/^(.*?)(?:->|=>|→)\s*(\S+)\s*$/);return t?{label:t[1].trim(),next:t[2].trim()}:{label:e.trim()}}let t=e??{},n=t.next??t.to??t.target??t.goto;return{label:String(t.label??t.text??t.title??``).trim(),next:n?String(n):void 0}})}}),a=Array.isArray(n)?``:String(n?.startNode??n?.start??``);return{startNode:a?u(a,0):i[0]?.id??`n1`,nodes:i}}var p=/^::\s*(.+?)\s*(?:\[(.*)\])?\s*$/;function m(e,t){let r=e.replace(/\r\n/g,`
`).split(`
`),i=[],a=null,o=``,s=()=>{a&&=(a.text=a.text.trim(),i.push(a),null)};for(let e of r){let t=e.replace(/\s+$/,``),r=t.match(p);if(r){s();let e=r[1].trim(),t=(r[2]??``).split(/\s+/).filter(Boolean),c=t.find(e=>n[e])??t.find(e=>/^scene[:=]/i.test(e))?.split(/[:=]/)[1]??``,l=t.find(e=>/^end(ing)?[:=]/i.test(e)),f=t.find(e=>/^(speaker|who)[:=]/i.test(e))?.split(/[:=]/)[1]??``;(/^start$/i.test(t.join(`,`))||/^start$/i.test(e))&&(o||=u(e,i.length)),a={id:u(e,i.length),scene:d(c),speaker:f||void 0,text:``,ending:!!l||t.includes(`ending`),endingTitle:l?l.split(/[:=]/)[1]:void 0,choices:[]};continue}if(!a)continue;let c=[...t.matchAll(/\[\[(.+?)\]\]/g)];if(c.length>0){for(let e of c){let t=e[1].trim(),n=t,r;if(t.includes(`->`)){let[e,i]=t.split(`->`);n=e.trim(),r=i.trim()}else if(t.includes(`<-`)){let[e,i]=t.split(`<-`);r=e.trim(),n=i.trim()}else if(t.includes(`|`)){let[e,i]=t.split(`|`);n=e.trim(),r=i.trim()}a.choices.push({label:n||r||`继续`,next:r?u(r,0):void 0})}let e=t.replace(/\[\[.+?\]\]/g,``).trim();e&&(a.text+=(a.text?`
`:``)+e)}else a.text+=(a.text?`
`:``)+t}return s(),i.length===0&&t.push({level:`error`,msg:`没有解析到任何 :: 段落`}),{startNode:o||(i[0]?.id??`n1`),nodes:i}}var h=/^#{1,3}\s*(.+)$/,g=/^[>＞]\s*(.+)$/,_=/^[@＠]\s*([^:：]{1,24})[:：]\s*(.*)$/;function v(e,t){let n=e.replace(/\r\n/g,`
`).split(/\n\s*\n+/).map(e=>e.trim()).filter(Boolean);if(n.length===0)return{startNode:`n1`,nodes:[]};let r=n.map((e,t)=>{let r=t===n.length-1;return{id:`n${t+1}`,scene:c,text:e,ending:r,endingTitle:r?`章节结尾`:void 0,choices:r?[]:[{label:`继续`,next:`n${t+2}`}]}});return t.push({level:`info`,msg:`未检测到场景标记，已按空行切成 ${r.length} 段并顺序串联；想加分支可在预览里编辑选项`}),{startNode:`n1`,nodes:r}}var y={scene:[`场景`,`scene`],ending:[`结局`,`ending`],speaker:[`角色`,`speaker`]};function b(e,t){for(let n of t){let t=RegExp(`${n}\\s*[:=：]?\\s*([^|]*?)(?=(?:场景|scene|结局|ending|角色|speaker)\\s*(?:[:=：]|$)|$)`,`i`),r=e.match(t);if(r)return r[1].trim()}return``}function x(e){let t=(e??``).trim(),r=t.includes(`|`)?t.split(`|`).map(e=>e.trim()):[t],i=r[0]??``,a=r.slice(1).join(` | `);if(!t.includes(`|`)){let e=t.search(/(?:场景|scene|结局|ending|角色|speaker)\s*(?:[:=：]|\s|$)/i);e>0&&(i=t.slice(0,e).trim(),a=t.slice(e).trim())}let o=b(a,y.scene),s=b(a,y.speaker),c=/(?:结局|ending)/i.test(a),l=b(a,y.ending),u=!o&&n[a.trim()]?a.trim():``;return{id:i,scene:o||u,speaker:s,ending:c,endingTitle:l}}function S(e,t){let n=e.replace(/\r\n/g,`
`).split(`
`);if(!n.some(e=>h.test(e.trim())||g.test(e.trim())||_.test(e.trim())))return v(e,t);let r=[],i=null,a=``,o=()=>{i&&=(i.text=i.text.trim(),r.push(i),null)};for(let e of n){let t=e.trimEnd(),n=t.match(h);if(n){o();let e=x(n[1]);i={id:u(e.id,r.length),scene:d(e.scene),speaker:e.speaker||void 0,text:``,ending:e.ending,endingTitle:e.ending?e.endingTitle||`结局`:void 0,choices:[]},/^(start|开始)$/i.test(e.id)&&(a||=i.id);continue}if(!i){if(!t.trim())continue;i={id:u(`n${r.length+1}`,r.length),scene:c,text:``,choices:[]}}let s=t.match(g);if(s){let e=s[1].trim(),t=e.match(/^(.*?)(?:->|=>|→|=>)\s*(\S+)\s*$/),n=e.match(/^(.*?)\s*(?:=|→)\s*(\S+)\s*$/),r=t??n;r?i.choices.push({label:r[1].trim(),next:u(r[2],0)}):i.choices.push({label:e});continue}let l=t.match(_);l?(i.speaker||(i.speaker=l[1].trim()),i.text+=(i.text?`
`:``)+`${l[1].trim()}：${l[2].trim()}`):t.trim()===``?i.text+=`
`:i.text+=(i.text?`
`:``)+t}return o(),r.length===0&&t.push({level:`error`,msg:`没有解析到任何 # 节点标题`}),{startNode:a||(r[0]?.id??`n1`),nodes:r}}function C(e,t=[]){let n=0,r=new Map,i=[];for(let a of e.nodes){if(!a)continue;let e=a.id||`n${i.length+1}`;if(r.has(e)){let i=2;for(;r.has(`${e}-${i}`);)i+=1;t.push({level:`warn`,nodeId:e,msg:`节点 id 重复，已重命名为 ${e}-${i}`}),e=`${e}-${i}`,n+=1}let o={...a,id:e,scene:d(a.scene),text:(a.text??``).trim()};r.set(e,o),i.push(o)}if(i.length===0)return t.push({level:`error`,msg:`剧本没有任何节点，无法发布`}),{doc:{startNode:`n1`,nodes:[]},diags:t,repaired:n};let a=[],o=new Set(i.map(e=>e.id)),s=e=>{let t=e.toLowerCase().replace(/\s+/g,``);return i.find(e=>e.id.toLowerCase().replace(/\s+/g,``)===t)?.id};for(let e of i){e.choices=(e.choices??[]).filter(e=>(e.label??``).trim().length>0);for(let r of e.choices){if(!r.next||o.has(r.next))continue;let i=s(r.next);if(i){t.push({level:`info`,nodeId:e.id,msg:`选项「${r.label}」目标 ${r.next} 已按名称对齐到 ${i}`}),r.next=i,n+=1;continue}let c=r.next;a.push({id:c,scene:e.scene,text:`（作者待补：${c}）`,ending:!0,endingTitle:`待补`,choices:[]}),o.add(c),t.push({level:`warn`,nodeId:e.id,msg:`选项「${r.label}」指向不存在的节点 ${c}，已自动补占位节点，请在创作中心补全`}),n+=1}}let c=i.length;i.push(...a),i.slice(0,c).forEach((e,r)=>{if(e.ending||e.choices.length>0)return;let a=r+1<c?i[r+1]:void 0;a?(e.choices.push({label:`继续`,next:a.id}),t.push({level:`info`,nodeId:e.id,msg:`非结局且没有选项，已自动接上下一节`}),n+=1):(e.ending=!0,e.endingTitle=e.endingTitle||`结局`,t.push({level:`info`,nodeId:e.id,msg:`末节没有选项，已标记为结局`}),n+=1)});let l=e.startNode;o.has(l)||(l=s(l??``)??i[0].id,t.push({level:`info`,msg:`起始节点缺失/不存在，已改为 ${l}`}),n+=1);let u=new Set,f=[l],p=new Map(i.map(e=>[e.id,e]));for(;f.length;){let e=f.pop();if(u.has(e))continue;u.add(e);let t=p.get(e);if(t)for(let e of t.choices)e.next&&f.push(e.next)}let m=i.filter(e=>!u.has(e.id));return m.length>0&&t.push({level:`warn`,msg:`${m.length} 个节点从起点不可达：${m.slice(0,5).map(e=>e.id).join(`、`)}${m.length>5?`…`:``}`}),i.some(e=>e.ending)||t.push({level:`warn`,msg:`没有任何结局节点，建议至少补一个 "结局" 标记`}),{doc:{startNode:l,nodes:i},diags:t,repaired:n}}function w(e){let t=(e??``).trim(),n=[];if(!t)return{doc:{startNode:`n1`,nodes:[]},diags:[{level:`error`,msg:`内容为空`}],format:`text`,repaired:0};let r=`text`,i;if(t.startsWith(`{`)||t.startsWith(`[`))try{r=`json`,i=f(JSON.parse(t),n)}catch(e){n.push({level:`error`,msg:`JSON 解析失败：${e.message}`}),i={startNode:`n1`,nodes:[]}}else/^::\s+/m.test(t)?(r=`twee`,i=m(t,n)):i=S(t,n);let a=C(i,n);return{doc:a.doc,diags:a.diags,format:r,repaired:a.repaired}}function T(e,t){let n=new Map(e.nodes.map(e=>[e.id,e]));if(!n.has(t)||!n.has(e.startNode))return[];let r=new Map,i=new Set([e.startNode]),a=[e.startNode];for(;a.length;){let e=a.shift();if(e===t)break;let o=n.get(e);if(o)for(let t of o.choices){let o=t.next;o&&!i.has(o)&&n.has(o)&&(i.add(o),r.set(o,{from:e,label:t.label}),a.push(o))}}let o=[],s=new Set,c=t;for(;c&&!s.has(c);)s.add(c),o.push(c),c=r.get(c)?.from;return o.reverse(),o[0]===e.startNode?o.map((e,t)=>({node:n.get(e),viaLabel:t===0?void 0:r.get(e)?.label})):[]}function E(e){let t={version:1,startNode:e.startNode,nodes:e.nodes.map(e=>({id:e.id,scene:e.scene,...e.speaker?{speaker:e.speaker}:{},text:e.text,...e.ending?{ending:!0,endingTitle:e.endingTitle||`结局`}:{},choices:e.choices.map(e=>({label:e.label,...e.next?{next:e.next}:{}}))}))};return JSON.stringify(t,null,2)}var D={json:`{
  "startNode": "start",
  "nodes": [
    {
      "id": "start",
      "scene": "sea",
      "text": "四月的风穿过栈桥，海面反着碎银一样的光。",
      "choices": [
        { "label": "走向灯塔", "next": "lighthouse" },
        { "label": "留在原地", "next": "stay" }
      ]
    },
    {
      "id": "lighthouse",
      "scene": "lighthouse",
      "speaker": "林夏",
      "text": "你终于来了。灯塔今晚不熄。",
      "choices": [{ "label": "握住她的手", "next": "end_good" }]
    },
    {
      "id": "stay",
      "scene": "sea",
      "text": "潮声漫过脚背，你在原地站了很久。",
      "choices": [{ "label": "转身离开", "next": "end_bad" }]
    },
    {
      "id": "end_good",
      "scene": "lighthouse",
      "text": "灯亮起来的一瞬，你听见她说：这次别再走了。",
      "ending": true,
      "endingTitle": "灯塔不熄"
    },
    {
      "id": "end_bad",
      "scene": "sea",
      "text": "身后的灯忽然灭了。",
      "ending": true,
      "endingTitle": "错过的潮汐"
    }
  ]
}`,text:`# start | 场景 sea
四月的风穿过栈桥，海面反着碎银一样的光。
> 走向灯塔 -> lighthouse
> 留在原地 -> stay

# lighthouse | 场景 lighthouse
@林夏：你终于来了。灯塔今晚不熄。
> 握住她的手 -> end_good

# stay | 场景 sea
潮声漫过脚背，你在原地站了很久。
> 转身离开 -> end_bad

# end_good | 场景 lighthouse | 结局 灯塔不熄
灯亮起来的一瞬，你听见她说：这次别再走了。

# end_bad | 场景 sea | 结局 错过的潮汐
身后的灯忽然灭了。`,twee:`:: start [sea]
四月的风穿过栈桥，海面反着碎银一样的光。
[[走向灯塔->lighthouse]]
[[留在原地->stay]]

:: lighthouse [lighthouse]
@林夏：你终于来了。灯塔今晚不熄。
[[握住她的手->end_good]]

:: stay [sea]
潮声漫过脚背，你在原地站了很久。
[[转身离开->end_bad]]

:: end_good [lighthouse ending=灯塔不熄]
灯亮起来的一瞬，你听见她说：这次别再走了。

:: end_bad [sea ending=错过的潮汐]
身后的灯忽然灭了。`};export{o as a,E as i,T as n,D as r,w as t};