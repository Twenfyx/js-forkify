import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    // resultsView.renderSpiner();
    const id = window.location.hash.slice(1);
    // console.log(id);
    if (!id) return;
    recipeView.renderSpiner();

    resultsView.update(model.getSearchResultPage());
    //update bookmarks
    bookmarksView.update(model.state.bookmarks);
    //1) loading recipe
    await model.loadRecipe(id);

    //2) Rendering recipe
    recipeView.render(model.state.recipe);
    // resultsView.render(model.state.search.results);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
    // alert(err);

    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpiner();
    // resultsView.renderSpiner();
    const query = searchView.getQuery();
    if (!query) return;

    // load search results
    await model.loadSearchResults(query);
    //render results
    // console.log(model.state.search.results);

    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultPage(1));

    //render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultPage(goToPage));

  //render initial pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recope setings
  model.updateServings(newServings);

  //update the recope view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //update recipe view
  recipeView.update(model.state.recipe);
  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpiner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    recipeView.render(model.state.recipe);

    //seccess message
    addRecipeView.renderMessage();

    //rebder bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
  // console.log(newRecipe);

  //upload the new data
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
