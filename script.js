const mealsElement = document.getElementById('meals');
const favouriteContainer = document.getElementById('fav-meals');
const mealInfoElement = document.getElementById('meal-info');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const responseData = await response.json();
    const randomMeal = responseData.meals[0];

    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);

    const responseData = await response.json();
    const meal = responseData.meals[0];
    return meal;
}

async function getMealsBySearch(term) {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='+term);

    const responseData = await response.json();
    const meals = responseData.meals;

    return meals;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
            <div class="meal-header">
                ${random ? `<span class="random">Random Recipe</span>` : ``}
                <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            </div>
            <div class="meal-body">
                <h4>${mealData.strMeal}</h4>
                <button class="fav-btn" id="fav-btn">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
    `;

    const btn = meal.querySelector('.meal-body .fav-btn');

    btn.addEventListener("click", () => {
        if(btn.classList.contains('active')) {
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }
        fetchFavMeals();
    });

    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    mealsElement.appendChild(meal);
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id != mealId)));
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    favouriteContainer.innerHTML = "";

    const mealIds = getMealsLS();
    
    for(let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector('.clear');
    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);

        fetchFavMeals();
    });

    favMeal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    favouriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
    mealInfoElement.innerHTML = "";

    const mealElement = document.createElement('div');

    //get ingredients and measures
    const ingredients = [];
    for(let i = 1; i <= 20; i++) {
        if(mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient'+i]} / ${mealData['strMeasure'+i]}`);
        } else {
            break;
        }
    }

    mealElement.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map((ing) => 
                `<li>${ing}</li>`
            ).join("")}
        </ul>
    `;

    mealInfoElement.appendChild(mealElement);

    mealPopup.classList.remove('hidden');
}

searchBtn.addEventListener("click" , async () => {
    mealsElement.innerHTML = '';

    const search = searchTerm.value;

    const meals = await getMealsBySearch(search);

    if(meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});