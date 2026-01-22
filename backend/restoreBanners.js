const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Banner = require('./models/bannerModel');

dotenv.config();

const banners = [
    {
        title: "Frame Your Precious Moments & Divine Memories",
        subtitle: "PREMIUM ART & FRAMING",
        desc: "From handcrafted wooden frames to exquisite religious posters, we help you preserve what matters most.",
        image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&q=80"
    },
    {
        title: "Turn Your Walls Into A Masterpiece",
        subtitle: "HANDCRAFTED ELEGANCE",
        desc: "Explore our new collection of Italian and Mahogany finished frames.",
        image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1600&q=80"
    },
    {
        title: "Authentic Tanjore Art & Gold Work",
        subtitle: "DIVINE COLLECTION",
        desc: "Bring home the blessings with our certified Gold and Silver foil Tanjore artworks.",
        image: "https://images.unsplash.com/photo-1628191011993-4350f92696b0?w=1600&q=80"
    }
];

const restoreBanners = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing banners
        await Banner.deleteMany({});
        console.log('🗑️  Cleared existing banners');

        // Insert new banners
        const createdBanners = await Banner.insertMany(banners);
        console.log('✅ Restored 3 banners:', createdBanners.map(b => b.title));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

restoreBanners();
