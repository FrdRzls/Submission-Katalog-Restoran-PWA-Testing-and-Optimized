Feature('Favorite Restaurant');
 
Before(({ I }) => {
  I.amOnPage('/');
});
 
Scenario('like a restaurant', async ({ I }) => {
  // Navigate to the first restaurant's detail page
  I.seeElement('.restaurant-card a.detail-link');
  I.click(locate('.restaurant-card a.detail-link').first());
 
  // Wait for the detail page to load and like the restaurant
  I.waitForElement('.favorite-button', 5);
  I.see('Add to Favorites', '.favorite-button');
  I.click('.favorite-button');
 
  // Verify that the restaurant is liked
  I.see('Remove from Favorites', '.favorite-button');
});

Scenario('verify unliked restaurant does not appear in favorites', async ({ I }) => {
  // Navigate to the first restaurant's detail page
  I.seeElement('.restaurant-card a.detail-link');
  I.click(locate('.restaurant-card a.detail-link').first());

  // Wait for the detail page to load and like the restaurant
  I.waitForElement('.favorite-button', 5);
  I.see('Add to Favorites', '.favorite-button');
  I.click('.favorite-button');

  // Verify that the restaurant is liked
  I.see('Remove from Favorites', '.favorite-button');

  // Unlike the restaurant
  I.click('.favorite-button');

  // Verify that the restaurant is unliked
  I.see('Add to Favorites', '.favorite-button');

  // Navigate to the favorites page
  I.click('Favorites');

  // Wait for the favorites page to load
  I.waitForText('Favorite Restaurants', 5);

  // Verify that the unliked restaurant does not appear in favorites
  I.dontSeeElement('.restaurant-card');
});