"use strict";(self.webpackChunkclient=self.webpackChunkclient||[]).push([[228],{3228:(e,n,t)=>{t.r(n),t.d(n,{default:()=>l});var s=t(5043),r=t(3003),a=t(8235),o=t(1637),c=t(5749),i=t(579);function l(e){let{state:n,selectedUser:t,roomId:l,user:d}=e;const u=(0,c.io)("https://realtime-chat-app-u5mw.onrender.com"),m=(0,r.wA)(),g=(0,r.d4)((e=>e.newMessage)),[h,v]=(0,s.useState)(null),f=(0,s.useRef)(null),p=e=>{const n=new Date(e),t=n.getHours(),s=n.getMinutes(),r=t>=12?"PM":"AM",a=t%12||12,o=x(e);return"| ".concat(o," | ").concat(a,":").concat(s<10?"0"+s:s," ").concat(r)},x=e=>{const n=new Date(e),t=n.getDate(),s=n.getMonth()+1,r=n.getFullYear();return"".concat(t<10?"0"+t:t,"-").concat(s<10?"0"+s:s,"-").concat(r)};return(0,s.useEffect)((()=>{(async e=>{try{const n=await fetch("".concat("https://realtime-chat-app-u5mw.onrender.com","/conversation"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId:e})});if(!n.ok)return void console.log("Error:",n.status,n.statusText);{const e=await n.json();e&&e.conversation.length>0?v(e.conversation):(v([]),document.getElementById("conversation").innerHTML='<div id="deaultConvo">No conversation with '.concat(t.username,"</div>"))}}catch(n){console.error("Error fetching session:",n)}})(l)}),[l]),(0,s.useEffect)((()=>{t&&v(null)}),[t]),(0,s.useEffect)((()=>{g&&(console.log(g),v((e=>[...e,g])),m((0,a.hh)()))}),[g,m]),(0,s.useEffect)((()=>(u.on("get_message",(e=>{if(d.username===e.to.username){let n={date:new Date,from:e.from.email,message:e.message};v((e=>[...e,n])),m((0,a.hh)())}})),()=>{u.off("get_message")})),[]),(0,s.useEffect)((()=>{f.current&&(f.current.scrollTop=f.current.scrollHeight-f.current.clientHeight)}),[g,h]),(0,i.jsx)("div",{ref:f,id:"conversation",name:"conversation",className:"conversation",children:h?null===h||void 0===h?void 0:h.map(((e,n)=>{const{message:s,url:r}=(e=>{const[n,t]=null===e||void 0===e?void 0:e.split("#$IMG$#");return{message:n,url:t}})(null===e||void 0===e?void 0:e.message),a=(e=>{const n=null===e||void 0===e?void 0:e.match(/(https?:\/\/[^\s]+)/);if(n){const t=n[0],s=e.replace(t,'<a href="'.concat(t,'" target="_blank" rel="noopener noreferrer">').concat(t,"</a>"));return(0,i.jsx)("span",{dangerouslySetInnerHTML:{__html:s}})}return(0,i.jsx)("span",{children:e})})(s),o=e.from,c=null===d||void 0===d?void 0:d.primaryEmailAddress.emailAddress;return(0,i.jsxs)("div",{className:o===c?"messageFromCurrentUser":"messageFromSecondUser",children:[(0,i.jsx)("div",{className:"avatarContainer",children:(0,i.jsx)("img",{src:o===c?d.imageUrl:t.image_url,alt:o===c?d.username+" image":t.username+" image"})}),(0,i.jsxs)("div",{className:"textMessageCont",children:[(0,i.jsx)("h4",{children:a}),r&&(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("img",{loading:"lazy",src:r,alt:s}),(0,i.jsx)("h4",{children:s})]}),(0,i.jsx)("span",{children:p(e.date)})]})]},n)})):(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10},id:"conversation",name:"conversation",className:"conversation",children:[(0,i.jsx)(o.A,{}),(0,i.jsx)("p",{children:"Loading..."})]})})}}}]);
//# sourceMappingURL=228.efe0e7ac.chunk.js.map