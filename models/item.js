const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters'],
        minlength: [2, 'Name must be at least 2 characters'],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9\s\-_]+$/.test(v);
            },
            message: 'Name can only contain letters, numbers, spaces, hyphens, and underscores'
        }
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters'],
        minlength: [10, 'Description must be at least 10 characters'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price cannot be negative'],
        max: [100000, 'Price cannot exceed 100,000'],
        validate: {
            validator: function(v) {
                return /^\d+(\.\d{1,2})?$/.test(v.toString());
            },
            message: 'Price must be a valid number with up to 2 decimal places'
        }
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: {
            values: ['electronics', 'clothing', 'books', 'home', 'other'],
            message: 'Category must be one of: electronics, clothing, books, home, other'
        },
        lowercase: true,
        trim: true
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create indexes for better performance
itemSchema.index({ category: 1 });
itemSchema.index({ price: 1 });
itemSchema.index({ createdAt: -1 });

// Middleware to validate before save
itemSchema.pre('save', function(next) {
    console.log(`Saving item: ${this.name}`);
    next();
});

module.exports = mongoose.model('Item', itemSchema);