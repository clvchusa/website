/* ═══════════════════════════════════════════════════════════════
   CLVCH 2026 — Router & page templates
   ═══════════════════════════════════════════════════════════════ */

const outlet = document.getElementById("outlet");

function h(str) { return str.replace(/&/g,"&amp;").replace(/</g,"&lt;"); }

/* ─────── GAMEDAY POSTER MODULE ───────
   scope === "home" → rotates across every enabled poster across all cities.
   scope === "<cityId>" → only that city's enabled posters.
   Falls back to the default CLVCH poster when a scope is disabled or empty. */
function renderGameday(scope) {
  const G = window.CLVCH.gameday;
  let posters = [];
  let sectionEnabled = true;
  let cityMeta = null;

  if (scope === "home") {
    posters = window.CLVCH.allEnabledPosters();
  } else {
    cityMeta = G[scope];
    if (!cityMeta || !cityMeta.enabled) {
      sectionEnabled = false;
    } else {
      posters = (cityMeta.items || []).filter(i => i.on).map(i => ({ ...i, cityId: scope }));
    }
  }

  // When disabled entirely → don't render the section
  if (!sectionEnabled) return "";

  // When no posters but section is on → show default CLVCH poster
  const usingDefault = posters.length === 0;
  if (usingDefault) {
    posters = [{ id: "default", src: window.CLVCH.defaultPoster, label: scope === "home" ? "CLVCH · Every city, every night" : `${cityMeta ? "CLVCH · " + scope.toUpperCase() : "CLVCH"}`, isDefault: true }];
  }

  // Social handles: on city scope use that city's; on home use brand handles
  let ig = window.CLVCH.home?.contact?.instagram || "clvch.usa";
  let fb = window.CLVCH.home?.contact?.facebook  || "clvchusa";
  let caption = "Tonight's lineup, offers, and last call.";
  if (scope !== "home" && cityMeta) {
    ig = cityMeta.instagram || ig;
    fb = cityMeta.facebook || fb;
    caption = cityMeta.caption || caption;
  }

  const single = posters.length === 1;
  const eyebrow = scope === "home" ? "Tonight · across CLVCH" : `Tonight · CLVCH ${scope[0].toUpperCase() + scope.slice(1)}`;

  return `
<section class="gdposter ${single ? 'gdposter--single' : ''}" data-gd-scope="${scope}" aria-label="Tonight's gameday poster">
  <div class="gdposter-inner">
    <div class="gdposter-stage" id="gdStage">
      ${posters.map((p, i) => `
        <div class="gdposter-slide ${i===0?'on':''}" data-idx="${i}" data-city="${p.cityId || ''}">
          <img src="${p.src}" alt="${p.label || 'Gameday poster'}" />
          <div class="gdposter-shade"></div>
          <div class="gdposter-label">
            ${p.cityId && scope === "home" ? `<span class="gdposter-city">${p.city || ''}</span>` : ''}
            <b>${p.label || ''}</b>
          </div>
        </div>
      `).join("")}
      ${posters.length > 1 ? `
        <div class="gdposter-dots" id="gdDots">
          ${posters.map((_, i) => `<button data-dot="${i}" class="${i===0?'on':''}" aria-label="Poster ${i+1}"></button>`).join("")}
        </div>
      ` : ""}
      ${usingDefault ? `<div class="gdposter-default-tag">House poster</div>` : ""}
    </div>

    <aside class="gdposter-side">
      <div class="eyebrow">${eyebrow}</div>
      <h3>Tonight's<br><em>lineup.</em></h3>
      <p class="gdposter-caption">Tap the links below for what's on at your chosen location — every night, every kitchen, every floor.</p>

      <div class="gdposter-socials">
        <a class="gdposter-soc gdposter-soc--ig" href="https://instagram.com/${ig}" target="_blank" rel="noreferrer">
          <span class="gdposter-soc-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6">
              <rect x="3" y="3" width="18" height="18" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </span>
          <span class="gdposter-soc-text">
            <small>Instagram</small>
            <b>@${ig}</b>
          </span>
          <span class="gdposter-soc-arrow">→</span>
        </a>
        <a class="gdposter-soc gdposter-soc--fb" href="https://facebook.com/${fb}" target="_blank" rel="noreferrer">
          <span class="gdposter-soc-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.5H7.8V13h2.7v8h3z"/>
            </svg>
          </span>
          <span class="gdposter-soc-text">
            <small>Facebook</small>
            <b>/${fb}</b>
          </span>
          <span class="gdposter-soc-arrow">→</span>
        </a>
      </div>

      <div class="gdposter-micro">
        <span>Click through for tonight's offers, table drops, and member codes.</span>
      </div>
      <div class="gdposter-notify">
        <p class="gdposter-notify-label">Get notified when the lineup drops →</p>
        <form class="gdposter-notify-form" id="gdNotifyForm">
          <input type="email" placeholder="your@email.com" required autocomplete="email" />
          <button type="submit">Notify me</button>
        </form>
      </div>
    </aside>
  </div>
</section>
  `;
}

/* Public renderers see active cities only. Admin uses window.CLVCH.locations directly. */
function publicLocations() {
  return window.CLVCH.locations.filter(l => !l.disabled);
}

/* ─────── HOME ─────── */
function renderHome() {
  const L = publicLocations();
  const H = window.CLVCH.home;
  const heroBlurb = H.hero.blurb;
  const subModes = H.hero.subModes || [];
  const pillars = H.pillars.items || [];
  const homeMarquee = (H.marqueeWords || []).filter(Boolean);
  const homeMarqueeHTML = (homeMarquee.length ? homeMarquee : ["CLVCH"]).map((w, i) => i % 2 === 0 ? `<span>${w}<em> · </em></span>` : `<span>${w}</span>`).join("");
  return `
<!-- HERO -->
<section class="hero">
  <div class="hero-video">
    <video autoplay muted loop playsinline>
      <source src="${H.hero.videoSrc}" type="video/mp4">
    </video>
  </div>
  <div class="hero-inner">
    <div class="hero-top">
      <div class="hero-coords">
        33.7490° N · 84.3880° W<br>
        <span>● LIVE</span> · ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} EST
      </div>
      <div class="hero-chapter">
        ${H.hero.chapter}<br>
        <strong>${H.hero.estLine}</strong>
      </div>
    </div>

    <div class="hero-headline">
      <span class="word">${H.hero.word1}<em>·</em></span>
      <span class="word">${H.hero.word2}<em>·</em></span>
      <span class="word">${H.hero.word3}<em>.</em></span>
      <div class="hero-sub">
        ${subModes.map((m, i) => `<span class="${i===0?'active':''}">${m}</span>`).join("")}
      </div>
    </div>

    <div class="hero-bottom">
      <p class="hero-blurb">${heroBlurb}</p>
      <a href="#/reserve" class="hero-stats" data-link style="text-decoration:none;">
        <div><div class="n">${String(L.length).padStart(2,'0')}</div><div class="l">Location${L.length===1?'':'s'}</div></div>
      </a>
    </div>
  </div>
</section>



<!-- PILLARS -->
<section class="pillars" id="pillars">
  <div class="pillars-head">
    <h2>${H.pillars.headline}</h2>
    <p>${H.pillars.intro}</p>
  </div>
  <div class="pillars-grid">
    ${pillars.map((p, i) => {
      const imgs = Array.isArray(p.images) && p.images.length ? p.images : [p.image];
      const carousel = `<div class="pillar-img${imgs.length > 1 ? ' pillar-carousel' : ''}"${imgs.length > 1 ? ' data-pillar-carousel' : ''}>
        ${imgs.map((src, j) => `<img src="${src}" alt="" class="${j === 0 ? 'on' : ''}" loading="${j === 0 ? 'eager' : 'lazy'}">`).join('')}
      </div>`;
      return `
      <div class="pillar pillar--img-${i % 2 === 0 ? 'left' : 'right'}">
        ${i % 2 === 0 ? carousel : ''}
        <div class="pillar-body">
          <div class="pillar-num">${p.num}</div>
          <h3>${p.title}<em>&nbsp;${i === pillars.length - 1 ? '.' : '·'}</em></h3>
          <p>${p.copy}</p>
          <div class="pillar-list">
            <b>${p.listLabel}</b> &nbsp;·&nbsp; ${p.listItems}
          </div>
        </div>
        ${i % 2 !== 0 ? carousel : ''}
      </div>
    `}).join("")}
  </div>
</section>

<!-- LOCATION SWITCHER -->
<section class="locswitch" id="locswitch">
  <div class="locswitch-inner">
    <aside class="locswitch-aside">
      <div class="eyebrow">The House · ${L.length} cities</div>
      <h2>Pick a <em>city.</em><br>Step inside.</h2>

      <div class="loc-search">
        <svg class="loc-search-ico" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.2"/>
          <path d="M11 11 L14 14" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <input id="locSearch" type="search" placeholder="Search cities, states…" autocomplete="off" spellcheck="false" />
        <span class="loc-search-count" id="locSearchCount">${L.length}</span>
      </div>

      <div class="loc-filters" id="locFilters">
        <button class="on" data-filter="all">All <span>${L.length}</span></button>
        <button data-filter="open">Open now <span>${L.filter(l=>l.status==='open').length}</span></button>
        <button data-filter="soon">Coming soon <span>${L.filter(l=>l.status==='soon').length}</span></button>
      </div>

      <div class="loc-list-wrap">
        <div class="loc-list" id="locList" tabindex="0">
          ${L.map((l, i) => `
            <div class="loc-item ${i===0?'active':''}" data-loc="${l.id}" data-status="${l.status}" data-search="${(l.city+' '+l.state).toLowerCase()}">
              <span class="loc-num">${String(i+1).padStart(2,"0")}</span>
              <div>
                <div class="loc-city">${l.city}</div>
                <small class="loc-state">${l.state}</small>
              </div>
              <div class="loc-status ${l.status!=='open'?'closed':''}">
                <span class="sd"></span>
                ${l.status === 'open' ? 'Open' : l.status === 'prep' ? 'Opens 4' : 'Soon'}
              </div>
            </div>
          `).join("")}
          <div class="loc-empty" id="locEmpty" hidden>No cities match that search.</div>
        </div>
        <div class="loc-list-fade"></div>
      </div>
    </aside>

    <div class="locswitch-stage" id="locStage">
      <div class="locswitch-corner">
        <b>Live feed</b>
        Facility · Tonight · ${new Date().toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'})}
      </div>
      ${L.map((l, i) => `
        <div class="locswitch-frame ${i===0?'on':''}" data-frame="${l.id}">
          <img src="${l.hero}" alt="${l.city}">
          <div class="locswitch-meta">
            <div>
              <div class="hd">
                <small>${l.state} · ${l.status === 'open' ? 'Open Now' : l.status === 'soon' ? 'Opening 2026' : 'Opens Today 4 PM'}</small>
                ${l.city}
              </div>
              <dl class="kv" style="margin-top:24px;">
                <div><dt>Tonight</dt><dd>${l.tonight}</dd></div>
                <div><dt>Capacity</dt><dd>${l.capacity}</dd></div>
                <div><dt>Opened</dt><dd>${l.opened}</dd></div>
              </dl>
              <div class="actions">
                <a href="#/locations/${l.id}" data-link>Step Inside →</a>
                <a href="#/reserve?city=${l.id}" data-link>Reserve</a>
              </div>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  </div>
</section>

<!-- MARQUEE -->
<div class="marquee">
  <div class="marquee-track">
    ${homeMarqueeHTML}${homeMarqueeHTML}
  </div>
</div>


<!-- RESERVE CTA -->
<section class="reserve-strip">
  <div class="reserve-strip-inner">
    <div>
      <div class="eyebrow" style="margin-bottom:20px;">${H.reserveStrip.eyebrow}</div>
      <h2>${H.reserveStrip.headline}</h2>
      <p class="sub">${H.reserveStrip.sub}</p>
    </div>
    <a href="#/reserve" class="bigcta" data-link>
      <div>
        <div class="t">${H.reserveStrip.ctaTitle}</div>
        <div class="s">${H.reserveStrip.ctaSub}</div>
      </div>
    </a>
  </div>
</section>

${renderFooter()}
  `;
}

/* ─────── LOCATIONS INDEX ─────── */
function renderLocations() {
  const L = publicLocations();
  return `
<section class="locpage">
  <div class="locpage-head">
    <div>
      <div class="eyebrow" style="margin-bottom:24px;">The Atlas</div>
      <h1>Four <em>rooms</em><br>Four cities.</h1>
    </div>
  </div>

  <div class="locpage-body">
    <!-- GRID -->
    <div class="loc-grid" id="locGridView">
      ${L.map((l, i) => `
        <a href="#/locations/${l.id}" data-link class="loc-card">
          <div class="cover"><img src="${l.hero}" alt=""></div>
          <div class="loc-card-tonight">
            <small>Tonight</small>
            ${l.tonight}
          </div>
          <div class="loc-card-top">
            <span>${String(i+1).padStart(2,"0")} / ${String(L.length).padStart(2,"0")}</span>
            <b>${l.status === 'open' ? '● Open' : l.status === 'soon' ? 'Opens 2026' : 'Opens 4 PM'}</b>
          </div>
          <div class="loc-card-bot">
            <h3>${l.city}<em>.</em></h3>
            <div class="meta">
              <b>Find us</b>
              ${l.address.split(" · ").join("<br>")}<br><br>
              <b>Hours</b>
              ${l.hours}
            </div>
          </div>
        </a>
      `).join("")}
    </div>

  </div>
</section>
${renderFooter()}
  `;
}

/* ─────── VENUE DETAIL (Atlanta, Miami, etc.) ─────── */
function renderVenue(id) {
  const l = window.CLVCH.locations.find(x => x.id === id);
  if (!l || l.disabled) return renderLocations();
  return `
<section class="venue-hero">
  <div class="venue-hero-img">
    <img src="${l.hero}" alt="">
  </div>
  <div class="venue-hero-inner">
    <div class="venue-crumbs">
      <a href="#/" data-link>CLVCH</a> /
      <a href="#/locations" data-link>Locations</a> /
      <b>${l.city}</b>
    </div>
    <div class="venue-hero-title">
      <div class="eye">${l.blurb}</div>
      <h1>${l.city}<span style="font-family:var(--editorial);font-style:italic;color:var(--gold);font-weight:300;">.</span></h1>
    </div>
    <div class="venue-hero-bar">
      <div><span class="k">Address</span>${l.address}</div>
      <div><span class="k">Hours</span>${l.hours}</div>
      ${l.phone ? `<div><span class="k">Phone</span><a href="tel:${h(l.phone)}" style="color:var(--bone);">${h(l.phone)}</a></div>` : ''}
      <div><span class="k">Opened</span>${l.opened}</div>
    </div>
  </div>
</section>

<div class="marquee marquee--sm">
  <div class="marquee-track">
    ${(() => {
      // Per-city marquee words come from location.marqueeWords (admin-editable).
      // Empty → fall back to the house line so the marquee never goes blank.
      const custom = Array.isArray(l.marqueeWords) ? l.marqueeWords.filter(Boolean) : [];
      const fallback = ['Bites', 'Beats', 'Booze', 'Late Kitchen', 'Private Events'];
      const base = custom.length ? custom : fallback;
      // Interleave with bullet separators, then duplicate so the loop reads seamlessly.
      const decorated = base.map((w, i) => i % 2 === 0 ? `${w}<em> · </em>` : w);
      return [...decorated, ...decorated].map(w => `<span>${w}</span>`).join('');
    })()}
  </div>
</div>

${renderGameday(l.id)}

<!-- Use the same pillars structure as home, but framed for this venue -->
<section class="pillars">
  <div class="pillars-head">
    <h2>${l.city}'s<br>three <em>rooms.</em></h2>
    <p>Every CLVCH carries the same DNA — a kitchen, a floor, a bar — but each city tells the story in its own dialect. Here's how ${l.city} reads the room.</p>
  </div>
  ${(() => {
    const rm = l.roomImages || {};
    const mkCarousel = (imgs, fallback) => {
      const all = Array.isArray(imgs) && imgs.length ? imgs : [fallback];
      return `<div class="pillar-img${all.length > 1 ? ' pillar-carousel' : ''}"${all.length > 1 ? ' data-pillar-carousel' : ''}>
        ${all.map((src, j) => `<img src="${src}" alt="" class="${j === 0 ? 'on' : ''}" loading="${j === 0 ? 'eager' : 'lazy'}">`).join('')}
      </div>`;
    };
    return `<div class="pillars-grid">
    <div class="pillar pillar--img-left">
      ${mkCarousel(rm.bites, '../assets/img-food-1.jpg')}
      <div class="pillar-body">
        <div class="pillar-num">01 / Kitchen</div>
        <h3>Bites<em> ·</em></h3>
        <p>Chef-driven modern American. Menu rotates seasonally; the wood-fire never stops.</p>
        <div class="pillar-list"><b>View</b> &nbsp;·&nbsp; <a href="#/menu" data-link style="color:var(--gold);">Full menu →</a></div>
      </div>
    </div>
    <div class="pillar pillar--img-right">
      ${mkCarousel(rm.beats, '../assets/img-club-1.jpg')}
      <div class="pillar-body">
        <div class="pillar-num">02 / Floor</div>
        <h3>Beats<em> ·</em></h3>
        <p>${l.city === 'Atlanta' ? 'Throwback Thursdays, Gold Room Saturdays. Sundays are football.' : 'Sports-first, club-second. Sundays are an event.'}</p>
        <div class="pillar-list"><b>This week</b> &nbsp;·&nbsp; ${l.tonight}</div>
      </div>
    </div>
    <div class="pillar pillar--img-left">
      ${mkCarousel(rm.booze, '../assets/img-drink-1.jpg')}
      <div class="pillar-body">
        <div class="pillar-num">03 / Bar</div>
        <h3>Booze<em> .</em></h3>
        <p>House classics, local spirit partnerships, a non-alc program that pulls its weight.</p>
        <div class="pillar-list"><b>Pour list</b> &nbsp;·&nbsp; 47 cocktails · 18 N/A</div>
      </div>
    </div>
  </div>`;
  })()}
</section>

<section class="reserve-strip">
  <div class="reserve-strip-inner">
    <div>
      <div class="eyebrow" style="margin-bottom:20px;">${l.city} · Book the night</div>
      <h2>Table for<br><em>tonight?</em></h2>
      <p class="sub">${l.status === 'open' ? 'Reservations open for tonight and the next 60 nights.' : l.status === 'prep' ? 'Reservations open from 4 PM today.' : 'Founding reservations open. Priority to members and wait-list.'}</p>
    </div>
    <a href="#/reserve?city=${l.id}" class="bigcta" data-link>
      <div>
        <div class="t">Reserve</div>
        <div class="s">→ ${l.city}</div>
      </div>
    </a>
  </div>
</section>

<section class="venue-contact">
  <div class="venue-contact-inner">
    <div class="eyebrow" style="margin-bottom:24px;">Find us · ${h(l.city)}</div>
    <div class="venue-contact-grid">
      ${l.address ? `<div>
        <h4>Address</h4>
        <p>${h(l.address)}</p>
        <a href="https://www.google.com/maps/search/${encodeURIComponent(l.address)}" target="_blank" rel="noopener" class="venue-contact-link">Get directions →</a>
      </div>` : ''}
      ${l.hours ? `<div>
        <h4>Hours</h4>
        <p>${h(l.hours)}</p>
      </div>` : ''}
      ${l.phone ? `<div>
        <h4>Phone</h4>
        <a href="tel:${h(l.phone)}" class="venue-contact-link">${h(l.phone)}</a>
      </div>` : ''}
      <div>
        <h4>Reservations</h4>
        <a href="#/reserve?city=${l.id}" data-link class="venue-contact-link">Reserve a table →</a>
        <br><a href="#/contact" data-link class="venue-contact-link" style="margin-top:8px;display:inline-block;opacity:0.55;font-size:12px;">All locations →</a>
      </div>
    </div>
  </div>
</section>
${renderFooter()}
  `;
}

/* ─────── RESERVE ─────── */
function renderReserve() {
  const L = publicLocations();
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  const preselect = params.get("city") || (L[0] && L[0].id) || "atlanta";
  const preCity = L.find(l => l.id === preselect) || L[0];
  const preEnabled = Boolean(preCity?.reservations_enabled);

  return `
<section class="locpage">
  <div class="locpage-head">
    <div>
      <div class="eyebrow" style="margin-bottom:24px;">The List</div>
      <h1>Reserve<br>the <em>house.</em></h1>
    </div>
  </div>

  <!-- Booking type selector -->
  <div style="padding:0 0 40px;">
    <div class="eyebrow" style="margin-bottom:20px;">Step 01 · Booking type</div>
    <div class="res-type-btns" id="resTypeBtns">
      <button class="res-type-btn on" data-type-btn="table">Table reservation</button>
      <button class="res-type-btn" data-type-btn="private">Private event</button>
      <button class="res-type-btn" data-type-btn="buyout">Full buyout</button>
    </div>
    <input type="hidden" id="resTypeVal" value="table">
  </div>

  <div class="locpage-body">
    <div class="res-cols">

      <!-- LEFT: City -->
      <div>
        <div class="eyebrow" style="margin-bottom:20px;">Step 02 · City</div>
        <div style="display:flex;flex-direction:column;gap:0;">
          ${L.map(l => `
            <label style="display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;padding:20px 0;border-bottom:1px solid var(--line-soft);cursor:pointer;">
              <input type="radio" name="city" value="${l.id}" data-res-enabled="${l.reservations_enabled ? '1' : '0'}" ${l.id===preselect?'checked':''} style="accent-color:oklch(0.78 0.13 75);width:18px;height:18px;">
              <span style="font-family:var(--display);font-size:32px;letter-spacing:0.02em;">${l.city}</span>
              <span class="mono" style="font-size:10px;letter-spacing:0.2em;color:var(--bone-muted);text-transform:uppercase;">${l.status === 'open' ? 'Open' : l.status === 'soon' ? 'Waitlist' : 'Opens 4 PM'}</span>
            </label>
          `).join("")}
        </div>
      </div>

      <!-- RIGHT: dynamic panel -->
      <div id="reserveRight">

        <!-- FORM shown when reservations_enabled = true -->
        <div id="reserveForm" ${preEnabled ? '' : 'hidden'}>
          <div class="eyebrow" style="margin-bottom:20px;">Step 03 · Guest Info</div>
          <div class="res-input-grid">
            <div>
              <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">First name</label>
              <input type="text" name="res_first" autocomplete="given-name" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
            </div>
            <div>
              <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">Last name</label>
              <input type="text" name="res_last" autocomplete="family-name" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
            </div>
            <div>
              <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">Phone</label>
              <input type="tel" name="res_phone" autocomplete="tel" placeholder="+1 (404) 555-0000" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
            </div>
            <div>
              <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">Email</label>
              <input type="email" name="res_email" autocomplete="email" placeholder="you@email.com" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
            </div>
          </div>
          <div style="margin-bottom:32px;">
            <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;display:block;">Occasion / notes <span style="opacity:0.5;">(optional)</span></label>
            <textarea name="res_notes" placeholder="Big game? Birthday? Tell us." rows="2" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;resize:vertical;"></textarea>
          </div>

          <!-- Private event / buyout extra fields -->
          <div id="reservePrivateFields" style="display:none;margin-bottom:32px;">
            <div class="eyebrow" style="margin-bottom:20px;">Event details</div>
            <div class="res-input-grid" style="margin-bottom:16px;">
              <div>
                <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;display:block;">Company / Event name</label>
                <input type="text" name="res_event_name" placeholder="ACME Corp. Holiday Party" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
              </div>
              <div>
                <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;display:block;">Event type</label>
                <select name="res_event_type" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
                  <option value="">Select type…</option>
                  <option>Corporate / Work function</option>
                  <option>Birthday celebration</option>
                  <option>Wedding / Engagement</option>
                  <option>Holiday party</option>
                  <option>Sports watch party</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div class="res-input-grid" style="margin-bottom:16px;">
              <div>
                <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;display:block;">Estimated guests</label>
                <input type="number" name="res_event_guests" min="10" placeholder="e.g. 75" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
              </div>
              <div>
                <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;display:block;">Estimated budget</label>
                <select name="res_budget" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
                  <option value="">Select range…</option>
                  <option>Under $5,000</option>
                  <option>$5,000 – $10,000</option>
                  <option>$10,000 – $25,000</option>
                  <option>$25,000 – $50,000</option>
                  <option>$50,000+</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom:0;">
              <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;display:block;">Preferred room / space</label>
              <select name="res_room" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
                <option value="">No preference</option>
                <option>Main floor</option>
                <option>Gold Room (VIP)</option>
                <option>Mezzanine</option>
                <option>Full venue buyout</option>
              </select>
            </div>
          </div>

          <div class="eyebrow" style="margin-bottom:20px;">Step 04 · Night</div>
          <div class="res-input-grid">
            <div>
              <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">Date</label>
              <input type="date" name="res_date" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
            </div>
            <div>
              <label class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">Time</label>
              <input type="time" name="res_time" value="21:00" style="width:100%;margin-top:8px;background:var(--ink-2);border:1px solid var(--line);color:var(--bone);padding:14px;font:inherit;">
            </div>
          </div>

          <div id="reserveGuestsSection">
          <div class="eyebrow" style="margin-bottom:20px;">Step 05 · Guests</div>
          <div class="res-guest-btns">
            ${[2,3,4,5,6,7,8,"8+"].map(n => `<button type="button" data-guest-btn="${n}" style="flex:1;min-width:60px;padding:16px 0;border:1px solid var(--line);background:transparent;color:var(--bone);font-family:var(--display);font-size:20px;cursor:pointer;transition:background 200ms,color 200ms;">${n}</button>`).join("")}
          </div>
          <input type="hidden" name="res_guests" value="">
          </div>

          <button type="button" class="cta" data-reserve-submit id="reserveSubmitBtn" style="width:100%;padding:20px;font-size:13px;">Hold my table →</button>
          <p class="mono" style="font-size:10px;letter-spacing:0.2em;color:var(--bone-muted);margin-top:16px;text-transform:uppercase;text-align:center;">Or talk to the Maître D' — bottom right.</p>
        </div>

        <!-- OFF message shown when reservations_enabled = false -->
        <div id="reserveOff" style="${preEnabled ? 'display:none' : 'display:flex'};flex-direction:column;justify-content:center;min-height:360px;gap:20px;">
          <div style="font-family:var(--display);font-size:clamp(36px,5vw,52px);letter-spacing:0.02em;line-height:1.05;">Walk right<br>in.</div>
          <p style="color:var(--bone-dim);max-width:360px;line-height:1.75;">We're not accepting reservation requests at this location right now — it's first come, first served. Show up and the house is yours.</p>
          <p id="reserveOffPhone" class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;" ${(!preEnabled && preCity?.phone) ? '' : 'hidden'}>Questions? Call <a href="tel:${preCity?.phone||''}" style="color:var(--bone);">${preCity?.phone||''}</a></p>
        </div>

        <!-- SUCCESS state shown after submit -->
        <div id="reserveSuccess" style="display:none;flex-direction:column;justify-content:center;min-height:360px;gap:20px;">
          <div class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">You're on the list.</div>
          <div style="font-family:var(--display);font-size:clamp(36px,5vw,52px);letter-spacing:0.02em;line-height:1.05;">We'll be<br>in touch.</div>
          <p style="color:var(--bone-dim);max-width:360px;line-height:1.75;">Our manager will call <strong data-success-name style="color:var(--bone);"></strong> at <strong data-success-phone style="color:var(--bone);"></strong> within the hour to confirm your table.</p>
          <p style="color:var(--bone-dim);max-width:360px;line-height:1.75;">A confirmation is on its way to <strong data-success-email style="color:var(--bone);"></strong>.</p>
          <p class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">Reach us directly: <span data-success-venue-phone style="color:var(--bone);"></span></p>
        </div>

      </div>
    </div>
  </div>
</section>
${renderFooter()}
  `;
}

/* ─────── CONTACT ─────── */
function renderContact() {
  const L = publicLocations();
  const C = window.CLVCH.home.contact || {};
  const cg = C.general   || "info@clvchusa.com";
  const ce = C.events    || "info@clvchusa.com";
  const cf = C.franchise || "info@clvchusa.com";
  const ig = C.instagram || "clvch.usa";
  const fb = C.facebook  || "clvchusa";
  return `
<section class="locpage">
  <div class="locpage-head">
    <div>
      <div class="eyebrow" style="margin-bottom:24px;">Find us</div>
      <h1>Contact<em>.</em></h1>
    </div>
  </div>

  <div class="contact-grid">
    ${L.map(l => `
      <div class="contact-card">
        <div class="contact-card-img"><img src="${l.hero}" alt="${h(l.city)}"></div>
        <div class="contact-card-body">
          <div class="eyebrow" style="margin-bottom:12px;">${h(l.state)} · ${l.status === 'open' ? 'Open now' : l.status === 'prep' ? 'Opens today' : 'Opening 2026'}</div>
          <h3>${h(l.city)}</h3>
          <dl class="kv" style="margin-top:20px;">
            ${l.address ? `<div><dt>Address</dt><dd>${h(l.address)}</dd></div>` : ''}
            ${l.phone ? `<div><dt>Phone</dt><dd><a href="tel:${h(l.phone)}" style="color:var(--bone);">${h(l.phone)}</a></dd></div>` : ''}
            ${l.hours ? `<div><dt>Hours</dt><dd>${h(l.hours)}</dd></div>` : ''}
            ${l.tonight ? `<div><dt>Tonight</dt><dd>${h(l.tonight)}</dd></div>` : ''}
          </dl>
          <div class="actions" style="margin-top:28px;">
            <a href="#/locations/${l.id}" data-link>Step Inside →</a>
            <a href="#/reserve?city=${l.id}" data-link>Reserve</a>
          </div>
        </div>
      </div>
    `).join('')}
    ${L.length === 0 ? `<p class="mono" style="font-size:11px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">No locations yet — check back soon.</p>` : ''}
  </div>

  <div class="contact-general">
    <div class="eyebrow" style="margin-bottom:24px;">General enquiries</div>
    <div class="contact-general-grid">
      <div>
        <h4>Email us</h4>
        <ul>
          <li><a href="mailto:${cg}">${cg}</a> <span>— General</span></li>
          <li><a href="mailto:${ce}">${ce}</a> <span>— Private events &amp; buyouts</span></li>
          <li><a href="mailto:${cf}">${cf}</a> <span>— Franchise &amp; partnerships</span></li>
        </ul>
      </div>
      <div>
        <h4>Social</h4>
        <ul>
          <li><a href="https://instagram.com/${ig}" target="_blank" rel="noopener">@${ig}</a> <span>— Instagram</span></li>
          <li><a href="https://facebook.com/${fb}" target="_blank" rel="noopener">facebook.com/${fb}</a> <span>— Facebook</span></li>
        </ul>
        <h4 style="margin-top:32px;">Private events</h4>
        <p style="color:var(--bone-dim);font-size:14px;line-height:1.7;">For buyouts, corporate events, and large parties, write to <a href="mailto:${ce}" style="color:var(--bone);">${ce}</a> or use the <a href="#/reserve" data-link style="color:var(--bone);">reservation form</a>.</p>
      </div>
    </div>
  </div>
</section>
${renderFooter()}
  `;
}

/* ─────── MENU ─────── */

function renderMenuItems(items) {
  return (items || []).map(item => `
    <div class="menu-item">
      <div class="menu-item-main">
        <div class="menu-item-name">${h(item.name)}${item.tag ? ` <span class="menu-tag">${h(item.tag)}</span>` : ''}</div>
        <div class="menu-item-desc">${h(item.desc)}</div>
      </div>
      <div class="menu-item-price">${h(item.price)}</div>
    </div>
  `).join('');
}

function renderMenu() {
  const M = window.CLVCH.menu;
  const menuPdf = window.CLVCH.home.menuPdf || "";
  return `
<section class="menu-page">
  <div class="menu-page-head">
    <div>
      <div class="eyebrow" style="margin-bottom:24px;">The Menu</div>
      <h1>Bites · Beats<br><em>Booze.</em></h1>
      <p style="color:var(--bone-dim);max-width:480px;line-height:1.75;margin-top:16px;">Modern American kitchen with Southern roots. Bar program built like a kitchen. Brunch on weekends, dinner every night.</p>
    </div>
    ${menuPdf ? `
    <a href="${menuPdf}" target="_blank" rel="noopener" class="bigcta" style="align-self:flex-end;">
      <div>
        <div class="t">Full menu</div>
        <div class="s">→ Download PDF</div>
      </div>
    </a>` : ''}
  </div>

  <div class="menu-tab-row">
    <button class="menu-tab-btn on" data-menu-tab="coffee">Coffee</button>
    <button class="menu-tab-btn" data-menu-tab="brunch">Brunch</button>
    <button class="menu-tab-btn" data-menu-tab="kitchen">Kitchen</button>
    <button class="menu-tab-btn" data-menu-tab="bar">Bar</button>
  </div>

  <div data-menu-panel="coffee" class="menu-panel">
    ${(window.CLVCH.menu.coffee && window.CLVCH.menu.coffee.length) ? `
      <div class="menu-panel-sub">Specialty coffee · All day</div>
      <div class="menu-items">${renderMenuItems(window.CLVCH.menu.coffee)}</div>
    ` : `
      <div class="menu-coming-soon">
        <div class="menu-coming-soon-inner">
          <div class="eyebrow" style="margin-bottom:20px;">Coming Soon</div>
          <h2>Our coffee program<br>is being <em>perfected.</em></h2>
          <p>A curated selection of specialty coffee and seasonal drinks — launching soon. Watch this space.</p>
        </div>
      </div>
    `}
  </div>

  <div data-menu-panel="brunch" class="menu-panel" style="display:none">
    <div class="menu-panel-sub">Breakfast 8 AM – 11 AM · All-day brunch menu available from 11 AM</div>
    <div class="menu-items">${renderMenuItems(M.brunch)}</div>
  </div>

  <div data-menu-panel="kitchen" class="menu-panel" style="display:none">
    <div class="menu-panel-sub">Available daily from open · Kitchen open until 1 AM Fri–Sat</div>
    <div class="menu-items">${renderMenuItems(M.kitchen)}</div>
  </div>

  <div data-menu-panel="bar" class="menu-panel" style="display:none">
    <div class="menu-panel-sub">Full bar open daily · Signature cocktails · Wine · Beer · Spirits</div>
    <div class="menu-items">${renderMenuItems(M.bar)}</div>
  </div>

  <div class="menu-note">
    <p class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">Menu items and prices subject to change · Please inform your server of any allergies · Consuming raw or undercooked foods may increase your risk of foodborne illness</p>
    <a href="#/reserve" data-link class="cta" style="display:inline-block;padding:16px 32px;margin-top:32px;font-size:13px;">Reserve a table →</a>
  </div>
</section>
${renderFooter()}
  `;
}

/* ─────── PRIVACY POLICY ─────── */
function renderPrivacy() {
  return `
<div class="static-page">
  <div class="static-page-head">
    <div class="eyebrow" style="margin-bottom:20px;">Legal</div>
    <h1>Privacy<br><em>Policy.</em></h1>
    <p class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;margin-top:16px;">Last updated: January 1, 2026</p>
  </div>
  <div class="static-page-body">
    <h2>Who we are</h2>
    <p>CLVCH Hospitality Group ("CLVCH", "we", "our", or "us") operates CLVCH restaurants, bars, and nightclubs across the United States, as well as this website (<strong>clvchusa.com</strong>). Our principal place of business is in Atlanta, Georgia. This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit our website or engage with our services.</p>

    <h2>Information we collect</h2>
    <p><strong>Information you provide directly:</strong> When you join our city-specific email list, make a reservation inquiry, or contact us, we collect your name, email address, phone number, and any notes you include. This information is used solely to fulfill your request and to send you CLVCH updates for the city you opted into.</p>
    <p><strong>Automatically collected data:</strong> We collect standard server log data (IP address, browser type, pages visited, referring URL) and use cookies to remember your preferences, such as your city selection and age verification status. We do not sell this data to third parties.</p>
    <p><strong>Payment information:</strong> CLVCH does not collect or store payment card information on this website. All deposits or payments are processed through PCI-compliant third-party providers.</p>

    <h2>How we use your information</h2>
    <ul>
      <li>To process reservation requests and respond to enquiries</li>
      <li>To send city-scoped event announcements, offers, and news (only if you have opted in)</li>
      <li>To improve our website and service quality</li>
      <li>To comply with legal obligations under applicable US and Georgia state law</li>
    </ul>

    <h2>Email communications</h2>
    <p>If you join our list, you will receive emails relevant to your chosen CLVCH city — new openings, residencies, exclusive access, and gameday tables. You can unsubscribe at any time by clicking the unsubscribe link in any email or by writing to <a href="mailto:info@clvchusa.com">info@clvchusa.com</a>. We do not send marketing across cities without your explicit consent.</p>

    <h2>Cookies</h2>
    <p>We use session cookies and localStorage to store your preferences (city selection, age confirmation, email capture status). These are stored only in your browser and are not transmitted to advertising networks. You can clear them at any time through your browser settings.</p>

    <h2>Third-party services</h2>
    <p>Our website may link to third-party services (Instagram, Facebook, Google Fonts). These services have their own privacy policies and are not covered by this document. We are not responsible for their data practices.</p>

    <h2>Data retention</h2>
    <p>Email addresses collected via our website are retained for as long as you remain subscribed. Reservation inquiry data is retained for up to 90 days. You may request deletion of your data at any time by contacting <a href="mailto:info@clvchusa.com">info@clvchusa.com</a>.</p>

    <h2>Your rights</h2>
    <p>Depending on your jurisdiction, you may have the right to access, correct, or delete personal information we hold about you. Georgia residents and California residents (under CCPA) may submit requests to <a href="mailto:info@clvchusa.com">info@clvchusa.com</a>. We will respond within 30 days.</p>

    <h2>Children's privacy</h2>
    <p>CLVCH is an alcohol-serving establishment. Our website is not directed at individuals under 21 years of age, and we do not knowingly collect personal information from minors. If you believe a minor has provided us information, contact us immediately.</p>

    <h2>Changes to this policy</h2>
    <p>We may update this Privacy Policy from time to time. We will post the updated policy on this page with a revised date. Continued use of our website after changes constitutes acceptance of the updated policy.</p>

    <h2>Contact</h2>
    <p>Privacy enquiries: <a href="mailto:info@clvchusa.com">info@clvchusa.com</a> · CLVCH Hospitality Group · Atlanta, Georgia</p>
  </div>
</div>
${renderFooter()}
  `;
}

/* ─────── TERMS OF SERVICE ─────── */
function renderTerms() {
  return `
<div class="static-page">
  <div class="static-page-head">
    <div class="eyebrow" style="margin-bottom:20px;">Legal</div>
    <h1>Terms of<br><em>Service.</em></h1>
    <p class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;margin-top:16px;">Last updated: January 1, 2026</p>
  </div>
  <div class="static-page-body">
    <h2>Acceptance of terms</h2>
    <p>By accessing or using the CLVCH website (clvchusa.com) or any CLVCH venue, you agree to these Terms of Service and our <a href="#/privacy" data-link>Privacy Policy</a>. If you do not agree, please do not use our services.</p>

    <h2>Age requirement and alcohol notice</h2>
    <p><strong>You must be 21 years of age or older to access this website and to enter any CLVCH venue.</strong> CLVCH holds active liquor licenses and serves alcohol at all locations. By accessing this site, you confirm you are of legal drinking age in your jurisdiction. We reserve the right to ask for valid photo ID at any time and to refuse service to anyone who cannot provide valid proof of age.</p>
    <p>CLVCH promotes responsible consumption. Please drink responsibly. Do not drink and drive. Dial 911 in an emergency. For substance abuse resources, contact SAMHSA at 1-800-662-4357.</p>

    <h2>Reservations and cancellations</h2>
    <p>Reservation requests submitted through our website are enquiries only — they are not confirmed until you receive written confirmation from CLVCH staff. We reserve the right to cancel or modify reservations due to capacity constraints, private event bookings, or operational requirements.</p>
    <p>No-shows and same-day cancellations may result in a fee where a credit card has been provided. Private event and buyout bookings are subject to separate event contracts which will specify deposits, cancellation windows, and minimum spend requirements.</p>

    <h2>Conduct on premises</h2>
    <p>All CLVCH venues enforce a dress code and conduct policy. We reserve the right to refuse entry or remove any guest at our sole discretion for disorderly conduct, intoxication beyond a manageable level, or violation of our dress code. No refunds are issued for removal due to conduct violations.</p>

    <h2>Intellectual property</h2>
    <p>All content on this website — including text, photography, logos, design, and branding — is owned by CLVCH Hospitality Group or licensed to it. You may not copy, reproduce, distribute, or create derivative works without written permission.</p>

    <h2>Disclaimer of warranties</h2>
    <p>This website is provided "as is" without any warranties of any kind, express or implied. CLVCH does not warrant that the website will be uninterrupted, error-free, or free of viruses. Menu items, prices, and hours are subject to change without notice.</p>

    <h2>Limitation of liability</h2>
    <p>To the maximum extent permitted by law, CLVCH Hospitality Group shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this website or any CLVCH venue, including but not limited to loss of property, personal injury, or economic loss.</p>

    <h2>Governing law</h2>
    <p>These Terms are governed by the laws of the State of Georgia, United States, without regard to its conflict of law provisions. Disputes shall be resolved in the state or federal courts located in Fulton County, Georgia.</p>

    <h2>Contact</h2>
    <p>Legal enquiries: <a href="mailto:info@clvchusa.com">info@clvchusa.com</a> · CLVCH Hospitality Group · Atlanta, Georgia</p>
  </div>
</div>
${renderFooter()}
  `;
}

/* ─────── STORIES ─────── */
function renderStories() {
  const articles = (window.CLVCH.articles || [])
    .filter(a => a.published)
    .sort((a, b) => b.date.localeCompare(a.date));

  return `
<section class="stories-page">
  <div class="stories-hero">
    <div class="eyebrow" style="margin-bottom:16px;">Stories</div>
    <h1>The house,<br>in <em>writing.</em></h1>
  </div>
  ${articles.length === 0
    ? `<p class="mono" style="font-size:11px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;padding:80px 0;">No stories yet — check back soon.</p>`
    : `<div class="stories-grid">
        ${articles.map(a => `
          <a class="story-card" href="#/stories/${a.id}" data-link>
            <div class="story-card-cover">
              ${a.cover
                ? `<img src="${a.cover}" alt="${h(a.title)}" loading="lazy">`
                : '<div style="background:var(--ink-3);width:100%;height:100%;"></div>'}
            </div>
            <div class="story-card-body">
              <div class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;margin-bottom:12px;">${window.CLVCH.formatDate(a.date)}</div>
              <div style="font-family:var(--display);font-size:clamp(20px,2.5vw,28px);letter-spacing:0.02em;line-height:1.15;margin-bottom:12px;">${h(a.title)}</div>
              ${a.excerpt ? `<p style="color:var(--bone-dim);font-size:14px;line-height:1.7;margin-bottom:20px;">${h(a.excerpt)}</p>` : ''}
              <span class="mono" style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--bone);">Read the story →</span>
            </div>
          </a>
        `).join('')}
      </div>`
  }
</section>
${renderFooter()}
  `;
}

function renderStory(slug) {
  const article = (window.CLVCH.articles || []).find(a => a.id === slug && a.published);
  const back = `<a href="#/stories" data-link class="mono" style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:var(--bone-muted);">← Stories</a>`;

  if (!article) {
    return `
<div class="story-page">
  <div style="padding-top:40px;margin-bottom:48px;">${back}</div>
  <p style="color:var(--bone-muted);">Story not found.</p>
</div>
${renderFooter()}`;
  }

  const tagLine = article.tags && article.tags.length
    ? ' &nbsp;·&nbsp; ' + article.tags.map(t => '#' + t).join(' ')
    : '';

  return `
<div class="story-page">
  <div style="padding-top:40px;margin-bottom:48px;">${back}</div>
  ${article.cover ? `<div class="story-cover"><img src="${article.cover}" alt="${h(article.title)}"></div>` : ''}
  <div class="story-content">
    <div class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;margin-bottom:16px;">${window.CLVCH.formatDate(article.date)}${tagLine}</div>
    <h1 style="font-family:var(--display);font-size:clamp(32px,5vw,56px);letter-spacing:0.02em;line-height:1.05;margin-bottom:40px;">${h(article.title)}</h1>
    <div class="story-prose">${window.CLVCH.markdownToHtml(article.body)}</div>
  </div>
</div>
${renderFooter()}
  `;
}

/* ─────── FOOTER ─────── */
function renderFooter() {
  return `
<footer>
  <div class="foot-inner">
    <div class="foot-brand">
      <h3>CLVCH<em>.</em></h3>
      <p>A hospitality house built for the after. Modern American kitchen, nightlife floor, bar program worth the trip.</p>
    </div>
    <div class="foot-col">
      <h5>Cities</h5>
      <ul>
        ${publicLocations().map(l => `<li><a href="#/locations/${l.id}" data-link>${l.city}${l.status === 'soon' ? ` (${l.opened})` : ''}</a></li>`).join('')}
      </ul>
    </div>
    <div class="foot-col">
      <h5>The House</h5>
      <ul>
        <li><a href="#/" data-link>Experience</a></li>
        <li><a href="#/menu" data-link>Menu</a></li>
        <li><a href="#/stories" data-link>Stories</a></li>
      </ul>
    </div>
    <div class="foot-col">
      <h5>Contact</h5>
      <ul>
        <li><a href="#/contact" data-link>All locations</a></li>
        <li><a href="mailto:info@clvchusa.com">info@clvchusa.com</a></li>
        <li><a href="mailto:info@clvchusa.com">Private Events</a></li>
      </ul>
    </div>
  </div>
  <div class="foot-base">
    <span>© 2026 CLVCH Hospitality Group · <a href="#/privacy" data-link style="color:inherit;">Privacy</a> · <a href="#/terms" data-link style="color:inherit;">Terms</a></span>
    <span>${publicLocations().map(l => l.city).join(' · ')}</span>
    <span>Bites · Beats · Booze · <a href="#/admin" data-link style="color:inherit;opacity:0.7;">Staff</a></span>
  </div>
</footer>
  `;
}

/* ─────── ADMIN STORIES ─────── */
function renderAdminStories(slug) {
  const role = getAdminRole();
  if (!role) return renderAdminGate("stories");

  const isSuper = role === "super";
  if (!isSuper) {
    return `
<section class="admin admin--blocked">
  <div class="admin-gate-card">
    <div class="eyebrow" style="margin-bottom:14px;color:#ff8b7e;">No access</div>
    <h1>Super only<em>.</em></h1>
    <p class="admin-gate-lede">Stories editing is reserved for super admins.</p>
    <div style="display:flex;gap:12px;margin-top:32px;flex-wrap:wrap;">
      <a class="admin-btn admin-btn--primary" href="#/admin" data-link>← Admin home</a>
      <button class="admin-btn admin-btn--ghost" data-admin-signout>Sign out</button>
    </div>
  </div>
</section>`;
  }

  const esc = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/"/g,"&quot;");
  const articles = window.CLVCH.articles || [];
  const L = window.CLVCH.locations;
  const isEditor = !!slug;
  const isNew = slug === "new";
  const article = isNew ? null : articles.find(a => a.id === slug);
  const today = new Date().toISOString().slice(0, 10);

  const tabs = `
  <div class="admin-tabs">
    <a href="#/admin" data-link>Admin home</a>
    <a href="#/admin/home" data-link>Home page</a>
    <a href="#/admin/stories" data-link class="${!isEditor ? 'on' : ''}">Stories</a>
    <a href="#/admin/menu" data-link>Menu</a>
    ${L.map(l => `<a href="#/admin/${l.id}" data-link>${h(l.city)}</a>`).join('')}
  </div>`;

  const editorHtml = (!isNew && !article) ? `
    <p style="color:var(--bone-muted);padding:40px 0;">Article not found. <a href="#/admin/stories" data-link style="color:var(--bone);">← Back to Stories</a></p>
  ` : `
    <form class="admin-content" data-article-form>
      <div class="admin-form-grid admin-form-grid--2" style="margin-bottom:24px;">
        <label>Title <span style="color:#ff8b7e;">*</span>
          <input type="text" name="title" value="${esc(article?.title || '')}" required placeholder="Game Day at CLVCH Atlanta" />
        </label>
        <label>Slug (URL) <span style="color:#ff8b7e;">*</span>
          <input type="text" name="id" value="${esc(article?.id || '')}" ${!isNew ? 'readonly style="opacity:0.55;"' : ''} required placeholder="game-day-at-clvch-atlanta" />
        </label>
      </div>
      <div class="admin-form-grid admin-form-grid--1" style="margin-bottom:24px;">
        <label>Excerpt <small style="opacity:0.6;">(1–2 sentences shown on the listing card)</small>
          <textarea name="excerpt" rows="2" placeholder="Every Sunday, we turn the main floor into the best seat in the house.">${esc(article?.excerpt || '')}</textarea>
        </label>
      </div>
      <div class="admin-form-grid admin-form-grid--3" style="margin-bottom:24px;">
        <label>Cover image URL
          <input type="text" name="cover" value="${esc(article?.cover || '')}" placeholder="../assets/img-sports-1.jpg" />
        </label>
        <label>City
          <select name="cityId">
            <option value="" ${!article?.cityId ? 'selected' : ''}>Brand-wide</option>
            ${L.map(l => `<option value="${l.id}" ${article?.cityId === l.id ? 'selected' : ''}>${h(l.city)}</option>`).join('')}
          </select>
        </label>
        <label>Date
          <input type="date" name="date" value="${esc(article?.date || today)}" />
        </label>
      </div>
      <div class="admin-form-grid admin-form-grid--2" style="margin-bottom:24px;">
        <label>Tags <small style="opacity:0.6;">(comma-separated, e.g. gameday, atlanta, nfl)</small>
          <input type="text" name="tags" value="${esc((article?.tags || []).join(', '))}" placeholder="gameday, atlanta, nfl" />
        </label>
        <label style="display:flex;align-items:center;gap:12px;padding-top:28px;">
          <input type="checkbox" name="published" ${article?.published ? 'checked' : ''} style="width:18px;height:18px;accent-color:oklch(0.78 0.13 75);">
          <span>Published <small style="opacity:0.6;">(unchecked = draft)</small></span>
        </label>
      </div>

      <div style="margin-bottom:0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">Body · Markdown <span style="color:#ff8b7e;">*</span></span>
        <button type="button" data-md-upload class="admin-btn admin-btn--ghost" style="font-size:11px;padding:6px 14px;">Upload .md file</button>
      </div>
      <div class="story-tab-row" style="margin-top:8px;">
        <button type="button" class="story-tab-btn on" data-tab="write">Write</button>
        <button type="button" class="story-tab-btn" data-tab="preview">Preview</button>
      </div>
      <textarea name="body" rows="22" style="width:100%;background:var(--ink-2);border:1px solid var(--line);border-top:none;color:var(--bone);padding:16px;font:13px/1.6 var(--mono);resize:vertical;" placeholder="## Heading&#10;&#10;Paragraph with **bold** and *italic*.&#10;&#10;&gt; Blockquote">${esc(article?.body || '')}</textarea>
      <div class="story-preview" style="display:none;"></div>

      <div class="admin-form-foot" style="margin-top:28px;">
        <div class="admin-form-foot-msg" data-form-msg></div>
        <div class="admin-form-foot-actions">
          <a href="#/admin/stories" data-link class="admin-btn admin-btn--ghost">Cancel</a>
          <button type="submit" class="admin-btn admin-btn--primary">Save article</button>
        </div>
      </div>
    </form>
  `;

  const listingHtml = `
    <div class="admin-content">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px;">
        <h2 style="font-size:18px;">All stories <small style="opacity:0.5;">· ${articles.length}</small></h2>
        <button class="admin-btn admin-btn--primary" data-stories-new>+ New story</button>
      </div>
      ${articles.length === 0
        ? `<p class="mono" style="font-size:11px;letter-spacing:0.2em;color:var(--bone-muted);text-transform:uppercase;">No stories yet. Click "New story" to get started.</p>`
        : `<div class="admin-citytable">
            <div class="admin-citytable-row admin-citytable-row--head">
              <span>Title</span>
              <span>Date</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            ${[...articles].sort((a,b) => b.date.localeCompare(a.date)).map(a => `
              <div class="admin-citytable-row">
                <span>${h(a.title)}</span>
                <span class="mono" style="font-size:11px;">${a.date}</span>
                <span><span class="admin-statuspill admin-statuspill--${a.published ? 'open' : 'off'}">${a.published ? 'Published' : 'Draft'}</span></span>
                <span style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button class="admin-btn admin-btn--ghost" data-stories-edit="${a.id}" style="font-size:11px;padding:6px 14px;">Edit</button>
                  <button class="admin-btn admin-btn--ghost" data-stories-delete="${a.id}" style="font-size:11px;padding:6px 14px;color:#ff8b7e;border-color:#ff8b7e;">Delete</button>
                </span>
              </div>
            `).join('')}
          </div>`
      }
    </div>
  `;

  return `
<section class="admin" data-stories-admin="">
  <div class="admin-head">
    <div>
      <a href="#/admin" data-link class="admin-rolebar-link" style="display:inline-flex;align-items:center;gap:6px;margin-bottom:20px;font-size:12px;">← Admin home</a>
      <div class="eyebrow" style="margin-bottom:12px;">Brand · Stories</div>
      <h1>${isEditor ? (isNew ? 'New story<em>.</em>' : 'Edit<em>.</em>') : 'Stories<em>.</em>'}</h1>
      <p style="color:var(--bone-muted);max-width:60ch;font-family:var(--body);font-size:14px;line-height:1.55;">
        ${isEditor
          ? 'Write in Markdown. Paste directly or upload a <code>.md</code> file, then toggle Preview.'
          : 'Write and publish articles for the Stories section. Paste Markdown or upload a <code>.md</code> file.'}
      </p>
    </div>
    <div class="admin-rolebar">
      <div class="admin-rolechip">
        <span class="admin-rolechip-dot"></span>
        <div><small>Signed in as</small><b>Super admin</b></div>
      </div>
      <a href="#/" data-link class="admin-rolebar-link">← View site</a>
      <button class="admin-rolebar-link admin-rolebar-link--danger" data-admin-signout>Sign out</button>
    </div>
  </div>

  ${tabs}

  ${isEditor ? editorHtml : listingHtml}
</section>
  `;
}

/* ─────── ADMIN MENU ─────── */
function renderAdminMenu() {
  const role = getAdminRole();
  if (!role) return renderAdminGate("menu");

  const isSuper = role === "super";
  if (!isSuper) {
    return `
<section class="admin admin--blocked">
  <div class="admin-gate-card">
    <div class="eyebrow" style="margin-bottom:14px;color:#ff8b7e;">No access</div>
    <h1>Super only<em>.</em></h1>
    <p class="admin-gate-lede">Menu editing is reserved for super admins.</p>
    <div style="display:flex;gap:12px;margin-top:32px;flex-wrap:wrap;">
      <a class="admin-btn admin-btn--primary" href="#/admin" data-link>← Admin home</a>
      <button class="admin-btn admin-btn--ghost" data-admin-signout>Sign out</button>
    </div>
  </div>
</section>`;
  }

  const esc = (s) => String(s ?? "").replace(/&/g,"&amp;").replace(/"/g,"&quot;");
  const M = window.CLVCH.menu;
  const L = window.CLVCH.locations;

  const tabs = `
  <div class="admin-tabs">
    <a href="#/admin" data-link>Admin home</a>
    <a href="#/admin/home" data-link>Home page</a>
    <a href="#/admin/stories" data-link>Stories</a>
    <a href="#/admin/menu" data-link class="on">Menu</a>
    ${L.map(l => `<a href="#/admin/${l.id}" data-link>${h(l.city)}</a>`).join('')}
  </div>`;

  const mkItemRow = (item, i) => `
    <div class="menu-admin-row" data-item-row="${i}">
      <input type="text" class="menu-admin-input" data-field="name" value="${esc(item.name)}" placeholder="Item name" />
      <input type="text" class="menu-admin-input menu-admin-input--desc" data-field="desc" value="${esc(item.desc)}" placeholder="Description" />
      <input type="text" class="menu-admin-input menu-admin-input--price" data-field="price" value="${esc(item.price)}" placeholder="$00" />
      <input type="text" class="menu-admin-input menu-admin-input--tag" data-field="tag" value="${esc(item.tag)}" placeholder="Tag" />
      <button class="menu-admin-del" data-item-del title="Delete item">×</button>
    </div>`;

  const mkSection = (key, num, label, subtitle) => `
    <div class="menu-admin-section" data-section="${key}">
      <div class="menu-admin-section-head">
        <span class="menu-section-num">${num}</span>
        <div>
          <div style="font-family:var(--display);font-size:28px;letter-spacing:0.02em;">${label}</div>
          <div class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;margin-top:4px;">${subtitle}</div>
        </div>
      </div>
      <div class="menu-admin-col-head">
        <span>Name</span><span>Description</span><span>Price</span><span>Tag</span><span></span>
      </div>
      <div class="menu-admin-items" id="menuSection_${key}">
        ${(M[key] || []).map((item, i) => mkItemRow(item, i)).join('')}
      </div>
      <button class="admin-btn admin-btn--ghost menu-admin-additem" data-add-section="${key}" style="margin-top:12px;">+ Add item</button>
    </div>`;

  return `
<section class="admin" data-menu-admin="">
  <div class="admin-head">
    <div>
      <a href="#/admin" data-link class="admin-rolebar-link" style="display:inline-flex;align-items:center;gap:6px;margin-bottom:20px;font-size:12px;">← Admin home</a>
      <div class="eyebrow" style="margin-bottom:12px;">Brand · Menu</div>
      <h1>Edit the <em>Menu.</em></h1>
      <p style="color:var(--bone-muted);max-width:60ch;font-family:var(--body);font-size:14px;line-height:1.55;">Edit items, prices, and tags. Changes go live the moment you save.</p>
    </div>
    <div class="admin-rolebar">
      <div class="admin-rolechip">
        <span class="admin-rolechip-dot"></span>
        <div><small>Signed in as</small><b>Super admin</b></div>
      </div>
      <a href="#/" data-link class="admin-rolebar-link">← View site</a>
      <button class="admin-rolebar-link admin-rolebar-link--danger" data-admin-signout>Sign out</button>
    </div>
  </div>

  ${tabs}

  <div class="admin-content" data-menu-editor="">
    ${mkSection('coffee',  '01', 'Coffee',  'Specialty coffee program — add items when ready to go live')}
    ${mkSection('brunch',  '02', 'Brunch',  'Breakfast 8 AM – 11 AM · All-day brunch menu from 11 AM')}
    ${mkSection('kitchen', '03', 'Kitchen', 'Available daily from open · Kitchen stays open until 1 AM Fri–Sat')}
    ${mkSection('bar',     '04', 'Bar',     'Full bar open daily · Craft cocktails, wine, beer, and non-alcoholic options')}

    <div class="admin-form-foot" style="margin-top:40px;">
      <div class="admin-form-foot-msg" data-form-msg></div>
      <div class="admin-form-foot-actions">
        <button class="admin-btn admin-btn--ghost" data-menu-reset>Reset to defaults</button>
        <button class="admin-btn admin-btn--primary" data-menu-save>Save menu</button>
      </div>
    </div>
  </div>
</section>
  `;
}

/* ─────── ADMIN ───────
   /admin              → super admin (all cities, full CRUD)
   /admin/<cityId>     → city manager (scoped, content + posters only)

   Auth is mock — a localStorage flag (clvch_admin_role) gates the UI.
   "super" can do anything; "manager:<id>" is locked to that city.
   Anonymous → sign-in card. */

const ADMIN_ROLE_KEY = "clvch_admin_role";
function getAdminRole() {
  try { return localStorage.getItem(ADMIN_ROLE_KEY) || ""; } catch { return ""; }
}
function setAdminRole(r) {
  try {
    if (r) localStorage.setItem(ADMIN_ROLE_KEY, r);
    else localStorage.removeItem(ADMIN_ROLE_KEY);
  } catch {}
}

function renderAdminGate(scopeCityId) {
  const L = window.CLVCH.locations;
  return `
<section class="admin admin--gate">
  <div class="admin-gate-card">
    <div class="admin-gate-mark">CLVCH</div>
    <div class="eyebrow" style="margin-bottom:14px;">Restricted · House staff only</div>
    <h1>Sign <em>in.</em></h1>
    <p class="admin-gate-lede">Mock authentication for the prototype. Pick a role to continue — choices persist in this browser until you sign out.</p>

    <div class="admin-gate-roles">
      <button class="admin-gate-role" data-role="super">
        <div class="admin-gate-role-tag">Super</div>
        <div class="admin-gate-role-name">House admin</div>
        <div class="admin-gate-role-desc">Create, edit, disable any city. Curate posters across the brand.</div>
        <div class="admin-gate-role-go">Continue →</div>
      </button>
      ${L.map(l => `
        <button class="admin-gate-role" data-role="manager:${l.id}">
          <div class="admin-gate-role-tag">Manager</div>
          <div class="admin-gate-role-name">${l.city}</div>
          <div class="admin-gate-role-desc">Edit ${l.city}'s content, posters, and tonight info. Cannot create or delete cities.</div>
          <div class="admin-gate-role-go">Continue →</div>
        </button>
      `).join("")}
    </div>

    <a href="#/" data-link class="admin-gate-back">← Back to clvchusa.com</a>
  </div>
</section>
  `;
}

function renderAdminCityForm(l, mode) {
  // mode: "edit" | "new"
  const isNew = mode === "new";
  const id = l?.id || "";
  const v = (k, d="") => l && l[k] != null ? String(l[k]).replace(/"/g,"&quot;") : d;
  const marqueeStr = (l?.marqueeWords || []).join(", ").replace(/"/g,"&quot;");

  return `
<form class="admin-form" data-city-form="${id || '__new__'}" data-mode="${mode}">

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">01</span>
      <h3>Identity</h3>
      <p>Names and the URL slug. The slug appears in <code>#/locations/&lt;slug&gt;</code> and in <code>#/admin/&lt;slug&gt;</code>.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--3">
      <label>City name
        <input type="text" name="city" value="${v('city')}" placeholder="Miami" required ${isNew ? '' : ''} />
      </label>
      <label>State
        <input type="text" name="state" value="${v('state')}" placeholder="Florida" required />
      </label>
      <label>Slug ${isNew ? '<small>(auto from city name)</small>' : '<small>(locked)</small>'}
        <input type="text" name="id" value="${v('id')}" placeholder="miami" pattern="[a-z0-9\\-]+" ${isNew ? '' : 'readonly'} />
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">02</span>
      <h3>Status &amp; tonight</h3>
      <p>Drives the nav ticker, the home page filters, and tonight's headline on the city page.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--3">
      <label>Status
        <select name="status">
          <option value="open" ${v('status','open')==='open'?'selected':''}>Open now</option>
          <option value="prep" ${v('status')==='prep'?'selected':''}>Opens later (prep)</option>
          <option value="soon" ${v('status')==='soon'?'selected':''}>Coming soon</option>
        </select>
      </label>
      <label>Year opened
        <input type="text" name="opened" value="${v('opened')}" placeholder="2026" />
      </label>
    </div>
    <div class="admin-form-grid admin-form-grid--2">
      <label>Tonight (headline)
        <input type="text" name="tonight" value="${v('tonight')}" placeholder="Live DJ Set · Throwback Hits" />
      </label>
      <label>Tonight (time)
        <input type="text" name="tonightTime" value="${v('tonightTime')}" placeholder="10 PM – 2 AM" />
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">03</span>
      <h3>Contact &amp; logistics</h3>
      <p>Surfaces on the venue page header, the locations grid, and the map card.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--1">
      <label>Address
        <input type="text" name="address" value="${v('address')}" placeholder="1280 Peachtree St NE · Atlanta, GA 30309" />
      </label>
    </div>
    <div class="admin-form-grid admin-form-grid--3">
      <label>Phone
        <input type="text" name="phone" value="${v('phone')}" placeholder="+1 (404) 555-1234" />
      </label>
      <label>Capacity
        <input type="number" name="capacity" min="0" value="${v('capacity','0')}" />
      </label>
      <label>Hours
        <input type="text" name="hours" value="${v('hours')}" placeholder="Mon–Thu 4–12 · Fri 4–2 · Sat 12–2 · Sun 12–12" />
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">04</span>
      <h3>Hero &amp; story</h3>
      <p>Hero image fills the city page header and the home preview. Paste an image URL or upload a file.</p>
    </div>
    <div class="admin-form-hero">
      <div class="admin-form-hero-preview">
        <img data-hero-preview src="${v('hero','../assets/img-club-1.jpg')}" alt="" />
      </div>
      <div class="admin-form-hero-controls">
        <label>Hero image URL
          <input type="text" name="hero" data-hero-input value="${v('hero')}" placeholder="../assets/your-hero.jpg or https://…" />
        </label>
        <button type="button" class="admin-btn admin-btn--ghost" data-hero-upload>Upload from device</button>
      </div>
    </div>
    <div class="admin-form-grid admin-form-grid--1">
      <label>Blurb (one sentence, sets the room's tone)
        <input type="text" name="blurb" value="${v('blurb')}" placeholder="The flagship. Wall-to-wall screens by day, gold-room energy by night." />
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">05</span>
      <h3>Marquee words</h3>
      <p>The little ticker beneath the city page hero. Comma-separated. Leave empty for the house default (Bites · Beats · Booze · Late Kitchen · Private Events).</p>
    </div>
    <div class="admin-form-grid admin-form-grid--1">
      <label>Words
        <input type="text" name="marqueeWords" value="${marqueeStr}" placeholder="Peachtree, Sunday Football, Gold Room, Smash Burgers" />
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">06</span>
      <h3>Reservations</h3>
      <p>When on, guests can submit a reservation request from the reserve page. When off, the page shows a walk-in message for this location instead.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--1">
      <label style="display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;cursor:pointer;padding:18px;border:1px solid var(--line);">
        <input type="checkbox" name="reservations_enabled" ${v('reservations_enabled') === 'true' ? 'checked' : ''} style="width:18px;height:18px;accent-color:oklch(0.78 0.13 75);flex-shrink:0;">
        <span>Accept reservation requests at this location</span>
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">08</span>
      <h3>Room images</h3>
      <p>Images for each of the three rooms on this city's venue page. Comma-separated URLs — first image shows by default, additional images rotate automatically.</p>
    </div>
    ${['bites','beats','booze'].map((room, ri) => {
      const roomImgs = (l?.roomImages?.[room] || []).join(', ').replace(/"/g,'&quot;');
      const fallbacks = ['../assets/img-food-1.jpg','../assets/img-club-1.jpg','../assets/img-drink-1.jpg'];
      const roomLabel = room[0].toUpperCase() + room.slice(1);
      return `<div class="admin-form-grid admin-form-grid--1" style="margin-bottom:8px;">
        <label>${roomLabel} images (comma-separated)
          <input type="text" name="roomImages.${room}" data-room-input="${room}" value="${roomImgs}" placeholder="${fallbacks[ri]}" />
        </label>
      </div>`;
    }).join('')}
  </div>

  <div class="admin-form-foot">
    <div class="admin-form-foot-msg" data-form-msg></div>
    <div class="admin-form-foot-actions">
      <button type="button" class="admin-btn admin-btn--ghost" data-form-cancel>Cancel</button>
      <button type="submit" class="admin-btn admin-btn--primary">${isNew ? 'Create city' : 'Save changes'}</button>
    </div>
  </div>
</form>
  `;
}

function renderAdminPosterBlock(l) {
  const G = window.CLVCH.gameday;
  const g = G[l.id] || { enabled: false, items: [], instagram: "", facebook: "", caption: "" };
  return `
<div class="admin-poster-block" data-admin-city="${l.id}">
  <div class="admin-city-head">
    <div class="admin-city-title">
      <h3>Gameday posters</h3>
      <small>${(g.items || []).filter(i=>i.on).length} live · ${(g.items || []).length} total</small>
    </div>
    <label class="admin-toggle">
      <input type="checkbox" data-city-toggle="${l.id}" ${g.enabled ? 'checked' : ''} />
      <span class="admin-toggle-track"></span>
      <span>${g.enabled ? 'Section on' : 'Section off'}</span>
    </label>
  </div>

  <div class="admin-meta-form">
    <label>Instagram handle
      <input type="text" data-city-meta="${l.id}" data-field="instagram" value="${(g.instagram || '').replace(/"/g,'&quot;')}" placeholder="clvch_${l.id}" />
    </label>
    <label>Facebook handle
      <input type="text" data-city-meta="${l.id}" data-field="facebook" value="${(g.facebook || '').replace(/"/g,'&quot;')}" placeholder="clvch${l.id}" />
    </label>
    <label>Caption (tonight's story)
      <input type="text" data-city-meta="${l.id}" data-field="caption" value="${(g.caption || '').replace(/"/g,'&quot;')}" placeholder="Tonight's lineup…" />
    </label>
  </div>

  <div class="admin-grid" data-city-grid="${l.id}">
    ${(g.items || []).map(it => `
      <div class="admin-tile" data-item-id="${it.id}" data-off="${!it.on}">
        <div class="admin-tile-img"><img src="${it.src}" alt=""></div>
        <div class="admin-tile-label">${(it.label || '').replace(/</g,'&lt;')}</div>
        <div class="admin-tile-row">
          <label class="admin-toggle">
            <input type="checkbox" data-item-toggle="${l.id}:${it.id}" ${it.on ? 'checked' : ''} />
            <span class="admin-toggle-track"></span>
            <span>${it.on ? 'Live' : 'Off'}</span>
          </label>
          <button class="admin-tile-del" data-item-del="${l.id}:${it.id}">Remove</button>
        </div>
      </div>
    `).join("")}
    <button class="admin-add" data-city-add="${l.id}">
      <span class="admin-add-plus">+</span>
      <span>Upload poster</span>
    </button>
    ${(g.items || []).length === 0 ? `
      <div class="admin-empty" style="grid-column: 1 / -1;">
        No posters yet. The default CLVCH house poster shows on the site until you add one.
      </div>
    ` : ''}
  </div>
</div>
  `;
}

function renderAdminHomeBlock() {
  const H = window.CLVCH.home;
  const sm = H.hero.subModes || ["", "", ""];
  const pillars = H.pillars.items || [];
  const marquee = (H.marqueeWords || []).join(", ").replace(/"/g,"&quot;");
  const esc = (s) => String(s ?? "").replace(/"/g,"&quot;");

  return `
<form class="admin-form" data-home-form>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">01</span>
      <h3>Hero</h3>
      <p>The first thing visitors land on. Headline runs as three words. The blurb supports <code>&lt;em&gt;</code> tags for emphasis.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--2">
      <label>Chapter line
        <input type="text" name="hero.chapter" value="${esc(H.hero.chapter)}" placeholder="Chapter Ⅳ / 2026" />
      </label>
      <label>Est line
        <input type="text" name="hero.estLine" value="${esc(H.hero.estLine)}" placeholder="Est. 2022" />
      </label>
    </div>
    <div class="admin-form-hero">
      <div class="admin-form-hero-preview admin-form-hero-preview--video">
        <video data-hero-video-preview src="${esc(H.hero.videoSrc)}" muted loop playsinline autoplay></video>
      </div>
      <div class="admin-form-hero-controls">
        <label>Hero video URL <small>(local path or full URL)</small>
          <input type="text" name="hero.videoSrc" data-hero-video-input value="${esc(H.hero.videoSrc)}" placeholder="../assets/hero.mp4" />
        </label>
        <button type="button" class="admin-btn admin-btn--ghost" data-hero-video-upload>Upload from device</button>
      </div>
    </div>
    <div class="admin-form-grid admin-form-grid--3">
      <label>Headline word 1
        <input type="text" name="hero.word1" value="${esc(H.hero.word1)}" placeholder="Bites" />
      </label>
      <label>Headline word 2
        <input type="text" name="hero.word2" value="${esc(H.hero.word2)}" placeholder="Beats" />
      </label>
      <label>Headline word 3
        <input type="text" name="hero.word3" value="${esc(H.hero.word3)}" placeholder="Booze" />
      </label>
    </div>
    <div class="admin-form-grid admin-form-grid--3">
      <label>Sub-mode 1 <small>(active)</small>
        <input type="text" name="hero.sub1" value="${esc(sm[0]||'')}" placeholder="Modern American" />
      </label>
      <label>Sub-mode 2
        <input type="text" name="hero.sub2" value="${esc(sm[1]||'')}" placeholder="Sports Theatre" />
      </label>
      <label>Sub-mode 3
        <input type="text" name="hero.sub3" value="${esc(sm[2]||'')}" placeholder="Gold-Room Nightclub" />
      </label>
    </div>
    <div class="admin-form-grid admin-form-grid--1">
      <label>Blurb <small>(supports &lt;em&gt; for italic emphasis)</small>
        <input type="text" name="hero.blurb" value="${esc(H.hero.blurb)}" placeholder="Four rooms. One brand. <em>CLVCH</em>…" />
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">02</span>
      <h3>Pillars</h3>
      <p>The "Three rooms, one address" section. Headline supports <code>&lt;br&gt;</code> and <code>&lt;em&gt;</code>.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--1">
      <label>Pillars headline
        <input type="text" name="pillars.headline" value="${esc(H.pillars.headline)}" placeholder="Three rooms,<br>one <em>address.</em>" />
      </label>
      <label>Pillars intro
        <input type="text" name="pillars.intro" value="${esc(H.pillars.intro)}" />
      </label>
    </div>
  </div>

  ${pillars.map((p, i) => `
    <div class="admin-form-section">
      <div class="admin-form-section-head">
        <span class="admin-form-section-num">${String(i+3).padStart(2,'0')}</span>
        <h3>Pillar ${i+1}</h3>
        <p>${i===0?'Image renders on the left.':i===1?'Image renders on the right.':'Image renders on the left.'}</p>
      </div>
      <div class="admin-form-grid admin-form-grid--3">
        <label>Number / kicker
          <input type="text" name="pillar.${i}.num" value="${esc(p.num)}" placeholder="01 / Kitchen" />
        </label>
        <label>Title
          <input type="text" name="pillar.${i}.title" value="${esc(p.title)}" placeholder="Bites" />
        </label>
        <label>List label
          <input type="text" name="pillar.${i}.listLabel" value="${esc(p.listLabel)}" placeholder="Signatures" />
        </label>
      </div>
      <div class="admin-form-grid admin-form-grid--1">
        <label>Body copy
          <input type="text" name="pillar.${i}.copy" value="${esc(p.copy)}" />
        </label>
        <label>List items <small>(separator-rendered)</small>
          <input type="text" name="pillar.${i}.listItems" value="${esc(p.listItems)}" placeholder="Item · Item · Item" />
        </label>
      </div>
      <div class="admin-form-hero">
        <div class="admin-form-hero-preview">
          <img data-pillar-preview="${i}" src="${esc((p.images&&p.images[0])||p.image||'../assets/img-club-1.jpg')}" alt="" />
        </div>
        <div class="admin-form-hero-controls">
          <label>Images <small>(comma-separated URLs — first is shown, rest rotate automatically)</small>
            <input type="text" name="pillar.${i}.images" data-pillar-input="${i}" value="${esc((p.images||[p.image]).join(', '))}" placeholder="../assets/img-food-1.jpg, https://…" />
          </label>
          <button type="button" class="admin-btn admin-btn--ghost" data-pillar-upload="${i}">Upload &amp; append</button>
        </div>
      </div>
    </div>
  `).join("")}

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">06</span>
      <h3>Marquee</h3>
      <p>The scrolling strip below the locations switcher. Comma-separated words.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--1">
      <label>Words
        <input type="text" name="marqueeWords" value="${marquee}" placeholder="Sunday Football, Late Kitchen, Gold Room, Every Day Brunch" />
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">07</span>
      <h3>Reserve strip</h3>
      <p>Bottom CTA band. Headline supports <code>&lt;br&gt;</code> and <code>&lt;em&gt;</code>.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--3">
      <label>Eyebrow
        <input type="text" name="reserve.eyebrow" value="${esc(H.reserveStrip.eyebrow)}" placeholder="Book the night" />
      </label>
      <label>CTA title
        <input type="text" name="reserve.ctaTitle" value="${esc(H.reserveStrip.ctaTitle)}" placeholder="Reserve" />
      </label>
      <label>CTA sub
        <input type="text" name="reserve.ctaSub" value="${esc(H.reserveStrip.ctaSub)}" placeholder="→ All cities" />
      </label>
    </div>
    <div class="admin-form-grid admin-form-grid--1">
      <label>Headline
        <input type="text" name="reserve.headline" value="${esc(H.reserveStrip.headline)}" placeholder="A table, a <em>night,</em><br>the house." />
      </label>
      <label>Sub copy
        <input type="text" name="reserve.sub" value="${esc(H.reserveStrip.sub)}" />
      </label>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">09</span>
      <h3>Menu PDF</h3>
      <p>Brand-wide menu PDF. Shown on the <code>#/menu</code> page as a "Download PDF" link. Leave empty to show the mock menu only.</p>
    </div>
    <div class="admin-form-hero">
      <div class="admin-form-hero-controls" style="flex:1;">
        <label>Menu PDF URL
          <input type="text" name="menuPdf" data-menu-pdf-input value="${esc(H.menuPdf||'')}" placeholder="https://… or leave empty for mock menu" />
        </label>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button type="button" class="admin-btn admin-btn--ghost" data-menu-pdf-upload>Upload PDF from device</button>
          ${H.menuPdf ? `<a href="${esc(H.menuPdf)}" target="_blank" class="admin-btn admin-btn--ghost">Preview PDF →</a>` : ''}
        </div>
      </div>
    </div>
  </div>

  <div class="admin-form-section">
    <div class="admin-form-section-head">
      <span class="admin-form-section-num">10</span>
      <h3>Contact</h3>
      <p>Brand emails and social handles shown on the <code>#/contact</code> page. Leave blank to use defaults.</p>
    </div>
    <div class="admin-form-grid admin-form-grid--2">
      <label>General email
        <input type="text" name="contact.general" value="${esc(H.contact?.general||'')}" placeholder="info@clvchusa.com" />
      </label>
      <label>Private events email
        <input type="text" name="contact.events" value="${esc(H.contact?.events||'')}" placeholder="info@clvchusa.com" />
      </label>
      <label>Franchise email
        <input type="text" name="contact.franchise" value="${esc(H.contact?.franchise||'')}" placeholder="info@clvchusa.com" />
      </label>
      <label>Instagram handle <small>(without @)</small>
        <input type="text" name="contact.instagram" value="${esc(H.contact?.instagram||'')}" placeholder="clvch" />
      </label>
      <label>Facebook handle
        <input type="text" name="contact.facebook" value="${esc(H.contact?.facebook||'')}" placeholder="clvch" />
      </label>
    </div>
  </div>

  <div class="admin-form-foot">
    <div class="admin-form-foot-msg" data-form-msg></div>
    <div class="admin-form-foot-actions">
      <button type="button" class="admin-btn admin-btn--ghost" data-home-reset>Reset home to default</button>
      <a href="#/" data-link class="admin-btn admin-btn--ghost">Preview home →</a>
      <button type="submit" class="admin-btn admin-btn--primary">Save changes</button>
    </div>
  </div>
</form>
  `;
}

function renderAdmin(scopeCityId) {
  const role = getAdminRole();

  // Anonymous → sign-in card
  if (!role) return renderAdminGate(scopeCityId);

  const isSuper = role === "super";
  const managerCity = isSuper ? null : role.split(":")[1];
  const L = window.CLVCH.locations;
  const isHome = scopeCityId === "__home__";
  const isScoped = !!scopeCityId && !isHome;
  const cities = isScoped ? L.filter(l => l.id === scopeCityId) : L;

  // Manager visiting another city's page → blocked
  if (isScoped && !isSuper && managerCity !== scopeCityId) {
    return `
<section class="admin admin--blocked">
  <div class="admin-gate-card">
    <div class="eyebrow" style="margin-bottom:14px;color:#ff8b7e;">No access</div>
    <h1>Wrong <em>door.</em></h1>
    <p class="admin-gate-lede">You're a manager for a different city. Head back and select your location.</p>
    <div style="display:flex;gap:12px;margin-top:32px;flex-wrap:wrap;">
      <a class="admin-btn admin-btn--primary" href="#/admin" data-link>← Admin home</a>
      <button class="admin-btn admin-btn--ghost" data-admin-signout>Sign out</button>
    </div>
  </div>
</section>`;
  }

  // Manager visiting /admin/home → blocked
  if (isHome && !isSuper) {
    return `
<section class="admin admin--blocked">
  <div class="admin-gate-card">
    <div class="eyebrow" style="margin-bottom:14px;color:#ff8b7e;">No access</div>
    <h1>Super only<em>.</em></h1>
    <p class="admin-gate-lede">Home page editing is reserved for super admins. Head back to your city dashboard.</p>
    <div style="display:flex;gap:12px;margin-top:32px;flex-wrap:wrap;">
      <a class="admin-btn admin-btn--primary" href="#/admin" data-link>← Admin home</a>
      <button class="admin-btn admin-btn--ghost" data-admin-signout>Sign out</button>
    </div>
  </div>
</section>`;
  }

  if (isScoped && cities.length === 0) {
    return `<div class="admin"><h1>Unknown city.</h1><a href="#/admin" data-link style="color:var(--bone);">← Admin home</a></div>`;
  }

  const roleLabel = isSuper ? "Super admin" : (() => {
    const c = L.find(x => x.id === managerCity);
    return c ? `${c.city} manager` : "City manager";
  })();

  const _arts = window.CLVCH.articles || [];
  const _artPub = _arts.filter(a => a.published).length;
  const _artDraft = _arts.length - _artPub;

  return `
<section class="admin" data-admin-scope="${scopeCityId || 'all'}">
  <div class="admin-head">
    <div>
      ${isScoped || isHome ? `<a href="#/admin" data-link class="admin-rolebar-link" style="display:inline-flex;align-items:center;gap:6px;margin-bottom:20px;font-size:12px;">← Admin home</a>` : ''}
      <div class="eyebrow" style="margin-bottom:12px;">${isScoped ? cities[0].city + ' · Dashboard' : isHome ? 'Brand · Home page' : 'House control'}</div>
      <h1>${isScoped ? cities[0].city + '<em>.</em>' : isHome ? 'Home<em>.</em>' : 'The <em>House.</em>'}</h1>
      <p style="color:var(--bone-muted);max-width:60ch;font-family:var(--body);font-size:14px;line-height:1.55;">
        ${isScoped
          ? `Edit ${cities[0].city}'s content and gameday posters. Changes go live the moment you save.`
          : isHome
          ? `Edit the public home page — hero, pillars, marquee, and the reserve strip.`
          : isSuper
          ? `Select a city to manage, or edit brand-wide content. Add and configure locations below.`
          : `Select your location to manage content and gameday posters.`}
      </p>
    </div>
    <div class="admin-rolebar">
      <div class="admin-rolechip">
        <span class="admin-rolechip-dot"></span>
        <div>
          <small>Signed in as</small>
          <b>${roleLabel}</b>
        </div>
      </div>
      <a href="#/" data-link class="admin-rolebar-link">← View site</a>
      <button class="admin-rolebar-link admin-rolebar-link--danger" data-admin-signout>Sign out</button>
    </div>
  </div>

  ${isScoped || isHome ? `
    <div class="admin-tabs">
      <a href="#/admin" data-link>Admin home</a>
      ${isSuper ? `
        <a href="#/admin/home" data-link class="${isHome ? 'on' : ''}">Home page</a>
        <a href="#/admin/stories" data-link>Stories</a>
        <a href="#/admin/menu" data-link>Menu</a>
        ${L.map(l => `<a href="#/admin/${l.id}" data-link class="${scopeCityId===l.id ? 'on' : ''}">${l.city}${l.disabled?' <small>· off</small>':''}</a>`).join("")}
      ` : `
        <a href="#/admin/${scopeCityId}" data-link class="on">${cities[0].city}</a>
      `}
    </div>
  ` : ''}

  ${!isScoped && !isHome ? `

    ${isSuper ? `
    <div class="admin-brand-cards">
      <a href="#/admin/home" data-link style="display:block;text-decoration:none;">
        <div class="eyebrow" style="margin-bottom:16px;">Brand</div>
        <div style="font-family:var(--display);font-size:40px;letter-spacing:0.02em;line-height:1;">Home page</div>
        <div class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;margin-top:12px;">Hero · pillars · reserve strip →</div>
      </a>
      <a href="#/admin/stories" data-link style="display:block;text-decoration:none;">
        <div class="eyebrow" style="margin-bottom:16px;">Brand</div>
        <div style="font-family:var(--display);font-size:40px;letter-spacing:0.02em;line-height:1;">Stories</div>
        <div class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;margin-top:12px;">${_artPub} published · ${_artDraft} draft →</div>
      </a>
      <a href="#/admin/menu" data-link style="display:block;text-decoration:none;">
        <div class="eyebrow" style="margin-bottom:16px;">Brand</div>
        <div style="font-family:var(--display);font-size:40px;letter-spacing:0.02em;line-height:1;">Menu</div>
        <div class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;margin-top:12px;">${(window.CLVCH.menu.kitchen||[]).length + (window.CLVCH.menu.brunch||[]).length + (window.CLVCH.menu.bar||[]).length} items across 3 sections →</div>
      </a>
      <div>
        <div class="eyebrow" style="margin-bottom:16px;">Cities</div>
        <div style="font-family:var(--display);font-size:40px;letter-spacing:0.02em;line-height:1;margin-bottom:20px;">${L.length} location${L.length !== 1 ? 's' : ''}</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <button class="admin-btn admin-btn--primary" data-admin-newcity>+ Add city</button>
          <button class="admin-btn admin-btn--ghost" data-admin-reset>Reset defaults</button>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="eyebrow" style="margin-bottom:20px;">${isSuper ? 'Locations' : 'Your location'}</div>
    <div class="admin-city-cards">
      ${L.map(l => {
        const accessible = isSuper || managerCity === l.id;
        const statusLabel = l.disabled ? 'Offline' : l.status === 'open' ? 'Open' : l.status === 'prep' ? 'Opens later' : 'Coming soon';
        const inner = `
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;">
            <span class="admin-statuspill admin-statuspill--${l.disabled?'off':l.status}">${statusLabel}</span>
            ${!accessible ? `<span class="mono" style="font-size:9px;letter-spacing:0.18em;color:var(--bone-muted);text-transform:uppercase;">No access</span>` : ''}
          </div>
          <div style="font-family:var(--display);font-size:clamp(32px,4vw,52px);letter-spacing:0.02em;line-height:1;margin-bottom:8px;">${l.city}</div>
          <div class="mono" style="font-size:10px;letter-spacing:0.22em;color:var(--bone-muted);text-transform:uppercase;">${l.state}</div>
          ${l.tonight ? `<div style="color:var(--bone-dim);font-size:13px;margin-top:16px;line-height:1.6;">${l.tonight}<br>${l.tonightTime}</div>` : ''}
        `;
        return accessible
          ? `<a href="#/admin/${l.id}" data-link style="display:block;text-decoration:none;">${inner}</a>`
          : `<div style="opacity:0.25;cursor:not-allowed;">${inner}</div>`;
      }).join("")}
    </div>

    ${isSuper ? `
    <div class="admin-cityindex">
      <div class="admin-cityindex-head">
        <h2>Manage cities <small>· ${L.length}</small></h2>
        <div class="admin-cityindex-actions">
          <button class="admin-btn admin-btn--primary" data-admin-newcity>+ Add city</button>
        </div>
      </div>
      <div class="admin-newcity-slot" data-newcity-slot hidden></div>
      <div class="admin-citytable">
        <div class="admin-citytable-row admin-citytable-row--head">
          <span>#</span><span>City</span><span>Status</span><span>Tonight</span><span>Posters</span><span></span>
        </div>
        ${L.map((l, i) => {
          const g = window.CLVCH.gameday[l.id] || { items: [], enabled: false };
          const live = (g.items || []).filter(x => x.on).length;
          const total = (g.items || []).length;
          const statusLabel = l.disabled ? 'Disabled' : (l.status === 'open' ? 'Open' : l.status === 'soon' ? 'Coming soon' : 'Opens later');
          return `
          <details class="admin-citytable-row" data-city-row="${l.id}" ${l.disabled ? 'data-disabled="true"' : ''}>
            <summary>
              <span class="mono-num">${String(i+1).padStart(2,'0')}</span>
              <span class="admin-cityname"><b>${l.city}</b><small>${l.state}</small></span>
              <span class="admin-statuspill admin-statuspill--${l.disabled?'off':l.status}">${statusLabel}</span>
              <span class="admin-tonight">${l.tonight || '—'}</span>
              <span class="admin-postersum">${g.enabled ? `${live}/${total}` : 'off'}</span>
              <span class="admin-citytable-toggle">Edit</span>
            </summary>
            <div class="admin-citytable-body">
              ${renderAdminCityForm(l, "edit")}
              ${renderAdminPosterBlock(l)}
              <div class="admin-danger">
                <div>
                  <h4>Danger zone</h4>
                  <p>${l.disabled ? `${l.city} is currently disabled — hidden from the site but data is preserved.` : `Take ${l.city} offline (recommended) or delete it permanently.`}</p>
                </div>
                <div class="admin-danger-actions">
                  <button class="admin-btn admin-btn--ghost" data-city-disable="${l.id}">${l.disabled ? 'Re-enable city' : 'Disable city'}</button>
                  <button class="admin-btn admin-btn--danger" data-city-delete="${l.id}">Delete permanently</button>
                </div>
              </div>
            </div>
          </details>`;
        }).join("")}
      </div>
    </div>
    ` : ''}

  ` : ''}

  ${isScoped ? `
    <div class="admin-scoped">
      ${renderAdminCityForm(cities[0], "edit")}
      ${renderAdminPosterBlock(cities[0])}
    </div>
  ` : ''}

  ${isHome ? `
    <div class="admin-home-wrap">
      <div class="admin-cityindex-head" style="border-bottom:1px solid var(--line-soft);margin-bottom:0;">
        <h2>Home page <small>· global</small></h2>
        <div class="admin-cityindex-actions">
          <a href="#/" data-link class="admin-btn admin-btn--ghost">Preview home →</a>
        </div>
      </div>
      ${renderAdminHomeBlock()}
    </div>
  ` : ''}
</section>
  `;
}

/* ═══ Router ═══ */
function route() {
  window.CLVCH.cityGate?.cancelSchedule();
  const hash = location.hash.replace(/^#/, "") || "/";
  const [path] = hash.split("?");
  const segs = path.split("/").filter(Boolean);

  let html = "";
  if (segs.length === 0) html = renderHome();
  else if (segs[0] === "locations" && segs[1]) { html = renderVenue(segs[1]); window.CLVCH.cityGate?.scheduleFor(segs[1]); }
  else if (segs[0] === "locations") html = renderLocations();
  else if (segs[0] === "reserve") html = renderReserve();
  else if (segs[0] === "contact") html = renderContact();
  else if (segs[0] === "menu") html = renderMenu();
  else if (segs[0] === "privacy") html = renderPrivacy();
  else if (segs[0] === "terms") html = renderTerms();
  else if (segs[0] === "stories" && segs[1]) html = renderStory(segs[1]);
  else if (segs[0] === "stories") html = renderStories();
  else if (segs[0] === "admin" && segs[1] === "stories") html = renderAdminStories(segs[2] || null);
  else if (segs[0] === "admin" && segs[1] === "menu") html = renderAdminMenu();
  else if (segs[0] === "admin" && segs[1] === "home") html = renderAdmin("__home__");
  else if (segs[0] === "admin" && segs[1]) html = renderAdmin(segs[1]);
  else if (segs[0] === "admin") html = renderAdmin(null);
  else html = renderHome();

  outlet.innerHTML = html;
  window.scrollTo(0, 0);

  // mark nav active
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href").replace(/^#/, "");
    a.classList.toggle("active", href !== "/" && path.startsWith(href));
  });

  // wire data-link clicks (smooth, no full reload — hash does that)
  outlet.querySelectorAll('[data-link]').forEach(a => {
    a.addEventListener("click", () => { /* hash router handles it */ });
  });

  // ─── Menu tabs ───
  const menuTabBtns = outlet.querySelectorAll('[data-menu-tab]');
  if (menuTabBtns.length) {
    menuTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.menuTab;
        menuTabBtns.forEach(b => b.classList.toggle('on', b === btn));
        outlet.querySelectorAll('[data-menu-panel]').forEach(p => {
          p.style.display = p.dataset.menuPanel === tab ? '' : 'none';
        });
      });
    });
  }

  // ─── Gameday poster carousel ───
  const gdStage = outlet.querySelector("#gdStage");
  if (gdStage) {
    const slides = [...gdStage.querySelectorAll(".gdposter-slide")];
    const dots = [...gdStage.querySelectorAll("#gdDots button")];
    if (slides.length > 1) {
      let idx = 0, timer = null;
      const show = (n) => {
        idx = (n + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle("on", i === idx));
        dots.forEach((d, i) => d.classList.toggle("on", i === idx));
      };
      const tick = () => { show(idx + 1); };
      const start = () => { stop(); timer = setInterval(tick, 5000); };
      const stop = () => { if (timer) clearInterval(timer); timer = null; };
      dots.forEach(d => d.addEventListener("click", () => { show(parseInt(d.dataset.dot, 10)); start(); }));
      gdStage.addEventListener("mouseenter", stop);
      gdStage.addEventListener("mouseleave", start);
      start();
    }
  }

  // ─── Gameday notify form ───
  const gdNotifyForm = outlet.querySelector('#gdNotifyForm');
  if (gdNotifyForm) {
    gdNotifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = gdNotifyForm.querySelector('input[type="email"]').value.trim();
      if (!email) return;
      try { localStorage.setItem('clvch_email', email); } catch {}
      const done = document.createElement('p');
      done.className = 'gdposter-notify-done';
      done.textContent = "You're on the list — lineup drops in your inbox first.";
      gdNotifyForm.replaceWith(done);
    });
  }

  // ─── Pillar image carousels ───
  outlet.querySelectorAll("[data-pillar-carousel]").forEach(carousel => {
    const imgs = [...carousel.querySelectorAll("img")];
    if (imgs.length <= 1) return;
    let idx = 0;
    let timer = null;
    const show = (n) => {
      idx = (n + imgs.length) % imgs.length;
      imgs.forEach((img, i) => img.classList.toggle("on", i === idx));
    };
    const start = () => { stop(); timer = setInterval(() => show(idx + 1), 4500); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  });

  // ─── Reserve page: booking type selector ───
  const resTypeBtns = outlet.querySelector("#resTypeBtns");
  if (resTypeBtns) {
    const privateFields = outlet.querySelector("#reservePrivateFields");
    const submitBtn = outlet.querySelector("#reserveSubmitBtn");
    const typeVal = outlet.querySelector("#resTypeVal");
    const guestsSection = outlet.querySelector("#reserveGuestsSection");

    resTypeBtns.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-type-btn]"); if (!btn) return;
      // If success panel is showing, reset back to form state first
      const sp = outlet.querySelector('#reserveSuccess');
      const fp = outlet.querySelector('#reserveForm');
      if (sp && sp.style.display === 'flex') {
        sp.style.display = 'none';
        if (fp) fp.style.display = '';
      }
      resTypeBtns.querySelectorAll("[data-type-btn]").forEach(b => b.classList.toggle("on", b === btn));
      const type = btn.dataset.typeBtn;
      if (typeVal) typeVal.value = type;
      const isEvent = type === "private" || type === "buyout";
      if (privateFields) privateFields.style.display = isEvent ? "block" : "none";
      if (submitBtn) {
        submitBtn.textContent = type === "private" ? "Submit private event enquiry →" : type === "buyout" ? "Submit buyout enquiry →" : "Hold my table →";
      }
      if (guestsSection) guestsSection.style.display = isEvent ? "none" : "";
    });
  }

  // ─── Admin wiring ───
  const adminSection = outlet.querySelector(".admin");
  if (adminSection) {
    const save = () => window.CLVCH.saveGameday();

    // Sign-in (gate)
    adminSection.querySelectorAll("[data-role]").forEach(el => {
      el.addEventListener("click", () => {
        setAdminRole(el.dataset.role);
        route();
      });
    });

    // Sign-out
    adminSection.querySelectorAll("[data-admin-signout]").forEach(el => {
      el.addEventListener("click", () => {
        setAdminRole("");
        location.hash = "#/admin";
        route();
      });
    });

    // Reset to defaults
    adminSection.querySelectorAll("[data-admin-reset]").forEach(el => {
      el.addEventListener("click", () => {
        if (!confirm("Reset all locations and gameday posters to the default seed? Your edits will be lost.")) return;
        window.CLVCH.resetAll();
        window.CLVCH.locations = window.CLVCH._locationsSeed();
        // re-seed gameday from the original GAMEDAY_SEED is in app.js scope; simplest: reload
        location.reload();
      });
    });

    // Add city — reveal new-city form in slot
    adminSection.querySelectorAll("[data-admin-newcity]").forEach(el => {
      el.addEventListener("click", () => {
        const slot = adminSection.querySelector("[data-newcity-slot]");
        if (!slot) return;
        if (!slot.hidden) { slot.hidden = true; slot.innerHTML = ""; return; }
        slot.hidden = false;
        slot.innerHTML = `<div class="admin-newcity-card"><div class="admin-newcity-head"><h3>New city</h3><p>Fill in the basics — you can come back and edit any of this later.</p></div>${renderAdminCityForm(null, "new")}</div>`;
        wireCityForm(slot.querySelector("[data-city-form]"));
        slot.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // Disable / re-enable city
    adminSection.querySelectorAll("[data-city-disable]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.dataset.cityDisable;
        const c = window.CLVCH.locations.find(l => l.id === id);
        if (!c) return;
        window.CLVCH.updateCity(id, { disabled: !c.disabled });
        route();
      });
    });

    // Delete city
    adminSection.querySelectorAll("[data-city-delete]").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.dataset.cityDelete;
        const c = window.CLVCH.locations.find(l => l.id === id);
        if (!c) return;
        if (!confirm(`Permanently delete ${c.city}? This removes the city and all its posters. Consider "Disable" instead.`)) return;
        window.CLVCH.removeCity(id);
        route();
      });
    });

    // Wire every city form (edit + scoped + new)
    adminSection.querySelectorAll("[data-city-form]").forEach(form => wireCityForm(form));

    // Home form
    const homeForm = adminSection.querySelector("[data-home-form]");
    if (homeForm) wireHomeForm(homeForm);

    function wireHomeForm(form) {
      const msgEl = form.querySelector("[data-form-msg]");
      const setMsg = (t, ok=false) => { if (!msgEl) return; msgEl.textContent = t; msgEl.dataset.ok = String(ok); };

      // Hero video — live preview + upload
      const videoInput = form.querySelector("[data-hero-video-input]");
      const videoPreview = form.querySelector("[data-hero-video-preview]");
      const videoUpload = form.querySelector("[data-hero-video-upload]");
      if (videoInput && videoPreview) {
        videoInput.addEventListener("input", () => {
          if (videoInput.value) videoPreview.src = videoInput.value;
        });
      }
      if (videoUpload && videoInput && videoPreview) {
        videoUpload.addEventListener("click", () => {
          const fi = document.createElement("input");
          fi.type = "file"; fi.accept = "video/*";
          fi.addEventListener("change", () => {
            const file = fi.files?.[0]; if (!file) return;
            // Warn for very large files — data URLs balloon localStorage fast
            if (file.size > 8 * 1024 * 1024) {
              if (!confirm(`That video is ${(file.size/1024/1024).toFixed(1)} MB — saving in-browser will be slow and may fail. Continue anyway?`)) return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              videoInput.value = reader.result;
              videoPreview.src = reader.result;
            };
            reader.readAsDataURL(file);
          });
          fi.click();
        });
      }

      // Live preview for pillar images (first comma-separated URL)
      form.querySelectorAll("[data-pillar-input]").forEach(input => {
        const i = input.dataset.pillarInput;
        const preview = form.querySelector(`[data-pillar-preview="${i}"]`);
        input.addEventListener("input", () => {
          if (!preview) return;
          const first = input.value.split(",")[0].trim();
          if (first) preview.src = first;
        });
      });

      // Upload-to-data-URL for pillar images (appends to comma-separated images list)
      form.querySelectorAll("[data-pillar-upload]").forEach(btn => {
        btn.addEventListener("click", () => {
          const i = btn.dataset.pillarUpload;
          const input = form.querySelector(`[data-pillar-input="${i}"]`);
          const preview = form.querySelector(`[data-pillar-preview="${i}"]`);
          const fi = document.createElement("input");
          fi.type = "file"; fi.accept = "image/*";
          fi.addEventListener("change", () => {
            const file = fi.files?.[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              if (input) {
                const existing = input.value.split(",").map(s => s.trim()).filter(Boolean);
                existing.push(reader.result);
                input.value = existing.join(", ");
                if (preview) preview.src = existing[0];
              }
            };
            reader.readAsDataURL(file);
          });
          fi.click();
        });
      });

      // Menu PDF upload
      const menuPdfUpload = form.querySelector("[data-menu-pdf-upload]");
      const menuPdfInput = form.querySelector("[data-menu-pdf-input]");
      if (menuPdfUpload && menuPdfInput) {
        menuPdfUpload.addEventListener("click", () => {
          const fi = document.createElement("input");
          fi.type = "file"; fi.accept = ".pdf,application/pdf";
          fi.addEventListener("change", () => {
            const file = fi.files?.[0]; if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
              if (!confirm(`PDF is ${(file.size/1024/1024).toFixed(1)} MB — storing as data URL may be slow. Continue?`)) return;
            }
            const reader = new FileReader();
            reader.onload = () => { menuPdfInput.value = reader.result; };
            reader.readAsDataURL(file);
          });
          fi.click();
        });
      }

      // Reset just home
      const resetBtn = form.querySelector("[data-home-reset]");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (!confirm("Reset the home page to defaults? Your home edits will be lost (cities and posters are untouched).")) return;
          window.CLVCH.home = window.CLVCH._homeSeed();
          window.CLVCH.saveHome();
          route();
        });
      }

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const H = window.CLVCH.home;

        H.hero.chapter = data["hero.chapter"] || "";
        H.hero.estLine = data["hero.estLine"] || "";
        H.hero.videoSrc = data["hero.videoSrc"] || "";
        H.hero.word1 = data["hero.word1"] || "";
        H.hero.word2 = data["hero.word2"] || "";
        H.hero.word3 = data["hero.word3"] || "";
        H.hero.subModes = [data["hero.sub1"]||"", data["hero.sub2"]||"", data["hero.sub3"]||""].filter(Boolean);
        H.hero.blurb = data["hero.blurb"] || "";

        H.pillars.headline = data["pillars.headline"] || "";
        H.pillars.intro = data["pillars.intro"] || "";
        H.pillars.items = (H.pillars.items || []).map((p, i) => {
          const rawImages = data[`pillar.${i}.images`] || "";
          const imagesArr = rawImages.split(",").map(s => s.trim()).filter(Boolean);
          return {
            ...p,
            num: data[`pillar.${i}.num`] ?? p.num,
            title: data[`pillar.${i}.title`] ?? p.title,
            copy: data[`pillar.${i}.copy`] ?? p.copy,
            listLabel: data[`pillar.${i}.listLabel`] ?? p.listLabel,
            listItems: data[`pillar.${i}.listItems`] ?? p.listItems,
            image: imagesArr[0] || p.image,
            images: imagesArr.length ? imagesArr : p.images,
          };
        });

        H.marqueeWords = (data.marqueeWords || "").split(",").map(s => s.trim()).filter(Boolean);
        H.pressLogos = (data.pressLogos || "").split(",").map(s => s.trim()).filter(Boolean);
        H.menuPdf = (data.menuPdf || "").trim();

        H.reserveStrip.eyebrow = data["reserve.eyebrow"] || "";
        H.reserveStrip.headline = data["reserve.headline"] || "";
        H.reserveStrip.sub = data["reserve.sub"] || "";
        H.reserveStrip.ctaTitle = data["reserve.ctaTitle"] || "";
        H.reserveStrip.ctaSub = data["reserve.ctaSub"] || "";

        H.contact = {
          general:   (data["contact.general"]   || "").trim(),
          events:    (data["contact.events"]    || "").trim(),
          franchise: (data["contact.franchise"] || "").trim(),
          instagram: (data["contact.instagram"] || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "").replace(/^@/, ""),
          facebook:  (data["contact.facebook"]  || "").trim().replace(/^https?:\/\/(www\.)?facebook\.com\//, "").replace(/\/$/, "").replace(/^@/, ""),
        };

        window.CLVCH.saveHome();
        setMsg("Saved.", true);
        setTimeout(() => setMsg(""), 2200);
      });
    }

    function wireCityForm(form) {
      if (!form || form.dataset.wired) return;
      form.dataset.wired = "1";

      const mode = form.dataset.mode;
      const heroPreview = form.querySelector("[data-hero-preview]");
      const heroInput = form.querySelector("[data-hero-input]");
      const uploadBtn = form.querySelector("[data-hero-upload]");
      const cancelBtn = form.querySelector("[data-form-cancel]");
      const msgEl = form.querySelector("[data-form-msg]");
      const slugInput = form.querySelector('[name="id"]');
      const cityInput = form.querySelector('[name="city"]');

      // Auto-slug from city name (only on new)
      if (mode === "new" && cityInput && slugInput) {
        cityInput.addEventListener("input", () => {
          if (slugInput.dataset.touched) return;
          slugInput.value = window.CLVCH.slugify(cityInput.value);
        });
        slugInput.addEventListener("input", () => { slugInput.dataset.touched = "1"; });
      }

      // Hero preview live update
      if (heroInput && heroPreview) {
        heroInput.addEventListener("input", () => {
          if (heroInput.value) heroPreview.src = heroInput.value;
        });
      }

      // Hero upload → data URL
      if (uploadBtn && heroInput && heroPreview) {
        uploadBtn.addEventListener("click", () => {
          const fi = document.createElement("input");
          fi.type = "file"; fi.accept = "image/*";
          fi.addEventListener("change", () => {
            const file = fi.files?.[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              heroInput.value = reader.result;
              heroPreview.src = reader.result;
            };
            reader.readAsDataURL(file);
          });
          fi.click();
        });
      }

      // Cancel
      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          if (mode === "new") {
            const slot = form.closest("[data-newcity-slot]");
            if (slot) { slot.hidden = true; slot.innerHTML = ""; }
          } else {
            const row = form.closest("details");
            if (row) row.open = false;
          }
        });
      }

      // Submit
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const payload = {
          id: (data.id || "").trim(),
          city: (data.city || "").trim(),
          state: (data.state || "").trim(),
          status: data.status || "soon",
          tonight: data.tonight || "",
          tonightTime: data.tonightTime || "",
          address: data.address || "",
          phone: data.phone || "",
          hours: data.hours || "",
          capacity: Number(data.capacity) || 0,
          opened: data.opened || "",
          hero: data.hero || "../assets/img-club-1.jpg",
          blurb: data.blurb || "",
          marqueeWords: (data.marqueeWords || "").split(",").map(s => s.trim()).filter(Boolean),
          reservations_enabled: data.reservations_enabled === 'on',
          roomImages: {
            bites: (data['roomImages.bites'] || "").split(",").map(s => s.trim()).filter(Boolean),
            beats: (data['roomImages.beats'] || "").split(",").map(s => s.trim()).filter(Boolean),
            booze: (data['roomImages.booze'] || "").split(",").map(s => s.trim()).filter(Boolean),
          },
        };

        if (mode === "new") {
          if (!payload.city || !payload.state) { setMsg("City and state are required."); return; }
          if (!payload.id) { setMsg("Slug couldn't be derived — give the city a name."); return; }
          if (window.CLVCH.locations.some(l => l.id === payload.id)) { setMsg(`The slug "${payload.id}" is already taken.`); return; }
          const fresh = window.CLVCH.addCity(payload);
          if (!fresh) { setMsg("Couldn't create that city — check the slug."); return; }
          setMsg(`${payload.city} is live.`, true);
          setTimeout(() => route(), 600);
        } else {
          const id = form.dataset.cityForm;
          window.CLVCH.updateCity(id, payload);
          setMsg("Saved.", true);
          setTimeout(() => { setMsg(""); }, 2200);
        }
      });

      function setMsg(t, ok=false) {
        if (!msgEl) return;
        msgEl.textContent = t;
        msgEl.dataset.ok = String(ok);
      }
    }

    // section on/off
    adminSection.querySelectorAll("[data-city-toggle]").forEach(el => {
      el.addEventListener("change", () => {
        const id = el.dataset.cityToggle;
        window.CLVCH.gameday[id].enabled = el.checked;
        save();
        const label = el.parentElement.querySelector("span:last-child");
        if (label) label.textContent = el.checked ? "Section on" : "Section off";
      });
    });

    // meta inputs (instagram/facebook/caption)
    adminSection.querySelectorAll("[data-city-meta]").forEach(el => {
      el.addEventListener("input", () => {
        const id = el.dataset.cityMeta;
        const field = el.dataset.field;
        window.CLVCH.gameday[id][field] = el.value;
        save();
      });
    });

    // per-item toggle
    adminSection.querySelectorAll("[data-item-toggle]").forEach(el => {
      el.addEventListener("change", () => {
        const [cityId, itemId] = el.dataset.itemToggle.split(":");
        const item = window.CLVCH.gameday[cityId].items.find(i => i.id === itemId);
        if (item) {
          item.on = el.checked;
          save();
          const tile = el.closest(".admin-tile");
          if (tile) tile.dataset.off = String(!el.checked);
          const label = el.parentElement.querySelector("span:last-child");
          if (label) label.textContent = el.checked ? "Live" : "Off";
        }
      });
    });

    // delete item
    adminSection.querySelectorAll("[data-item-del]").forEach(el => {
      el.addEventListener("click", () => {
        if (!confirm("Remove this poster?")) return;
        const [cityId, itemId] = el.dataset.itemDel.split(":");
        window.CLVCH.gameday[cityId].items = window.CLVCH.gameday[cityId].items.filter(i => i.id !== itemId);
        save();
        route(); // re-render admin
      });
    });

    // upload poster (file picker → reads as data URL)
    adminSection.querySelectorAll("[data-city-add]").forEach(el => {
      el.addEventListener("click", () => {
        const cityId = el.dataset.cityAdd;
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.addEventListener("change", () => {
          const file = input.files && input.files[0];
          if (!file) return;
          const label = prompt("Label for this poster (e.g. 'Sunday Night · 8 PM'):", file.name.replace(/\.[^.]+$/, "")) || "Untitled";
          const reader = new FileReader();
          reader.onload = () => {
            const id = cityId + "-" + Date.now().toString(36);
            window.CLVCH.gameday[cityId].items.push({ id, src: reader.result, label, on: true });
            save();
            route();
          };
          reader.readAsDataURL(file);
        });
        input.click();
      });
    });
  }

  // homepage: location switcher
  const locList = outlet.querySelector("#locList");
  if (locList) {
    const setActive = (item) => {
      if (!item) return;
      const id = item.dataset.loc;
      locList.querySelectorAll(".loc-item").forEach(i => i.classList.toggle("active", i === item));
      outlet.querySelectorAll(".locswitch-frame").forEach(f => f.classList.toggle("on", f.dataset.frame === id));
    };
    locList.addEventListener("mouseover", (e) => {
      const item = e.target.closest("[data-loc]");
      if (item) setActive(item);
    });
    locList.addEventListener("click", (e) => {
      const item = e.target.closest("[data-loc]");
      if (item) setActive(item);
    });

    // search filter
    const search = outlet.querySelector("#locSearch");
    const countEl = outlet.querySelector("#locSearchCount");
    const emptyEl = outlet.querySelector("#locEmpty");
    const filters = outlet.querySelector("#locFilters");
    let activeFilter = "all";

    const applyFilter = () => {
      const q = (search?.value || "").trim().toLowerCase();
      let shown = 0;
      let firstVisible = null;
      locList.querySelectorAll(".loc-item").forEach(item => {
        const matchesSearch = !q || item.dataset.search.includes(q);
        const matchesFilter = activeFilter === "all" || item.dataset.status === activeFilter;
        const visible = matchesSearch && matchesFilter;
        item.hidden = !visible;
        if (visible) {
          shown++;
          if (!firstVisible) firstVisible = item;
        }
      });
      if (countEl) countEl.textContent = shown;
      if (emptyEl) emptyEl.hidden = shown > 0;
      // auto-activate first visible so the preview stays in sync
      if (firstVisible && !firstVisible.classList.contains("active")) setActive(firstVisible);
    };

    if (search) search.addEventListener("input", applyFilter);
    if (filters) {
      filters.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        filters.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
        activeFilter = b.dataset.filter;
        applyFilter();
      });
    }
  }

  // reserve page: city swap + guest count + submit
  const reserveRight = outlet.querySelector('#reserveRight');
  if (reserveRight) {
    const formPanel    = outlet.querySelector('#reserveForm');
    const offPanel     = outlet.querySelector('#reserveOff');
    const offPhone     = outlet.querySelector('#reserveOffPhone');
    const successPanel = outlet.querySelector('#reserveSuccess');

    const showCity = (cityId, enabled) => {
      const city = window.CLVCH.locations.find(l => l.id === cityId);
      if (formPanel) formPanel.style.display = enabled ? '' : 'none';
      if (offPanel) {
        offPanel.style.display = enabled ? 'none' : 'flex';
        if (!enabled && offPhone) {
          if (city?.phone) {
            offPhone.innerHTML = `Questions? Call <a href="tel:${city.phone}" style="color:var(--bone);">${city.phone}</a>`;
            offPhone.style.display = '';
          } else {
            offPhone.style.display = 'none';
          }
        }
      }
      if (successPanel) successPanel.style.display = 'none';
    };

    outlet.querySelectorAll('[name="city"]').forEach(radio => {
      radio.addEventListener('change', () => showCity(radio.value, radio.dataset.resEnabled === '1'));
    });

    const guestsInput = outlet.querySelector('[name="res_guests"]');
    outlet.querySelectorAll('[data-guest-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        outlet.querySelectorAll('[data-guest-btn]').forEach(b => {
          b.style.background = 'transparent';
          b.style.color = 'var(--bone)';
        });
        btn.style.background = 'var(--bone)';
        btn.style.color = 'var(--ink)';
        if (guestsInput) guestsInput.value = btn.dataset.guestBtn;
      });
    });

    const submitBtn = outlet.querySelector('[data-reserve-submit]');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const first  = outlet.querySelector('[name="res_first"]')?.value.trim() || '';
        const last   = outlet.querySelector('[name="res_last"]')?.value.trim() || '';
        const phone  = outlet.querySelector('[name="res_phone"]')?.value.trim() || '';
        const email  = outlet.querySelector('[name="res_email"]')?.value.trim() || '';
        const date   = outlet.querySelector('[name="res_date"]')?.value || '';
        const guests = outlet.querySelector('[name="res_guests"]')?.value || '';
        const typeVal = outlet.querySelector('#resTypeVal')?.value || 'table';
        const isEvent = typeVal === 'private' || typeVal === 'buyout';

        const missing = [];
        const digits = phone.replace(/\D/g, '');
        if (!first)                                          missing.push('First name');
        if (!last)                                           missing.push('Last name');
        if (!phone || digits.length < 10 || digits.length > 11) missing.push('Valid phone (10–11 digits)');
        if (!email || !/\S+@\S+\.\S+/.test(email))          missing.push('Valid email');
        if (!date)                              missing.push('Date');
        if (!isEvent && !guests)               missing.push('Guest count');

        const errEl = outlet.querySelector('#reserveErr');
        if (errEl) errEl.remove();

        if (missing.length) {
          const div = document.createElement('p');
          div.id = 'reserveErr';
          div.style.cssText = 'color:#ff6b6b;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;padding:14px;border:1px solid rgba(255,107,107,0.35);background:rgba(255,107,107,0.06);';
          div.textContent = 'Required: ' + missing.join(', ');
          submitBtn.insertAdjacentElement('beforebegin', div);
          return;
        }

        const cityRadio = outlet.querySelector('[name="city"]:checked');
        const city = cityRadio ? window.CLVCH.locations.find(l => l.id === cityRadio.value) : null;
        if (formPanel) formPanel.style.display = 'none';
        if (offPanel)  offPanel.style.display  = 'none';
        if (successPanel) {
          successPanel.style.display = 'flex';
          const nameEl       = successPanel.querySelector('[data-success-name]');
          const phoneEl      = successPanel.querySelector('[data-success-phone]');
          const emailEl      = successPanel.querySelector('[data-success-email]');
          const venuePhoneEl = successPanel.querySelector('[data-success-venue-phone]');
          if (nameEl)       nameEl.textContent       = first;
          if (phoneEl)      phoneEl.textContent      = phone;
          if (emailEl)      emailEl.textContent      = email;
          if (venuePhoneEl) venuePhoneEl.textContent = city?.phone || '';
        }
      });
    }
  }

  // ─── Stories admin wiring ───
  if (adminSection && adminSection.hasAttribute('data-stories-admin')) {
    adminSection.querySelector("[data-stories-new]")?.addEventListener("click", () => {
      location.hash = "#/admin/stories/new";
    });

    // Edit buttons
    adminSection.querySelectorAll("[data-stories-edit]").forEach(btn => {
      btn.addEventListener("click", () => {
        location.hash = "#/admin/stories/" + btn.dataset.storiesEdit;
      });
    });

    // Delete buttons
    adminSection.querySelectorAll("[data-stories-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.storiesDelete;
        const a = (window.CLVCH.articles || []).find(x => x.id === id);
        if (!a) return;
        if (!confirm(`Delete "${a.title}"?\nThis cannot be undone.`)) return;
        window.CLVCH.articles = window.CLVCH.articles.filter(x => x.id !== id);
        window.CLVCH.saveArticles();
        route();
      });
    });

    // Write / Preview tabs
    const writeBtn  = adminSection.querySelector("[data-tab='write']");
    const previewBtn = adminSection.querySelector("[data-tab='preview']");
    const bodyTA    = adminSection.querySelector("[name='body']");
    const previewDiv = adminSection.querySelector(".story-preview");

    writeBtn?.addEventListener("click", () => {
      writeBtn.classList.add("on");
      previewBtn?.classList.remove("on");
      if (bodyTA)    bodyTA.style.display    = "block";
      if (previewDiv) previewDiv.style.display = "none";
    });

    previewBtn?.addEventListener("click", () => {
      previewBtn.classList.add("on");
      writeBtn?.classList.remove("on");
      if (bodyTA)    bodyTA.style.display    = "none";
      if (previewDiv) {
        previewDiv.style.display = "block";
        previewDiv.innerHTML = window.CLVCH.markdownToHtml(bodyTA?.value || "");
      }
    });

    adminSection.querySelector("[data-md-upload]")?.addEventListener("click", () => {
      const fi = document.createElement("input");
      fi.type = "file"; fi.accept = ".md,.txt";
      fi.addEventListener("change", () => {
        const file = fi.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (bodyTA) { bodyTA.value = reader.result; writeBtn?.click(); }
        };
        reader.readAsText(file);
      });
      fi.click();
    });

    // Auto-slug from title (new articles only)
    const titleInput = adminSection.querySelector("[name='title']");
    const slugInput  = adminSection.querySelector("[name='id']:not([readonly])");
    if (titleInput && slugInput) {
      titleInput.addEventListener("input", () => {
        if (slugInput.dataset.touched) return;
        slugInput.value = window.CLVCH.slugify(titleInput.value);
      });
      slugInput.addEventListener("input", () => { slugInput.dataset.touched = "1"; });
    }

    // Article form submit
    const articleForm = adminSection.querySelector("[data-article-form]");
    if (articleForm) {
      const msgEl = articleForm.querySelector("[data-form-msg]");
      const setMsg = (t, ok=false) => { if (!msgEl) return; msgEl.textContent = t; msgEl.dataset.ok = String(ok); };

      articleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(articleForm).entries());
        const body = bodyTA ? bodyTA.value : "";
        const id = window.CLVCH.slugify(data.id);
        if (!id || !data.title?.trim() || !body.trim()) {
          setMsg("Title, slug, and body are required.");
          return;
        }
        const existing = window.CLVCH.articles || [];
        const isNewA = !existing.find(a => a.id === id);
        const article = {
          id,
          title: data.title.trim(),
          excerpt: (data.excerpt || "").trim(),
          body,
          cityId: data.cityId || null,
          cover: (data.cover || "").trim(),
          date: data.date || new Date().toISOString().slice(0, 10),
          published: data.published === "on",
          tags: (data.tags || "").split(",").map(s => s.trim()).filter(Boolean),
        };
        window.CLVCH.articles = isNewA
          ? [article, ...existing]
          : existing.map(a => a.id === id ? article : a);
        window.CLVCH.saveArticles();
        setMsg("Saved.", true);
        setTimeout(() => { location.hash = "#/admin/stories"; }, 600);
      });
    }
  }

  // ─── Menu admin wiring ───
  const menuEditor = outlet.querySelector("[data-menu-editor]");
  if (menuEditor) {
    const msgEl = outlet.querySelector("[data-form-msg]");
    const setMsg = (t, ok=false) => { if (!msgEl) return; msgEl.textContent = t; msgEl.dataset.ok = String(ok); };

    const mkRow = () => {
      const row = document.createElement("div");
      row.className = "menu-admin-row";
      row.innerHTML = `
        <input type="text" class="menu-admin-input" data-field="name" placeholder="Item name" />
        <input type="text" class="menu-admin-input menu-admin-input--desc" data-field="desc" placeholder="Description" />
        <input type="text" class="menu-admin-input menu-admin-input--price" data-field="price" placeholder="$00" />
        <input type="text" class="menu-admin-input menu-admin-input--tag" data-field="tag" placeholder="Tag" />
        <button class="menu-admin-del" data-item-del title="Delete item">×</button>`;
      return row;
    };

    const wireDelBtn = (btn) => {
      if (!btn) return;
      btn.addEventListener("click", () => {
        btn.closest(".menu-admin-row")?.remove();
      });
    };
    menuEditor.querySelectorAll("[data-item-del]").forEach(wireDelBtn);

    menuEditor.querySelectorAll("[data-add-section]").forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.addSection;
        const list = menuEditor.querySelector(`#menuSection_${key}`);
        if (!list) return;
        const row = mkRow();
        list.appendChild(row);
        row.querySelector("input")?.focus();
        wireDelBtn(row.querySelector("[data-item-del]"));
      });
    });

    const collectSection = (key) => {
      const list = menuEditor.querySelector(`#menuSection_${key}`);
      if (!list) return [];
      return [...list.querySelectorAll(".menu-admin-row")].map(row => ({
        name:  row.querySelector("[data-field='name']")?.value.trim() || "",
        desc:  row.querySelector("[data-field='desc']")?.value.trim() || "",
        price: row.querySelector("[data-field='price']")?.value.trim() || "",
        tag:   row.querySelector("[data-field='tag']")?.value.trim() || "",
      })).filter(item => item.name);
    };

    outlet.querySelector("[data-menu-save]")?.addEventListener("click", () => {
      window.CLVCH.menu.kitchen = collectSection("kitchen");
      window.CLVCH.menu.brunch  = collectSection("brunch");
      window.CLVCH.menu.bar     = collectSection("bar");
      window.CLVCH.saveMenu();
      setMsg("Menu saved.", true);
      setTimeout(() => setMsg(""), 2200);
    });

    outlet.querySelector("[data-menu-reset]")?.addEventListener("click", () => {
      if (!confirm("Reset menu to defaults? All edits will be lost.")) return;
      localStorage.removeItem("clvch_menu");
      location.reload();
    });
  }
}

window.addEventListener("hashchange", route);
window.addEventListener("DOMContentLoaded", route);

// Re-render public pages whenever the city list changes (e.g. after admin edits).
// Skip when we're already on /admin — admin pages re-render themselves on action.
window.addEventListener("clvch:locations-changed", () => {
  if (location.hash.startsWith("#/admin")) return;
  route();
});
window.addEventListener("clvch:home-changed", () => {
  if (location.hash.startsWith("#/admin")) return;
  route();
});

// Anchor-style nav links → scroll to a section on home
const NAV_ANCHORS = {
  navLocations: "locswitch",
  navExperience: "pillars",
};
document.addEventListener("click", (e) => {
  const a = e.target.closest("[id]");
  if (!a || !NAV_ANCHORS[a.id]) return;
  e.preventDefault();
  const targetId = NAV_ANCHORS[a.id];
  const goScroll = () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  };
  if (location.hash !== "" && location.hash !== "#/") {
    location.hash = "#/";
    setTimeout(goScroll, 50);
  } else {
    goScroll();
  }
});
// kick off if DOM already ready
if (document.readyState !== "loading") route();
