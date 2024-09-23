const { Mongoose } = require("mongoose");
const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;
		if (!name) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categorys Created Successfully",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
        console.log("INSIDE SHOW ALL CATEGORIES");
		const allCategorys = await Category.find({});
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//categoryPageDetails 

exports.categoryPageDetails = async (req, res) => {
  try {
      const { categoryId } = req.body;
      console.log("PRINTING CATEGORY ID: ", categoryId);

      if (!categoryId) {
          return res.status(400).json({ success: false, message: "Category ID is required." });
      }

      const selectedCategory = await Category.findById(categoryId)
          .populate({
              path: "courses",
              match: { status: "Published" },
              populate: "ratingAndReviews",
          })
          .exec();

      if (!selectedCategory || !selectedCategory.courses) {
          console.log("Category not found or no courses available.");
          return res.status(404).json({ success: false, message: "Category not found or no courses available." });
      }

      if (selectedCategory.courses.length === 0) {
          console.log("No courses found for the selected category.");
          return res.status(404).json({
              success: false,
              message: "No courses found for the selected category.",
          });
      }

      const categoriesExceptSelected = await Category.find({ _id: { $ne: categoryId } });

      if (categoriesExceptSelected.length === 0) {
          console.log("No other categories found.");
          return res.status(404).json({ success: false, message: "No other categories found." });
      }

      const randomIndex = getRandomInt(categoriesExceptSelected.length);
      const differentCategory = await Category.findById(categoriesExceptSelected[randomIndex]._id)
          .populate({ path: "courses", match: { status: "Published" } })
          .exec();

      const allCategories = await Category.find()
          .populate({
              path: "courses",
              match: { status: "Published" },
              populate: { path: "instructor" },
          })
          .exec();

      const allCourses = allCategories.flatMap(category => category.courses);
      const mostSellingCourses = allCourses
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 10);

      res.status(200).json({
          success: true,
          data: {
              selectedCategory,
              differentCategory,
              mostSellingCourses,
          },
      });
  } catch (error) {
      console.error("Error in categoryPageDetails:", error);
      return res.status(500).json({
          success: false,
          message: "Internal server error",
          error: error.message,
      });
  }
};
