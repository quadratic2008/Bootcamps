const API_URL = 'http://127.0.0.1:5000/api/live-scores';

const container = document.getElementById("scores");
const loading = document.getElementById("loading");
const noMatches = document.getElementById("no-matches");

async function fetchLiveScores() {
  try {
    showLoading(true);
    const response = await fetch(API_URL);
    const data = await response.json();
    const matches = data.response;

    container.innerHTML = "";

    // Group matches by league
    const grouped = {};
    matches.forEach(match => {
      const leagueName = match.league?.name || "Other Leagues";
      if (!grouped[leagueName]) grouped[leagueName] = [];
      grouped[leagueName].push(match);
    });

    Object.entries(grouped).forEach(([league, groupMatches]) => {
      const section = document.createElement("section");
      section.innerHTML = `<h2 class="league-title">${league}</h2>`;

      groupMatches.forEach(match => {
        const fixture = match.fixture;
        const venue = fixture.venue?.name || "Unknown Venue";
        const city = fixture.venue?.city || "Unknown City";
        const status = fixture.status?.long || "Unknown";
        const date = new Date(fixture.date).toLocaleString();

        const home = match.teams.home.name;
        const away = match.teams.away.name;
        const homeLogo = match.teams.home.logo;
        const awayLogo = match.teams.away.logo;
        const scoreHome = match.goals.home ?? "-";
        const scoreAway = match.goals.away ?? "-";

        const card = document.createElement("div");
        card.className = "match";
        card.setAttribute("data-teams", `${home.toLowerCase()} ${away.toLowerCase()}`);

        // Countdown logic
        const matchTime = new Date(fixture.timestamp * 1000);
        const now = new Date();
        let countdown = '';
        if (now < matchTime) {
          const diff = Math.floor((matchTime - now) / 60000);
          countdown = `<p><strong>Starts In:</strong> ${diff} minutes</p>`;
        }

        // Goal scorers (if available)
        let scorersHTML = '';
        const goals = match.events?.filter(ev => ev.type === "Goal") || [];
        if (goals.length > 0) {
          scorersHTML = '<p><strong>Goals:</strong><ul>';
          goals.forEach(goal => {
            const name = goal.player?.name || "Unknown Player";
            const team = goal.team?.name || "Unknown Team";
            scorersHTML += `<li>${name} (${team})</li>`;
          });
          scorersHTML += '</ul></p>';
        }

        card.innerHTML = `
          <div class="teams">
            <img src="${homeLogo}" alt="${home}" class="logo" />
            <span class="vs">${home}</span>
            <span>vs</span>
            <span class="vs">${away}</span>
            <img src="${awayLogo}" alt="${away}" class="logo" />
          </div>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Score:</strong> ${scoreHome} - ${scoreAway}</p>
          <p><strong>Venue:</strong> ${venue}, ${city}</p>
          <p><strong>Date:</strong> ${date}</p>
          ${countdown}
          ${scorersHTML}
        `;
        section.appendChild(card);
      });

      container.appendChild(section);
    });

    filterMatches();
  } catch (error) {
    container.innerHTML = `<p style="color:red;">Error loading scores: ${error.message}</p>`;
  } finally {
    showLoading(false);
  }
}

function filterMatches() {
  const searchText = document.getElementById("search").value.toLowerCase();
  const allMatches = document.querySelectorAll('.match');
  let anyVisible = false;

  allMatches.forEach(match => {
    const teams = match.getAttribute("data-teams");
    const matchVisible = teams.includes(searchText);
    match.style.display = matchVisible ? '' : 'none';
    if (matchVisible) anyVisible = true;
  });

  noMatches.style.display = anyVisible ? 'none' : 'block';
}

function showLoading(isLoading) {
  loading.style.display = isLoading ? 'block' : 'none';
}

fetchLiveScores();
setInterval(fetchLiveScores, 15000);
document.getElementById("search").addEventListener('input', filterMatches);
