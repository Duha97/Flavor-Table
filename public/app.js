// Search by ingredients
async function searchRecipes() {
  const input = document.getElementById('ingredientInput').value;
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  try {
    const res = await fetch(`/recipes/search?ingredients=${input}`);
    const data = await res.json();

    if (data.length === 0) {
      resultsContainer.textContent = 'No recipes found.';
      return;
    }

    data.forEach(recipe => {
  const div = document.createElement('div');
  div.className = 'recipe';
  div.innerHTML = `
    <h2>${recipe.title}</h2>
    <img src="${recipe.image}" alt="${recipe.title}" />
    <p><strong>Used:</strong> ${recipe.usedIngredients.join(', ')}</p>
    <p><strong>Missed:</strong> ${recipe.missedIngredients.join(', ')}</p>
  `;

  const button = document.createElement('button');
  button.textContent = 'Save to Favorites';
  button.className = 'save-btn';
  button.dataset.recipe = JSON.stringify(recipe);
  div.appendChild(button);

  resultsContainer.appendChild(div);
});


  } catch (err) {
    resultsContainer.textContent = 'Error fetching recipes.';
  }
}

// Random recipe
async function getRandomRecipe() {
  const container = document.getElementById('randomRecipe');
  container.innerHTML = '';

  try {
    const res = await fetch('/recipes/random');
    const recipe = await res.json();

    container.innerHTML = `
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}" />
      <p><strong>Instructions:</strong> ${recipe.instructions}</p>
      <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
    `;

    const button = document.createElement('button');
    button.textContent = 'Save to Favorites';
    button.className = 'random-save-btn';
    button.dataset.recipe = JSON.stringify(recipe);

    container.appendChild(button);


  } catch (err) {
    container.textContent = 'Failed to load recipe.';
  }
}

// Save to localStorage
function saveToFavorites(recipe) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.push(recipe);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  alert('Recipe saved!');
}

// Load favorites
if (window.location.pathname.includes('favorites.html')) {
  const container = document.getElementById('favorites');
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  if (favorites.length === 0) {
    container.textContent = 'No favorites saved.';
  } else {
    favorites.forEach(recipe => {
      const div = document.createElement('div');
      div.className = 'recipe';
      div.innerHTML = `
        <h2>${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}" />
        <button onclick='removeFavorite("${recipe.title}")'>Remove</button>
      `;
      container.appendChild(div);
    });
  }
}

function removeFavorite(title) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(r => r.title !== title);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  location.reload();
}

document.getElementById('results').addEventListener('click', (e) => {
  if (e.target.classList.contains('save-btn')) {
    const recipe = JSON.parse(e.target.dataset.recipe);
    saveToFavorites(recipe);
  }
});


document.getElementById('randomRecipe').addEventListener('click', (e) => {
  if (e.target.classList.contains('random-save-btn')) {
    const recipe = JSON.parse(e.target.dataset.recipe);
    saveToFavorites(recipe);
  }
});
