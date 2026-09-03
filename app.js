(() => {
  const c = window.SITE_CONTENT;
  const $ = (s, root=document) => root.querySelector(s);
  const esc = (s='') => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const heading = (eyebrow,title,text,center=false) => `<div class="section-heading ${center?'center':''}"><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${text?`<p>${esc(text)}</p>`:''}</div>`;
  const isUnlocked = d => !d || new Date() >= new Date(`${d}T00:00:00`);

  $('#introEyebrow').textContent = c.intro.eyebrow;
  $('#introLines').innerHTML = c.intro.lines.map((line,i)=>`<h1 style="--delay:${.25+i*.5}s">${esc(line)}</h1>`).join('');
  $('#enterBtn').innerHTML = `${esc(c.intro.button)} <span>↓</span>`;

  const start = new Date(`${c.couple.relationshipStartDate}T00:00:00`), now = new Date();
  const totalDays = Math.max(0,Math.floor((now-start)/86400000));
  let years=now.getFullYear()-start.getFullYear(), months=now.getMonth()-start.getMonth(), days=now.getDate()-start.getDate();
  if(days<0){months--;days+=new Date(now.getFullYear(),now.getMonth(),0).getDate()}
  if(months<0){years--;months+=12}
  $('#daysTogether').textContent = `${totalDays.toLocaleString()} days of us`;
  $('#durationText').textContent = `${Math.max(0,years)} years · ${Math.max(0,months)} months · ${Math.max(0,days)} days of choosing each other`;

  const chapters=[
    ['story','01 Us'],['photo','02 One photo'],['reasons','03 You'],['places','04 Places'],
    ['quiz','05 Quiz'],['letters','06 Letters'],['rituals','07 Rituals'],['future','08 Future'],
    ['video','09 One video'],['finale','10 Tonight']
  ];
  $('#chapterNav').innerHTML=chapters.map(x=>`<a href="#${x[0]}">${x[1]}</a>`).join('');

  $('#story').innerHTML = heading(
    'Chapter 01',
    'How we became us',
    'No slideshow needed. Some memories are stronger when you tell the part a camera could never capture.'
  ) + `<div class="text-timeline">${c.timeline.map((m,i)=>`
    <article class="text-memory">
      <div class="memory-number">${String(i+1).padStart(2,'0')}</div>
      <div class="memory-copy">
        <div class="memory-meta"><span>${esc(m.date)}</span><span>⌖ ${esc(m.location)}</span></div>
        <h3>${esc(m.title)}</h3>
        <p>${esc(m.description)}</p>
      </div>
    </article>`).join('')}</div>`;

  const photo = c.featuredPhoto;
  $('#photo').innerHTML = heading('Chapter 02', photo.title, photo.caption, true) + `
    <div class="one-photo-stage">
      <div class="one-photo-frame">
        <img id="featuredPhoto" src="${esc(photo.src)}" alt="Mahmoud and Riri" loading="lazy">
        <div class="single-media-fallback" id="photoFallback">
          <span class="eyebrow">${esc(photo.eyebrow)}</span>
          <strong>Add your one photo as<br><code>images/us.jpg</code></strong>
        </div>
      </div>
      <div class="one-photo-note">One photograph is enough when you know the whole story behind it.</div>
    </div>`;
  const featuredPhoto = $('#featuredPhoto');
  featuredPhoto.onerror = () => { featuredPhoto.style.display='none'; $('#photoFallback').style.display='grid'; };

  $('#reasons').innerHTML = heading(
    'Chapter 03','Why I choose you',
    'Not a list of perfect qualities. A collection of the things I notice, remember, and keep choosing.'
  ) + `<div class="reason-grid">${c.reasons.map((r,i)=>`<article class="reason-card"><span>${String(i+1).padStart(2,'0')}</span><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join('')}</div><p class="handwritten-center">I know you. I see you. I choose you.</p>`;

  $('#places').innerHTML = heading(
    'Chapter 04','Places that became ours',
    'The places are not special because of how they looked. They are special because something happened there that became ours.'
  ) + `<div class="memory-map"><div class="map-grid"></div><div class="map-path path-a"></div><div class="map-path path-b"></div>${c.memoryMap.map((p,i)=>`<button class="map-pin" data-place="${i}" style="left:${p.x}%;top:${p.y}%"><span>${i+1}</span></button>`).join('')}<span class="map-label label-one">M</span><span class="map-label label-two">R</span></div><div class="map-legend">${c.memoryMap.map((p,i)=>`<button data-place="${i}"><span>${i+1}</span>${esc(p.place)}</button>`).join('')}</div>`;

  const modalRoot=$('#modalRoot');
  const closeModal=()=>modalRoot.innerHTML='';
  document.addEventListener('click',e=>{
    const place=e.target.closest('[data-place]');
    if(place){
      const p=c.memoryMap[+place.dataset.place];
      modalRoot.innerHTML=`<div class="modal-backdrop"><article class="memory-modal text-only-modal"><button class="modal-close" data-close>×</button><span class="location">⌖ ${esc(p.date)}</span><h3>${esc(p.place)}</h3><p>${esc(p.story)}</p></article></div>`;
    }
    if(e.target.matches('[data-close]')||e.target.classList.contains('modal-backdrop')) closeModal();
  });

  let qi=0,score=0,selected=null,finished=false;
  const renderQuiz=()=>{
    if(finished){
      const result=score===c.quiz.length?'Suspicious. You know too much about us.':score>=Math.ceil(c.quiz.length*.7)?'Relationship privileges remain fully active.':'We may need an emergency coffee and a revision session 😂';
      $('#quiz').innerHTML=heading('Chapter 05','Do you remember?','A completely scientific test of how much relationship lore you have retained.',true)+`<div class="quiz-card"><div class="quiz-result"><span class="eyebrow">Final score</span><div class="score">${score}/${c.quiz.length}</div><h3>${esc(result)}</h3><button id="restartQuiz">↻ Again, because apparently this matters</button></div></div>`;
      $('#restartQuiz').onclick=()=>{qi=0;score=0;selected=null;finished=false;renderQuiz()};
      return;
    }
    const q=c.quiz[qi];
    $('#quiz').innerHTML=heading('Chapter 05','Do you remember?','A completely scientific test of how much relationship lore you have retained.',true)+`<div class="quiz-card"><div class="quiz-top"><span>Question ${qi+1} / ${c.quiz.length}</span><span>${score} correct</span></div><div class="quiz-progress"><span style="width:${((qi+1)/c.quiz.length)*100}%"></span></div><h3>${esc(q.question)}</h3><div class="quiz-options">${q.options.map((o,i)=>`<button data-answer="${i}" class="${selected===i?'selected':''} ${selected!==null&&i===q.answer?'correct':''}"><span>${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div>${selected!==null?`<div class="quiz-reaction"><p>${esc(q.reaction)}</p><button id="nextQuiz">${qi===c.quiz.length-1?'See my verdict':'Next question'}</button></div>`:''}</div>`;
    document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(selected!==null)return;selected=+b.dataset.answer;if(selected===q.answer)score++;renderQuiz()});
    const n=$('#nextQuiz');
    if(n)n.onclick=()=>{if(qi===c.quiz.length-1)finished=true;else qi++;selected=null;renderQuiz()};
  };
  renderQuiz();

  $('#letters').innerHTML=heading('Chapter 06','Letters for you','For moments I cannot predict, but still want to be there for.')+`<div class="letter-grid">${c.letters.map((l,i)=>{const u=isUnlocked(l.unlockDate);return`<button class="envelope ${u?'':'locked'}" ${u?`data-letter="${i}"`:''}><div class="envelope-flap"></div><span style="font-size:25px">✉</span><h3>${esc(l.title)}</h3><span>${u?'Open letter':'🔒 Not yet, my love'}</span></button>`}).join('')}</div>`;
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-letter]');
    if(!b)return;
    const l=c.letters[+b.dataset.letter];
    modalRoot.innerHTML=`<div class="modal-backdrop letter-backdrop"><article class="letter-paper"><button class="modal-close dark" data-close>×</button><span class="letter-date">A letter for Riri</span><h3>${esc(l.title)}</h3>${l.body.split('\n').map(x=>`<p>${x?esc(x):'&nbsp;'}</p>`).join('')}<div class="signature">${esc(l.signature)}</div></article></div>`;
  });

  $('#rituals').innerHTML=heading('Chapter 07','Things I never want us to stop doing','Because love is not only what we feel. A lot of it is what we keep doing.')+`<div class="ritual-list">${c.rituals.map((r,i)=>`<div class="ritual"><span>✓</span><p>${esc(r)}</p><small>0${i+1}</small></div>`).join('')}</div><blockquote>“I don't only want memories with you. I want traditions with you.”</blockquote>`;

  $('#future').innerHTML=heading('Chapter 08','Places we haven\'t reached yet','Not promises written in stone. Just things I hope we get the privilege of discovering together.')+`<div class="future-list">${c.future.map((f,i)=>`<article class="future-item"><span class="future-year">${esc(f.year)}</span><div><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></div><span>↗</span><span class="future-index">${String(i+1).padStart(2,'0')}</span></article>`).join('')}</div>`;

  const video = c.video;
  $('#video').innerHTML = heading('Chapter 09', video.title, video.subtitle, true) + `
    <div class="single-video-shell">
      <video id="birthdayVideo" class="birthday-video" controls playsinline preload="metadata">
        <source src="${esc(video.src)}" type="video/mp4">
      </video>
      <div class="single-media-fallback video-fallback" id="videoFallback">
        <span class="eyebrow">${esc(video.eyebrow)}</span>
        <strong>Add your one video as<br><code>videos/our-video.mp4</code></strong>
        <small>A direct 60–90 second message from you will be more powerful than a montage.</small>
      </div>
    </div>
    <p class="video-note">${esc(video.note)}</p>`;
  const birthdayVideo=$('#birthdayVideo');
  birthdayVideo.addEventListener('error',()=>{birthdayVideo.style.display='none';$('#videoFallback').style.display='grid';});

  let reveal=false,secretClicks=0;
  const renderFinale=()=>{
    $('#finale').innerHTML=`<div class="finale-stars"></div><div class="finale-inner"><span class="eyebrow">One last chapter</span>${c.finale.lines.map((l,i)=>`<h2 class="${i===2?'accent-line':''}">${esc(l)}</h2>`).join('')}${!reveal?'<button class="primary-button" id="revealFinal">Okay… show me</button>':`<div class="surprise-reveal">${c.finale.surprise.map(l=>`<p>${esc(l)}</p>`).join('')}<button class="ghost-button" id="finalLetter">One last thing…</button></div>`}</div><footer><button class="secret-heart" id="secretHeart">♥</button><span>mahmoudandririforever.com</span><span>made by Mahmoud, for Riri</span></footer>`;
    const r=$('#revealFinal');
    if(r)r.onclick=()=>{reveal=true;renderFinale()};
    const fl=$('#finalLetter');
    if(fl)fl.onclick=()=>modalRoot.innerHTML=`<div class="modal-backdrop"><article class="final-letter"><button class="modal-close" data-close>×</button><span class="eyebrow">Happy Birthday</span>${c.finale.letter.split('\n').map(x=>`<p>${x?esc(x):'&nbsp;'}</p>`).join('')}</article></div>`;
    $('#secretHeart').onclick=()=>{
      secretClicks++;
      if(secretClicks>=5){
        modalRoot.innerHTML=`<div class="modal-backdrop"><article class="secret-card"><button class="modal-close" data-close>×</button><span class="eyebrow">You were not supposed to find this so quickly</span><h3>${esc(c.easterEgg.title)}</h3><div class="confessions">${c.easterEgg.confessions.map((x,i)=>`<p><span>0${i+1}</span>${esc(x)}</p>`).join('')}</div></article></div>`;
      }
    };
  };
  renderFinale();

  $('#enterBtn').onclick=()=>{
    $('#main').classList.remove('soft-locked');
    $('#chapterNav').classList.remove('hidden');
    setTimeout(()=>$('#story').scrollIntoView({behavior:'smooth'}),100);
  };

  window.addEventListener('scroll',()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    $('#progress').style.width=`${max>0?scrollY/max*100:0}%`;
  },{passive:true});
})();
