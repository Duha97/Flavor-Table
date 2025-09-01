require("dotenv").config();
const express = require("express");
const axios = require ("axios");
const router = express.Router();

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




module.exports = router;