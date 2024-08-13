import './custom-element/header';
import './custom-element/footer';
import '../styles/detail.css';
import swRegister from '../swRegister';

const toggleBtn = document.getElementById('toggleBtn');
const nav = document.querySelector('nav ul');
if (toggleBtn && nav) {
  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('show');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const backToTopButton = document.querySelector('.btn-back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      backToTopButton.style.display = window.scrollY > 300 ? 'block' : 'none';
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }
});

const urlParams = new URLSearchParams(window.location.search);
const restaurantId = urlParams.get('id');
const restaurantDetailsContainer = document.querySelector('restaurant-detail');

let db;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('restaurants', 1);

    request.onerror = function handleError(event) {
      console.error('Database error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = function handleSuccess(event) {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = function handleUpgrade(event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains('favorites')) {
        const objectStore = db.createObjectStore('favorites', { keyPath: 'id' });
        objectStore.createIndex('id', 'id', { unique: true });
      }
    };
  });
}

async function addFavoriteRestaurant(restaurant, db) {
  if (!db) {
    console.error('Database instance is not available');
    throw new Error('Database instance is not available');
  }
  const transaction = db.transaction(['favorites'], 'readwrite');
  const store = transaction.objectStore('favorites');
  try {
    await store.add(restaurant);
    await transaction.complete;
    console.log('Restaurant added to favorites:', restaurant);
  } catch (error) {
    console.error('Failed to add restaurant to favorites:', error);
    throw error;
  }
}

async function removeFavoriteRestaurant(restaurantId, db) {
  if (!db) {
    console.error('Database instance is not available');
    throw new Error('Database instance is not available');
  }
  const transaction = db.transaction(['favorites'], 'readwrite');
  const store = transaction.objectStore('favorites');
  try {
    await store.delete(restaurantId);
    await transaction.complete;
    console.log('Restaurant removed from favorites:', restaurantId);
  } catch (error) {
    console.error('Failed to remove restaurant from favorites:', error);
    throw error;
  }
}

async function getRestaurantDetail(id) {
  try {
    const response = await fetch(`https://restaurant-api.dicoding.dev/detail/${id}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.restaurant;
  } catch (error) {
    displayErrorMessage('Error fetching restaurant details. Please try again later.');
    console.error('Error fetching restaurant details:', error);
    return null;
  }
}

function displayErrorMessage(message) {
  const errorMessageElement = document.getElementById('error-message');
  if (errorMessageElement) {
    errorMessageElement.textContent = message;
  }
}

async function toggleFavorite(restaurant) {
  const favoriteButton = document.querySelector('.favorite-button');
  const isFavorite = favoriteButton.textContent === 'Add to Favorites';

  try {
    if (isFavorite) {
      await addFavoriteRestaurant(restaurant, db);
      favoriteButton.textContent = 'Remove from Favorites';
    } else {
      await removeFavoriteRestaurant(restaurant.id, db);
      favoriteButton.textContent = 'Add to Favorites';
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
  }
}

function createRestaurantDetailCard(restaurant) {
  const card = document.createElement('div');
  card.classList.add('restaurant-detail');

  const favoriteButton = document.createElement('button');
  favoriteButton.classList.add('favorite-button');
  favoriteButton.textContent = 'Add to Favorites';
  favoriteButton.addEventListener('click', () => {
    toggleFavorite(restaurant);
  });

  const image = document.createElement('img');
  image.classList.add('restaurant-image');
  image.src = `https://restaurant-api.dicoding.dev/images/small/${restaurant.pictureId}`;
  image.srcset = `
    https://restaurant-api.dicoding.dev/images/small/${restaurant.pictureId} 480w,
    https://restaurant-api.dicoding.dev/images/medium/${restaurant.pictureId} 800w,
    https://restaurant-api.dicoding.dev/images/large/${restaurant.pictureId} 1200w
  `;
  image.sizes = '(max-width: 600px) 480px, (max-width: 1200px) 800px, 1200px';
  image.alt = restaurant.name;
  image.loading = 'lazy';

  const name = document.createElement('h3');
  name.textContent = restaurant.name;

  const address = document.createElement('h4');
  address.textContent = `Address: ${restaurant.address}`;

  const city = document.createElement('h2');
  city.textContent = `City: ${restaurant.city}`;

  const description = document.createElement('p');
  description.textContent = restaurant.description;

  const foodMenu = document.createElement('div');
  foodMenu.classList.add('food-menu');
  foodMenu.innerHTML = `
    <p class="menu-title">Food Menu:</p>
    <ul class="menu-list">
      ${restaurant.menus.foods.map((food) => `<li>${food.name}</li>`).join('')}
    </ul>
  `;

  const drinkMenu = document.createElement('div');
  drinkMenu.classList.add('drink-menu');
  drinkMenu.innerHTML = `
    <p class="menu-title">Drink Menu:</p>
    <ul class="menu-list">
      ${restaurant.menus.drinks.map((drink) => `<li>${drink.name}</li>`).join('')}
    </ul>
  `;

  const reviews = document.createElement('div');
  reviews.classList.add('reviews');
  reviews.innerHTML = '<h3>Customer Reviews</h3>';
  restaurant.customerReviews.forEach((review) => {
    const reviewItem = document.createElement('div');
    reviewItem.classList.add('review-item');
    reviewItem.innerHTML = `
      <p><strong>${review.name}</strong> - ${review.date}</p>
      <p>${review.review}</p>
    `;
    reviews.appendChild(reviewItem);
  });

  const reviewForm = document.createElement('form');
  reviewForm.classList.add('review-form');
  reviewForm.innerHTML = `
    <h3>Add Review</h3>
    <input type="text" id="reviewer-name" name="name" placeholder="Input your name" required>
    <textarea id="review-content" name="review-content" placeholder="Input your review" required></textarea>
    <button type="submit">Submit</button>
  `;

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = reviewForm.querySelector('#reviewer-name').value;
    const review = reviewForm.querySelector('#review-content').value;
    const newReview = await submitReview(restaurant.id, name, review);
    if (newReview) {
      addReviewToUI(newReview);
    }
  });

  card.appendChild(image);
  card.appendChild(name);
  card.appendChild(address);
  card.appendChild(city);
  card.appendChild(description);
  card.appendChild(foodMenu);
  card.appendChild(drinkMenu);
  card.appendChild(reviews);
  card.appendChild(reviewForm);
  card.appendChild(favoriteButton);

  return card;
}

async function submitReview(restaurantId, name, review) {
  try {
    const response = await fetch('https://restaurant-api.dicoding.dev/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: restaurantId,
        name,
        review,
      }),
    });

    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return { name, review, date: new Date().toDateString() };
  } catch (error) {
    displayErrorMessage('Error submitting review. Please try again later.');
    console.error('Error submitting review:', error);
    return null;
  }
}

function addReviewToUI(review) {
  const reviewItem = document.createElement('div');
  reviewItem.classList.add('review-item');
  reviewItem.innerHTML = `
    <p><strong>${review.name}</strong> - ${review.date}</p>
    <p>${review.review}</p>
  `;
  const reviewsContainer = document.querySelector('.reviews');
  reviewsContainer.appendChild(reviewItem);
}

let hasRendered = false;

async function renderRestaurantDetails() {
  if (hasRendered) return;
  hasRendered = true;

  try {
    await openDatabase();
  } catch (error) {
    displayErrorMessage('Failed to open the database.');
    console.error('Failed to open the database:', error);
    return;
  }

  if (!restaurantId) {
    displayErrorMessage('No restaurant ID found.');
    return;
  }

  const restaurant = await getRestaurantDetail(restaurantId);
  if (!restaurantDetailsContainer) {
    console.error('Restaurant details container not found');
    return;
  }
  restaurantDetailsContainer.innerHTML = '';

  if (restaurant) {
    const detailCard = createRestaurantDetailCard(restaurant);
    restaurantDetailsContainer.appendChild(detailCard);
  } else {
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Failed to load restaurant details. Please try again later.';
    restaurantDetailsContainer.appendChild(errorMessage);
  }
}

swRegister();

window.addEventListener('DOMContentLoaded', renderRestaurantDetails);

// export functions for testing
export { addFavoriteRestaurant, removeFavoriteRestaurant };
