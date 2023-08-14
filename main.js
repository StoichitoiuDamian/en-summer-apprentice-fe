import toastr from 'toastr';

// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}


// HTML templates
function getHomePageTemplate() {
  return `
   <div id="content" >
      <img class="principaleImage" src="./src/assets/partyv2.png" alt="summer">
      <div class="search-container">
        <div class="search-bar">
          <input type="text" id="searchInput" placeholder="Search event or location">
          <button id="searchButton" class="forSearchButton">Search</button>
        </div>
      </div>
      <div class="events flex items-center justify-center flex-wrap">
      </div>
    </div>
  `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content">
      <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
      <div class="orders-container">
      </div>
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
  const searchButton = document.getElementById('searchButton');
  searchButton.addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    performCombinedSearch(searchInput);
  });
}

async function performCombinedSearch(searchTerm) {
  const eventData = await fetchEvents();
  const filteredEvents = eventData.filter(
    event => event.eventName.toLowerCase().includes(searchTerm) || event.venueLocation.toLowerCase().includes(searchTerm)
  );

  const eventsContainer = document.querySelector('.events');
  eventsContainer.innerHTML = '';

  filteredEvents.forEach(event => {
    const eventCard = createEventCard(event);
    eventsContainer.appendChild(eventCard);
  });
}

function handleOrderResponse(success) {
  if (success) {
    console.log('Order was successful.');
  } else {
    console.log('Order failed.');
  }
}

async function createOrder(customerId, categoryId, numberOfTickets,totalPrice) {
  const data = {
    ticketCategory: categoryId,                
    numberOfTickets: numberOfTickets,
    totalPrice:totalPrice * numberOfTickets,
    orderedAt : new Date()
  };

  try {
    console.log('Sending POST request...');
    const response = await fetch(`http://localhost:8080/orders/${customerId}`, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    console.log('POST request successful.');
    return true;
  } catch (error) {
    console.error('Error making POST request:', error);
    return false;
  }
}
//primul request de GETALLEVENTS

async function fetchEvents() {
  try {
    const response = await fetch('http://localhost:8080/showAllEventsDto');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const eventData = await response.json();

    console.log(eventData);
   
    eventData.forEach((event, index) => {
      event.img = `./src/assets/event_${index + 1}.png`;
    });

    return eventData;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

function createEventCard(event) {
  const eventCard = document.createElement('div');
  eventCard.classList.add('event-card');

  const ticketMarkup = event.ticketCategories.map(category => category.price).join(', ');
  const descriptionCategoryMarkup = event.ticketCategories.map(category => category.descriptionTicketCategory).join(', ');

  const isSingleTicket = event.ticketCategories.length === 1;

  const formattedStartDate = event.startDate.substring(0, 10);
  const formattedEndDate = event.endDate.substring(0, 10);

  const contentMarkup = `
    <div class="event-card">
      <div class="image-container">
        <img src="${event.img}" alt="${event.eventName}" class="event-image rounded object-cover mb-4">
      </div>
      <div class="event-info">
        <h2 class="event-title">${event.eventName}</h2>
        <p class="event-date">${formattedStartDate} - ${formattedEndDate}</p>
        <p class="event-price">$${ticketMarkup}</p>
        <p class="event-description">${descriptionCategoryMarkup}</p>
        <p class="venue-location">${event.venueLocation}</p> <!-- Adaugă venueLocation -->
        ${
          !isSingleTicket
            ? `
            <select id="ticketType" class="ticket-type">
            ${event.ticketCategories.map(category => `<option value="${category.ticketCategoryID}">${category.descriptionTicketCategory}</option>`).join('')}
            </select>
            `
            : ''
        }
        <div class="label-and-input">
          <label for="ticketQuantity">Number of Tickets:</label>
          <input type="number" id="ticketQuantity" class="ticket-quantity" min="1" value="1">
        </div>
        <button class="buy-button ${isSingleTicket ? 'buy-single' : ''}" 
        data-event-id="${event.eventID}"
        total-price="${event.ticketCategories[0].price}"
        data-category-id="${event.ticketCategories[0].ticketCategoryID}">Buy Tickets
        </button>
      </div>
    </div>
  `;

  eventCard.innerHTML = contentMarkup;

  console.log(eventCard);
  return eventCard;
}



async function renderHomePage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();

  const eventData = await fetchEvents();

  const eventsContainer = document.querySelector('.events');
  eventData.forEach(event => {
    const eventCard = createEventCard(event);
    eventsContainer.appendChild(eventCard);
  });

  const searchButton = document.getElementById('searchButton');
  searchButton.addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredEvents = eventData.filter(event => event.eventName.toLowerCase().includes(searchInput));
    eventsContainer.innerHTML = '';
    filteredEvents.forEach(event => {
      const eventCard = createEventCard(event);
      eventsContainer.appendChild(eventCard);
    });
  });

  const buyButtons = document.querySelectorAll('.buy-button');
  console.log(buyButtons);
  buyButtons.forEach(button => {
    button.addEventListener('click', async () => {
      console.log('Button clicked!');
      const eventId = parseInt(button.dataset.eventId);
      const categoryId = button.getAttribute('data-category-id');
      const ticketQuantityInput = button.parentElement.querySelector('.ticket-quantity');
      const numberOfTickets = parseInt(ticketQuantityInput.value);
    
    
      const ticketTypeSelect = button.parentElement.querySelector('.ticket-type');
      const selectedCategoryId = parseInt(ticketTypeSelect.value);
  
      console.log('eventId:', eventId);
      console.log('categoryId:', categoryId);
      console.log('selectedCategoryId:', selectedCategoryId);
  
      const selectedEvent = eventData.find(event => event.eventID === eventId);
      console.log('selectedEvent:', selectedEvent);
      if (!selectedEvent) {
        console.error('Selected event not found.');
        return;
      }
        
      const selectedCategory = selectedEvent.ticketCategories.find(category => category.ticketCategoryID === selectedCategoryId);
      console.log('selectedCategory:', selectedCategory);
      if (!selectedCategory) {
        console.error('Selected category not found.');
        return;
      }
        
      const numberOfPrice = selectedCategory.price;
      const customerId = 1;

  
      console.log('Buy button clicked. Sending POST request...');
      const success = await createOrder(customerId, categoryId, numberOfTickets, numberOfPrice);
      handleOrderResponse(success);
  
      const selectMenu = button.parentElement.querySelector('.select-menu');
      if (selectMenu) {
        selectMenu.style.display = selectMenu.style.display === 'block' ? 'none' : 'block';
      }
    });
  });
}


async function renderOrdersPage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();

  const customerId = 1; // Setează ID-ul clientului
  
  try {
    const response = await fetch(`http://localhost:8080/ordersDto/${customerId}/details`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const ordersData = await response.json();

    const ordersContainer = document.querySelector('.orders-container');
    ordersData.forEach(order => {
      const orderElement = createOrderElement(order);
      ordersContainer.appendChild(orderElement);

      // Adaugă evenimentul de clic pentru butonul de ștergere
      const deleteButton = orderElement.querySelector('.delete-order-button');
      deleteButton.addEventListener('click', async () => {
        const orderId = parseInt(deleteButton.getAttribute('data-order-id'));
        const deleteResponse = await deleteOrder(orderId);
        if (deleteResponse) {
          ordersContainer.removeChild(orderElement);
        }
      });

      // Adaugă evenimentul de clic pentru butonul de actualizare
      const updateButton = orderElement.querySelector('.update-order-button');
      updateButton.addEventListener('click', () => {
        showUpdateForm(order);
      });
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

function showUpdateForm(order) {
  const formMarkup = `
    <form id="update-order-form">
      <label for="ticketCategory">Ticket Category:</label>
      <input type="text" id="ticketCategory" value="${order.ticketCategory}" required>
      <label for="numberOfTickets">Number of Tickets:</label>
      <input type="number" id="numberOfTickets" value="${order.numberOfTickets}" required>
      <label for="totalPrice">Total Price:</label>
      <input type="number" id="totalPrice" value="${order.totalPrice}" required>
      <button type="submit">Update Order</button>
    </form>
  `;

  const formContainer = document.querySelector('#content');
  formContainer.innerHTML = formMarkup;

  const updateForm = document.querySelector('#update-order-form');
  updateForm.addEventListener('submit', async event => {
    event.preventDefault();
    const updatedOrder = {
      orderID: order.orderID,
      ticketCategory: updateForm.querySelector('#ticketCategory').value,
      numberOfTickets: parseInt(updateForm.querySelector('#numberOfTickets').value),
      totalPrice: parseFloat(updateForm.querySelector('#totalPrice').value)
    };

    const success = await updateOrder(updatedOrder);
    if (success) {
      renderOrdersPage();
    }
  });
}

async function updateOrder(updatedOrder) {
  try {
    const response = await fetch(`http://localhost:8080/OrderUpdate/${updatedOrder.orderID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedOrder)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    console.log('Order updated successfully.');
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}

async function deleteOrder(orderId) {
  try {
    const response = await fetch(`http://localhost:8080/deleteOrderById/${orderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    console.log('Order deleted successfully.');
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
}

function createOrderElement(order) {
  const orderElement = document.createElement('div');
  orderElement.classList.add('order');

  const formattedDate = new Date(order.orderedAT).toLocaleString();

  const contentMarkup = `
    <div class="order-card">
      <p>Order ID: ${order.orderID}</p>
      <p>Date: ${formattedDate}</p>
      <p>Ticket Category: ${order.ticketCategory}</p>
      <p>Number of Tickets: ${order.numberOfTickets}</p>
      <p>Total Price: $${order.totalPrice}</p>
      <button class="delete-order-button" data-order-id="${order.orderID}">Delete</button>
      <button class="update-order-button" data-order-id="${order.orderID}">Update</button>
    </div>
  `;

  orderElement.innerHTML = contentMarkup;
  return orderElement;
}

// Render content based on URL
function renderContent(url) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = '';

  if (url === '/') {
    renderHomePage();
  } else if (url === '/orders') {
    renderOrdersPage();
  }
}

// Call the setup functions
setupNavigationEvents();
setupMobileMenuEvent();
setupPopstateEvent();
setupInitialPage();
