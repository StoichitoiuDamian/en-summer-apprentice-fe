// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}
// HTML templates
function getHomePageTemplate() {
  return `
   <div id="content" >
      <img src="./src/assets/partyv2.png" alt="summer">
      <div class="events flex items-center justify-center flex-wrap">
      </div>
    </div>
  `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content">
    <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
    </div>
  `;
}

function setupNavigationEvents() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    });
  });
}

function setupMobileMenuEvent() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function setupPopstateEvent() {
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.pathname;
    renderContent(currentUrl);
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);
}


function renderHomePage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();
  // Sample hardcoded event data
  const eventData = {
    id: 1,
    description: 'Sample event description.',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    name: 'Untold',
    location: "Cluj-Napoca",
    ticketCategories: [
      { id: 1, description: 'General Admission' },
      { id: 2, description: 'VIP' },
    ],
  };
  // Create the event card element
  const eventCard = document.createElement('div');
  eventCard.classList.add('event-card'); 
  // Create the event content markup
  const contentMarkup = `
    <header>
      <h2 class="event-title text-2xl font-bold">${eventData.name}</h2>
    </header>
    <div class="container">
    <div class="image-container">
    <img src="${eventData.img}" alt="${eventData.name}" class="event-image w-full height-200 rounded object-cover mb-4">
    </div>
    <div class="event-info">
        <h2>Event:${eventData.name}</h2>
        <h2>Location:${eventData.location}</h2>
        <button class="buy-button">Buy</button>
    </div>
</div>
  `;

  eventCard.innerHTML = contentMarkup;
  const eventsContainer = document.querySelector('.events');
  // Append the event card to the events container
  eventsContainer.appendChild(eventCard);
}

function renderOrdersPage(categories) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();
}

// Render content based on URL
function renderContent(url) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = '';

  if (url === '/') {
    renderHomePage();
  } else if (url === '/orders') {
    renderOrdersPage()
  }
}

// Call the setup functions
setupNavigationEvents();
setupMobileMenuEvent();
setupPopstateEvent();
setupInitialPage();
