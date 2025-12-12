import { Request, Response } from 'express';
import { Category, ICategory } from '../models/Category';
import { Product } from '../models/product';
import { validationResult } from 'express-validator';
import { deleteImage } from '../utils/imageHelper';
import multer from "multer";
import { IUser } from '../models/user'
import mongoose from 'mongoose';

interface CustomRequest extends Request {
  file?: Express.Multer.File;
  user?: any;
}
//GET /api/categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { includeInactive, search } = req.query;
        
        const isAdmin = req.user?.role === 'admin'

        // Only admins can see inactive categories
        const filter: any = isAdmin && includeInactive === 'true'
        ?{}
        : { isActive: true };

        if (search && typeof search === 'string') {
          filter.$or = [
            { name: { $regex: search, $options: 'i'} },
            {description: { $regex: search, $options: 'i'}}
          ]
        }

        const categories = await Category.find(filter)
        .sort({ name: 1 })
        .select('name description slug image isActive productCount createdAt')

        res.json({
            success: true,
            data: {
                categories,
                count: categories.length
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
   try {
    const {slug} = req.params
    const { includeProducts } = req.query;

    const category = await Category.findOne({
        slug,
        ...(req.user?.role !== 'admin' && { isActive: true})
    });

    if (!category){
        res.status(404).json({
            success: false,
            message: 'Category not found'
        })
        return
    }

    let responseData: any = category.toObject();

    if (includeProducts === 'true'){
        const products = await Product.find({
            category: category._id,
            status: 'active'
        }).select('name slug pricing.retail.price image status')

        responseData.products = products
      }

      res.json({
        success: true,
        data: responseData
      })
   }  catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
        success: false,
        message:'Failed to fetch category'
    });
  }
};

// GET /api/categories/id/:id - Get category by MongoDB _id
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { includeProducts } = req.query;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
      return;
    }

    const category = await Category.findOne({
      _id: id,
      ...(req.user?.role !== 'admin' && { isActive: true })
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    let responseData: any = category.toObject();

    if (includeProducts === 'true') {
      const products = await Product.find({
        category: category._id,
        status: 'active'
      }).select('name slug pricing.retail.price images status');

      responseData.products = products;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category'
    });
  }
};

//POST /api/admin/categories - create category (admin only)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
           return;
        }

        const {name, description, isActive = true} = req.body

        const image = req.file?.path

        // Check for existing category without regex
        const existingCategory = await Category.findOne({
            name: name.trim()
        })

        if (existingCategory) {

            if(image) await deleteImage(image);

            res.status(409).json({
                success: false,
                message: 'Category with this name already exists'
              });
              return
            }

             const slug = name
                 .toLowerCase()
                 .replace(/[^\w\s-]/g, '')
                 .replace(/\s+/g, '-')
                 .trim();

            const category = new Category({
                name: name.trim(),
                description: description?.trim(),
                slug,
                image,
                isActive
            });

            await category.save()

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {

          if(req.file?.path) await deleteImage(req.file.path);

            console.error('Create category error:', error)
            res.status(500).json({
                success: false,
                message: 'Failed to create category'
            });
          }
        };

// PUT /api/admin/categories/:id - Update category (admin only)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return
        }

        const { id } = req.params;
        const { name, description, isActive} = req.body
        const newImage = req.file?.path

        const category = await Category.findById(id);
        if (!category) {
            res.status(404).json({
                success: false,
                message: 'Category not found'
            });
            return;
        }

        if (name && name !== category.name){
            // Check for existing category without regex
            const existingCategory = await Category.findOne({
                _id: { $ne: id },
                name: name.trim()
            });

            if (existingCategory) {
                res.status(409).json({
                    success:false,
                    message: 'Category with this name already exists'
                })
                return;
            }
        }

        //update fields
        if (name) category.name = name.trim();
        if (description !== undefined) category.description = description?.trim()
        if (isActive !== undefined) category.isActive = isActive;

        if (newImage) {
          if (category.image && category.image.length > 0) {
            await deleteImage(category.image[0]);
          }
          category.image = [newImage];
        }

        await category.save()

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        })
      }  catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update category'
        });
      }
    };

// DELETE /api/admin/categories/:id - Delete category (admin only)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found'
      });
      return;
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    
    if (productCount > 0 && force !== 'true') {
      res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Use force=true to delete anyway.`,
        data: { productCount }
      });
      return;
    }

    if (force === 'true' && productCount > 0) {
      // Remove category reference from products
      await Product.updateMany(
        { category: id },
        { $unset: { category: 1 } }
      );
    }

    // Delete image if exists (image is string[] array)
    if (category.image && category.image.length > 0) {
      await deleteImage(category.image[0]);
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: { deletedProductReferences: productCount }
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
};

// POST /api/categories/seed - Seed default categories (public for now, can be protected later)
export const seedCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const defaultCategories = [
      {
        name: 'Rice & Grains',
        slug: 'rice-grains',
        description: 'Rice dishes, pasta, and grain-based meals',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        isActive: true
      },
      {
        name: 'Soups & Stews',
        slug: 'soups-stews',
        description: 'Traditional Nigerian soups and stews',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
        isActive: true
      },
      {
        name: 'Proteins',
        slug: 'proteins',
        description: 'Meat, fish, chicken, and protein dishes',
        image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400',
        isActive: true
      },
      {
        name: 'Vegetables',
        slug: 'vegetables',
        description: 'Fresh vegetables and vegetable dishes',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
        isActive: true
      },
      {
        name: 'Snacks',
        slug: 'snacks',
        description: 'Small chops, pastries, and snacks',
        image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
        isActive: true
      },
      {
        name: 'Swallow',
        slug: 'swallow',
        description: 'Eba, fufu, pounded yam, and other swallows',
        image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400',
        isActive: true
      },
      {
        name: 'Bakery',
        slug: 'bakery',
        description: 'Bread, cakes, pastries, and baked goods',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
        isActive: true
      },
      {
        name: 'Beverages',
        slug: 'beverages',
        description: 'Drinks, juices, and beverages',
        image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400',
        isActive: true
      },
      {
        name: 'Ready Meals',
        slug: 'ready-meals',
        description: 'Complete ready-to-eat meals',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        isActive: true
      },
      {
        name: 'Fruits',
        slug: 'fruits',
        description: 'Fresh fruits and fruit products',
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
        isActive: true
      }
    ];

    // Try to insert all categories, skip duplicates
    const results = await Promise.allSettled(
      defaultCategories.map(cat => Category.create(cat))
    );

    const created = results.filter(r => r.status === 'fulfilled').length;
    const skipped = results.filter(r => r.status === 'rejected').length;

    const allCategories = await Category.find({}).sort({ name: 1 });

    res.json({
      success: true,
      message: `Seeding complete: ${created} created, ${skipped} skipped`,
      data: {
        created,
        skipped,
        total: allCategories.length,
        categories: allCategories
      }
    });
  } catch (error) {
    console.error('Seed categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed categories'
    });
  }
};
