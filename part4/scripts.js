document.addEventListener('DOMContentLoaded', () => {
  // --- GLOBAL: CHECK AUTHENTICATION ---
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (loginLink) {
    if (token) {
      // User is Logged In: Change button to "Logout"
      loginLink.style.display = 'block';
      loginLink.textContent = 'Logout';
      loginLink.href = '#';
      
      loginLink.addEventListener('click', (event) => {
        event.preventDefault();
        document.cookie = "token=; path=/; max-age=0"; // Delete cookie
        window.location.reload();
      });
    } else {
      // User is Logged Out: Show "Login"
      loginLink.style.display = 'block';
      loginLink.textContent = 'Login';
      loginLink.href = 'login.html';
    }
  }

  // --- PAGE ROUTING LOGIC ---

  // 1. INDEX PAGE (List of Places)
  if (document.getElementById('places-list')) {
    fetchPlaces(token);
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
      priceFilter.addEventListener('change', (e) => filterPlaces(e.target.value));
    }
  }

  // 2. LOGIN PAGE
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // 3. PLACE DETAILS PAGE
  const placeDetailsContainer = document.getElementById('place-details');
  if (placeDetailsContainer) {
    const placeId = getPlaceIdFromURL();
    if (placeId) {
      fetchPlaceDetails(token, placeId);
    } else {
      placeDetailsContainer.innerHTML = '<p>Place not found.</p>';
    }
  }

  // 4. ADD REVIEW PAGE
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    if (!token) {
      window.location.href = 'index.html'; // Security redirect
    } else {
      // Get Place ID from URL (e.g. add_review.html?place_id=123)
      const urlParams = new URLSearchParams(window.location.search);
      const placeId = urlParams.get('place_id');
      console.log("Current Place ID:", placeId);
      if (!placeId) {
      alert('Error: Place ID missing from URL');
      window.location.href = 'index.html';
    }

      reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const reviewText = document.getElementById('review-text').value;
        await submitReview(token, placeId, reviewText);
      });
    }
  }
});

// --- HELPER FUNCTIONS ---

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function getPlaceIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// --- API ACTIONS ---

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      document.cookie = `token=${data.access_token}; path=/; SameSite=Strict`;
      window.location.href = 'index.html';
    } else {
      alert('Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}

async function fetchPlaces(token) {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/v1/places/');
    if (response.ok) {
      const places = await response.json();
      displayPlaces(places);
    }
  } catch (err) { console.error(err); }
}

function displayPlaces(places) {
  const list = document.getElementById('places-list');
  list.innerHTML = '';
  places.forEach(place => {
    const div = document.createElement('div');
    div.className = 'place-card';
    div.dataset.price = place.price;
    div.innerHTML = `
      <img src="images/place1.jpg" alt="${place.title}">
      <h2>${place.title}</h2>
      <p>Price: $${place.price} per night</p>
      <a href="place.html?id=${place.id}" class="details-button">View Details</a>
    `;
    list.appendChild(div);
  });
}

function filterPlaces(price) {
  const cards = document.querySelectorAll('.place-card');
  cards.forEach(card => {
    if (price === 'all' || parseInt(card.dataset.price) <= parseInt(price)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// --- PLACE DETAILS LOGIC ---

async function fetchPlaceDetails(token, placeId) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers: headers
    });

    if (response.ok) {
      const place = await response.json();
      displayPlaceDetails(place, token);
    } else {
      document.getElementById('place-details').innerHTML = '<p>Error loading place.</p>';
    }
  } catch (error) {
    console.error('Error fetching details:', error);
  }
}

function displayPlaceDetails(place, token) {
  const container = document.getElementById('place-details');
  container.innerHTML = ''; // Clear loading text

  // 1. Create Main Info Section
  const infoDiv = document.createElement('div');
  infoDiv.className = 'place-info';
  
  const hostName = place.owner ? `${place.owner.first_name} ${place.owner.last_name}` : 'Unknown Host';
  const amenitiesList = place.amenities && place.amenities.length > 0 ? place.amenities.join(', ') : 'None listed';

  infoDiv.innerHTML = `
    <h1>${place.title}</h1>
    <img src="images/place1.jpg" alt="${place.title}" style="width:100%; border-radius:10px; margin-bottom:20px; object-fit:cover;">
    <p><strong>Host:</strong> ${hostName}</p>
    <p><strong>Price:</strong> $${place.price} per night</p>
    <p><strong>Description:</strong> ${place.description}</p>
    <p><strong>Amenities:</strong> ${amenitiesList}</p>
  `;
  container.appendChild(infoDiv);

  // 2. Configure "Add Review" Button
  const addReviewBtn = document.getElementById('add-review-btn');
  if (addReviewBtn) {
    if (token) {
      addReviewBtn.style.display = 'inline-block';
      // Set the link to include the place ID
      addReviewBtn.href = `add_review.html?place_id=${place.id}`;
    } else {
      addReviewBtn.style.display = 'none';
    }
  }

  // 3. Populate Reviews
  const reviewsList = document.getElementById('reviews-list');
  if (reviewsList) {
    reviewsList.innerHTML = ''; // Clear old reviews
    if (place.reviews && place.reviews.length > 0) {
      place.reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        reviewCard.innerHTML = `
          <h3>${review.user ? review.user.first_name : 'User'}</h3>
          <p>${review.text}</p>
        `;
        reviewsList.appendChild(reviewCard);
      });
    } else {
      reviewsList.innerHTML = '<p>No reviews yet.</p>';
    }
  }
}

async function submitReview(token, placeId, reviewText) {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        place_id: placeId,
        text: reviewText,
        rating: 5 // Default rating required by some backends
      })
    });

    if (response.ok) {
      alert('Review submitted successfully!');
      
      // DEBUG: Log the ID to the console to ensure it's not null
      console.log("Redirecting to place id:", placeId);

      // FIX 1: Use .assign() instead of .href (more reliable)
      window.location.assign(`place.html?id=${placeId}`);
      
    } else {
      const errorData = await response.json();
      alert('Failed: ' + (errorData.msg || response.statusText));
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('An error occurred. Check the Console.');
  }
}