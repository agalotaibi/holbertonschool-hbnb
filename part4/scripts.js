document.addEventListener('DOMContentLoaded', () => {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (loginLink) {
    if (token) {
      loginLink.style.display = 'block';
      loginLink.textContent = 'Logout';
      loginLink.href = '#';
      
      loginLink.addEventListener('click', (event) => {
        event.preventDefault();
        document.cookie = "token=; path=/; max-age=0";
        window.location.reload();
      });
    } else {
      loginLink.style.display = 'block';
      loginLink.textContent = 'Login';
      loginLink.href = 'login.html';
    }
  }

  // --- PAGE ROUTING LOGIC ---

    if (document.getElementById('places-list')) {
      fetchPlaces(token);
    
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
      priceFilter.addEventListener('change', (e) => filterPlaces(e.target.value));
    }

    const searchButton = document.querySelector('.search-button');
    const searchInput = document.getElementById('search-location'); // Make sure this ID matches your HTML

    if (searchButton && searchInput) {
      searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch(searchInput.value);
        }
      });
    }
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const placeDetailsContainer = document.getElementById('place-details');
  if (placeDetailsContainer) {
    const placeId = getPlaceIdFromURL();
    if (placeId) {
      fetchPlaceDetails(token, placeId);
    } else {
      placeDetailsContainer.innerHTML = '<p>Place not found.</p>';
    }
  }

  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    if (!token) {
      window.location.href = 'index.html';
    } else {
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

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
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

    const placeResponse = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers: headers
    });

    if (!placeResponse.ok) {
      document.getElementById('place-details').innerHTML = '<p>Error loading place.</p>';
      return;
    }

    const place = await placeResponse.json();

    let reviews = [];
    try {
      const reviewsResponse = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}/reviews`, {
        method: 'GET',
        headers: headers
      });
      if (reviewsResponse.ok) {
        reviews = await reviewsResponse.json();
      }
    } catch (err) {
      console.warn("Reviews endpoint failed or empty.");
    }

    displayPlaceDetails(place, reviews, token);

  } catch (error) {
    console.error('Error fetching details:', error);
  }
}

function displayPlaceDetails(place, reviews, token) {
  const placeDetailsContainer = document.getElementById('place-details');
  placeDetailsContainer.innerHTML = ''; 

  const infoDiv = document.createElement('div');
  infoDiv.className = 'place-info';
  
  const hostName = place.owner ? `${place.owner.first_name} ${place.owner.last_name}` : 'Unknown Host';
  
  const amenitiesList = place.amenities && place.amenities.length > 0 
    ? place.amenities.map(a => a.name).join(', ') 
    : 'None listed';

  infoDiv.innerHTML = `
    <h1>${place.title}</h1>
    <img src="images/place1.jpg" alt="${place.title}" style="width:100%; max-height:500px; object-fit:cover; border-radius:10px; margin-bottom:20px;">
    <p><strong>Host:</strong> ${hostName}</p>
    <p><strong>Price:</strong> $${place.price} per night</p>
    <p><strong>Description:</strong> ${place.description}</p>
    <p><strong>Amenities:</strong> ${amenitiesList}</p>
  `;
  
  placeDetailsContainer.appendChild(infoDiv);

  const addReviewBtn = document.getElementById('add-review-btn');
  if (addReviewBtn) {
    if (token) {
      addReviewBtn.style.display = 'inline-block';
      addReviewBtn.href = `add_review.html?place_id=${place.id}`;
    } else {
      addReviewBtn.style.display = 'none';
    }
  }

  const reviewsList = document.getElementById('reviews-list');
  if (reviewsList) {
    reviewsList.innerHTML = ''; // Clear old reviews
    
    if (reviews && reviews.length > 0) {
      reviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card';
        
        let reviewerName = 'Anonymous';
        if (review.user) {
            reviewerName = review.user.first_name || 'User';
        } else if (review.user_id) {
            reviewerName = 'User ' + review.user_id.substring(0, 4);
        }

        reviewCard.innerHTML = `
          <h3>${reviewerName}</h3>
          <p>${review.text}</p>
          <p style="font-size: 0.8em; color: gray;">${new Date(review.created_at || Date.now()).toLocaleDateString()}</p>
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
    const decoded = parseJwt(token);
    const currentUserId = decoded ? decoded.sub : null; 


    const payload = {
        place_id: placeId,
        text: reviewText,
        user_id: currentUserId,
        rating: 5 
    };

    const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('Review submitted successfully!');
      window.location.assign(`place.html?id=${placeId}`);
    } else {
      // --- IMPROVED ERROR HANDLING ---
      const errorData = await response.json();
      

      const serverMessage = errorData.msg || errorData.error || errorData.message;
      
      if (serverMessage) {
          alert('Failed: ' + serverMessage);
      } else {
          alert('Failed: An unknown error occurred.');
      }
      
      console.error("Server Error Details:", errorData);
    }
  } catch (error) {
    console.error('Network Error:', error);
    alert('An error occurred. Please check your connection.');
  }
}

// --- SEARCH FUNCTION ---
function performSearch(query) {
  const lowerCaseQuery = query.toLowerCase().trim();
  const cards = document.querySelectorAll('.place-card');

  cards.forEach(card => {
    const title = card.querySelector('h2').textContent.toLowerCase();
    
    if (title.includes(lowerCaseQuery)) {

      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}