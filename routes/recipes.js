require("dotenv").config();
const express = require("express");
const axios = require ("axios");
const router = express.Router();
const pg = require("pg");
const pg = require("pg");
const { Pool } = require("pg");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

router.get("/random", async(req,res)=>{
    try{
        const apiKey = process.env.API_Key;
        if (!apiKey) {
            return res.status(500).json({ message: "API key is missing!" });
        }

        const response = await axios.get("https://api.spoonacular.com/recipes/random", {
            params: { apiKey: apiKey ,number: 1}
            
        });
        const recipe = response.data.recipes[0];
        const randomRecipe = {
            title: recipe.title,
            image: recipe.image,
            instructions: recipe.instructions,
            ingredients: recipe.extendedIngredients.map(ingredient => ingredient.name)
        };

         await pool.query(
      `INSERT INTO recipes (title, image, instructions, ingredients, readyin)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        recipe.title,
        recipe.image,
        recipe.instructions || null,
        JSON.stringify(recipe.extendedIngredients.map(i => i.name)),
        recipe.readyInMinutes
      ]
    );
        res.json(randomRecipe); 



    }
    catch(error){
        console.error("Error fetching data", error.response?.data || error.message);
        res.status(500).json({ message: "Failed to fetch random recipe" });
    }
})

router.get("/search", async (req, res) => {
try{
    const searchApiKey = process.env.API_Key;
    if (!searchApiKey) {
        return res.status(500).json({ message: "API key is missing!" });
    }
    const ingredients = req.query.ingredients;
    const response = await axios.get("https://api.spoonacular.com/recipes/findByIngredients", {
        params: { 
            apiKey: searchApiKey,
            ingredients: ingredients,
            number: 5
         }
    });
    const simplifiedRecipes = response.data.map(recipe => ({
            title: recipe.title,
            image: recipe.image,
            usedIngredients: recipe.usedIngredients.map(ing => ing.name),
            missedIngredients: recipe.missedIngredients.map(ing => ing.name)
        }));

        res.json(simplifiedRecipes);

}
catch (error){
    console.error("Error fetching data", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to fetch recipe by ingredient" });
}
    
});

//get data from postgres
router.get("/api", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM recipes");
    console.log("show the result", result.rows);

    res.json(result.rows);
  } catch (error) {
    res.status(500).send("Error fetching", error);
    console.log("Error fetching", error);

  }
});

// delete
router.delete('/api:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM recipes WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'recipe not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting favorite:', err.message);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

// POST /recipes
router.post('/', async (req, res) => {
  const { title, image } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO recipes (title, image) VALUES ($1, $2) RETURNING *',
      [title, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

//update data
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { title, image} = req.body;

  try {
    const result = await pool.query(
      'UPDATE recipes SET title = $1, image = $2 WHERE id = $3 RETURNING *',
      [title, image, id]
     );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.log("Error updating data", error);
    res.status(500).send("error");
  }

});

module.exports = router;