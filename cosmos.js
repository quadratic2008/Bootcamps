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

    matches.forEach(match => {
      const fixture = match.fixture;
      const venue = fixture.venue?.name || "Unknown Venue";
      const city = fixture.venue?.city || "Unknown City";
      const status = fixture.status?.long || "Unknown";
      const date = new Date(fixture.date).toLocaleString();

      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const scoreHome = match.goals.home ?? "-";
      const scoreAway = match.goals.away ?? "-";

      const card = document.createElement("div");
      card.className = "match";
      card.setAttribute("data-teams", `${home.toLowerCase()} ${away.toLowerCase()}`);

      card.innerHTML = `
        <h3>${home} vs ${away}</h3>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Score:</strong> ${scoreHome} - ${scoreAway}</p>
        <p><strong>Venue:</strong> ${venue}, ${city}</p>
        <p><strong>Date:</strong> ${date}</p>
      `;
      container.appendChild(card);
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
