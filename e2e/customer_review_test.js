Feature('Customer Review');

Before(({ I }) => {
  I.amOnPage('/');
});

Scenario('add a customer review', async ({ I }) => {
  // Navigate to the first restaurant's detail page
  I.seeElement('.restaurant-card a.detail-link');
  I.click(locate('.restaurant-card a.detail-link').first());

  // Wait for the detail page to load
  I.waitForElement('.restaurant-detail-card', 5);

  // Add customer review
  const reviewerName = 'John Doe';
  const reviewContent = 'This restaurant is amazing!';
  I.fillField('#reviewer-name', reviewerName);
  I.fillField('#review-content', reviewContent);
  I.click('Submit');

  // Verify that the review is added
  I.waitForText(reviewerName, 5, '.reviews');
  I.waitForText(reviewContent, 5, '.reviews');
});
