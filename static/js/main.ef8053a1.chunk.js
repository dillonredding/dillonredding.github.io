(this["webpackJsonpdillonredding.github.io"]=this["webpackJsonpdillonredding.github.io"]||[]).push([[0],{14:function(e,n,a){},23:function(e,n,a){"use strict";a.r(n);var t,r,i,c,o=a(0),s=a.n(o),l=a(3),d=a.n(l),u=(a(14),a(1));!function(e){e.Solid="fas",e.Brands="fab"}(t||(t={})),function(e){e.Normal="",e.Large="fa-lg",e.ExtraLarge="fa-2x"}(r||(r={})),function(e){e.FileIcon="file-icon",e.Icon="icon",e.PanelIcon="panel-icon"}(i||(i={})),function(e){e.Small="is-small",e.Normal="",e.Medium="is-medium",e.Large="is-large"}(c||(c={}));var m=function(e){var n=e.name,a=e.style,o=void 0===a?t.Solid:a,s=e.size,l=void 0===s?r.Normal:s,d=e.type,m=void 0===d?i.Icon:d,b=e.containerSize,j=void 0===b?c.Normal:b,f=e.left,v=void 0!==f&&f;return Object(u.jsx)("span",{className:"".concat(m," ").concat(j," ").concat(v?"is-left":""),children:Object(u.jsx)("i",{className:"".concat(o," fa-").concat(n," ").concat(l)})})};var b=function(){return Object(u.jsx)("div",{className:"App",children:Object(u.jsx)("nav",{className:"navbar is-spaced",role:"navigation","aria-label":"main navigation",children:Object(u.jsxs)("div",{className:"container",children:[Object(u.jsx)("div",{className:"navbar-brand",children:Object(u.jsxs)("a",{href:"/#",role:"button",className:"navbar-burger","aria-label":"menu","aria-expanded":"false","data-target":"navbarBasicExample",children:[Object(u.jsx)("span",{"aria-hidden":"true"}),Object(u.jsx)("span",{"aria-hidden":"true"}),Object(u.jsx)("span",{"aria-hidden":"true"})]})}),Object(u.jsx)("div",{id:"navbarBasicExample",className:"navbar-menu",children:Object(u.jsxs)("div",{className:"navbar-end",children:[Object(u.jsx)("a",{className:"navbar-item",href:"https://github.com/dillonredding",target:"_blank",rel:"noopener noreferrer",children:Object(u.jsx)(m,{name:"github",style:t.Brands,size:r.Large})}),Object(u.jsx)("a",{className:"navbar-item",href:"https://twitter.com/dillon_redding",target:"_blank",rel:"noopener noreferrer",children:Object(u.jsx)(m,{name:"twitter",style:t.Brands,size:r.Large})}),Object(u.jsx)("a",{className:"navbar-item",href:"https://medium.com/@dillonredding",target:"_blank",rel:"noopener noreferrer",children:Object(u.jsx)(m,{name:"medium",style:t.Brands,size:r.Large})})]})})]})})})},j=a(2),f=a(5),v=a.n(f),h=a(7);function g(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1;return new Promise((function(n){return setTimeout((function(){return n({data:e})}),500)}))}var p=Object(j.b)("counter/fetchCount",function(){var e=Object(h.a)(v.a.mark((function e(n){var a;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,g(n);case 2:return a=e.sent,e.abrupt("return",a.data);case 4:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}()),x=Object(j.c)({name:"counter",initialState:{value:0,status:"idle"},reducers:{increment:function(e){e.value+=1},decrement:function(e){e.value-=1},incrementByAmount:function(e,n){e.value+=n.payload}},extraReducers:function(e){e.addCase(p.pending,(function(e){e.status="loading"})).addCase(p.fulfilled,(function(e,n){e.status="idle",e.value+=n.payload}))}}),O=x.actions,N=(O.increment,O.decrement,O.incrementByAmount,x.reducer),w=Object(j.a)({reducer:{counter:N}}),y=a(9);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));d.a.render(Object(u.jsx)(s.a.StrictMode,{children:Object(u.jsx)(y.a,{store:w,children:Object(u.jsx)(b,{})})}),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[23,1,2]]]);
//# sourceMappingURL=main.ef8053a1.chunk.js.map