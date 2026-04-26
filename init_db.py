import os
import psycopg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

def init_db():
    try:
        # Connect to your postgres DB
        conn = psycopg.connect(DATABASE_URL)
        cur = conn.cursor()

        # Create Products table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                category VARCHAR(255) NOT NULL,
                price VARCHAR(100) NOT NULL,
                description TEXT,
                image_url VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create Analytics table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS analytics (
                id SERIAL PRIMARY KEY,
                date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
                page_views INTEGER DEFAULT 0,
                whatsapp_clicks INTEGER DEFAULT 0
            );
        """)

        # Initial seed data
        default_products = [
            ("Wood & Grey 3-Door Wardrobe", "wood-grey-wardrobe", "cupboard", "₹22,000", "A modern 3-door wardrobe featuring a stylish combination of natural wood grain slatted panels and a sleek matte grey center door with a full-length mirror. Offers spacious storage with a premium look.", "images/wood-grey-wardrobe.png"),
            ("Geometric Motif 4-Door Wardrobe", "geometric-motif-wardrobe", "cupboard", "₹32,000", "A grand 4-door wardrobe crafted in rich dark mahogany wood grain. Features stunning light wood geometric diamond motifs across the doors, a tall vertical mirror, and two convenient bottom drawers for organized storage.", "images/geometric-motif-wardrobe.png"),
            ("Matte Black & Wood Geometric Bed Combo", "black-wood-bed-combo", "bed cupboard", "₹37,000", "A highly modern bedroom set that perfectly balances striking matte black panels with beautiful light oak wood grain. Features a geometrically designed headboard and a perfectly matching sleek wardrobe with a mirror.", "images/black-wood-bed-combo.png"),
            ("Dual-Tone Wooden Bed Combo", "dual-tone-bed-combo", "bed cupboard", "₹36,000", "A stunning bedroom set featuring a striking two-tone high-contrast wood finish. The bed boasts a unique headboard with an angled dark walnut panel cutting across light pine slats. Comes with a matching 3-door wardrobe to complete your luxury space.", "images/dual-tone-bed-combo.png"),
            ("Mint Green Bed & Wardrobe", "mint-bed-combo", "bed cupboard", "₹38,000", "A stunning modern bedroom set in soft mint green featuring a double bed with a plush cream tufted headboard and a matching 3-door wardrobe with a central mirror.", "images/mint-bed-combo.png"),
            ("Square Bed and Cupboard", "square-bed-cupboard", "bed cupboard", "₹40,000", "Complete bedroom set with matching bed and 2-door mirror wardrobe in a cream finish.", "images/square-bed-cupboard.png"),
            ("Slatted Wood TV Unit", "slatted-wood-tv-unit", "tv-unit", "₹22,000", "Stunning wooden slatted panel TV unit with warm LED backlighting, open display shelves, and spacious base cabinet storage. Crafted in premium natural wood finish.", "images/slatted-wood-tv-unit.jpg"),
            ("Box TV Unit", "box-tv-unit", "tv-unit", "₹15,000", "Modern minimalist box TV unit with floating shelves and dark wood finish.", "images/box-tv-unit.jpg"),
            ("Diamond Tufted Bed", "diamond-tufted-bed", "bed", "₹18,000", "Elegant double bed with stunning walnut and cream two-tone finish. Features diamond motif headboard and footboard panels with horizontal slat detailing. Built with durable wood for lasting comfort.", "images/diamond-tufted-bed.png")
        ]

        # Insert seed data if table is empty
        cur.execute("SELECT COUNT(*) FROM products;")
        count = cur.fetchone()[0]
        
        if count == 0:
            for p in default_products:
                cur.execute(
                    "INSERT INTO products (name, slug, category, price, description, image_url) VALUES (%s, %s, %s, %s, %s, %s)",
                    p
                )
            print(f"Inserted {len(default_products)} default products.")
        else:
            print(f"Products table already has {count} records. Skipping seed.")

        # Insert initial analytics row if not exists
        cur.execute("INSERT INTO analytics (date, page_views, whatsapp_clicks) VALUES (CURRENT_DATE, 0, 0) ON CONFLICT (date) DO NOTHING;")

        conn.commit()
        cur.close()
        conn.close()
        print("Database initialized successfully!")

    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
