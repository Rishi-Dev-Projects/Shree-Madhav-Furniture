import os
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import psycopg
from dotenv import load_dotenv
from functools import wraps
from werkzeug.security import check_password_hash

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "super-secret-shree-madhav-key")

def get_db_connection():
    return psycopg.connect(DATABASE_URL)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, password_hash FROM admins WHERE username = %s", (username,))
                    admin = cur.fetchone()
                    
                    if admin and check_password_hash(admin[1], password):
                        session['admin_logged_in'] = True
                        session['admin_id'] = admin[0]
                        return redirect(url_for('admin_page'))
                    else:
                        return render_template('login.html', error="Invalid username or password")
        except Exception as e:
            return render_template('login.html', error="Database error: " + str(e))
            
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
def index():
    # Increment page view
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE analytics SET page_views = page_views + 1 WHERE date = CURRENT_DATE;")
                if cur.rowcount == 0:
                    cur.execute("INSERT INTO analytics (date, page_views, whatsapp_clicks) VALUES (CURRENT_DATE, 1, 0);")
                
                # Fetch products for the grid
                cur.execute("SELECT id, name, slug, category, price, image_url FROM products ORDER BY created_at DESC;")
                products = cur.fetchall()
                
                # Convert to list of dicts for easier template rendering
                products_list = []
                for p in products:
                    products_list.append({
                        'id': p[0],
                        'name': p[1],
                        'slug': p[2],
                        'category': p[3],
                        'price': p[4],
                        'image_url': p[5]
                    })
                conn.commit()
    except Exception as e:
        print("DB Error:", e)
        products_list = []

    return render_template('index.html', products=products_list)


@app.route('/products/<slug>')
def product_detail(slug):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, name, category, price, description, image_url FROM products WHERE slug = %s", (slug,))
                product = cur.fetchone()
                if product:
                    product_data = {
                        'id': product[0],
                        'name': product[1],
                        'category': product[2],
                        'price': product[3],
                        'description': product[4],
                        'image_url': product[5]
                    }
                else:
                    return "Product not found", 404
                
                # Fetch some related products (e.g. 3 random or latest)
                cur.execute("SELECT name, slug, price, image_url FROM products WHERE slug != %s LIMIT 3", (slug,))
                related = [{'name': r[0], 'slug': r[1], 'price': r[2], 'image_url': r[3]} for r in cur.fetchall()]
                
    except Exception as e:
        print("DB Error:", e)
        return "Internal Server Error", 500

    return render_template('product.html', product=product_data, related=related)

@app.route('/api/track-whatsapp', methods=['POST'])
def track_whatsapp():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE analytics SET whatsapp_clicks = whatsapp_clicks + 1 WHERE date = CURRENT_DATE;")
                if cur.rowcount == 0:
                    cur.execute("INSERT INTO analytics (date, page_views, whatsapp_clicks) VALUES (CURRENT_DATE, 0, 1);")
                conn.commit()
    except Exception as e:
        print(e)
    return jsonify({"status": "success"})


# ADMIN ROUTES
@app.route('/admin')
@login_required
def admin_page():
    return render_template('admin.html')

@app.route('/api/admin/stats')
@login_required
def admin_stats():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT SUM(page_views), SUM(whatsapp_clicks) FROM analytics;")
                totals = cur.fetchone()
                
                cur.execute("SELECT page_views, whatsapp_clicks FROM analytics WHERE date = CURRENT_DATE;")
                today = cur.fetchone()
                
                cur.execute("SELECT COUNT(*) FROM products;")
                prod_count = cur.fetchone()[0]

                return jsonify({
                    "total_views": totals[0] or 0,
                    "total_whatsapp": totals[1] or 0,
                    "today_views": today[0] if today else 0,
                    "today_whatsapp": today[1] if today else 0,
                    "total_products": prod_count
                })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/products', methods=['GET', 'POST'])
def api_products():
    if request.method == 'GET':
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, name, slug, category, price, description, image_url FROM products ORDER BY created_at DESC;")
                    rows = cur.fetchall()
                    products = []
                    for r in rows:
                        products.append({
                            "id": r[0], "name": r[1], "slug": r[2], 
                            "category": r[3], "price": r[4], 
                            "description": r[5], "image": r[6]
                        })
                    return jsonify(products)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'POST':
        if 'admin_logged_in' not in session:
            return jsonify({"error": "Unauthorized"}), 401
            
        data = request.json
        # basic slug generator
        slug = data['name'].lower().replace(' ', '-').replace('&', 'and')
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "INSERT INTO products (name, slug, category, price, description, image_url) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                        (data['name'], slug, data['category'], data['price'], data.get('description', ''), data['image'])
                    )
                    new_id = cur.fetchone()[0]
                    conn.commit()
                    return jsonify({"id": new_id, "slug": slug})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:prod_id>', methods=['PUT', 'DELETE'])
@login_required
def api_product_detail(prod_id):
    if request.method == 'DELETE':
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM products WHERE id = %s", (prod_id,))
                    conn.commit()
                    return jsonify({"status": "deleted"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    elif request.method == 'PUT':
        data = request.json
        slug = data['name'].lower().replace(' ', '-').replace('&', 'and')
        try:
            with get_db_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE products SET name=%s, slug=%s, category=%s, price=%s, description=%s, image_url=%s WHERE id=%s",
                        (data['name'], slug, data['category'], data['price'], data.get('description', ''), data['image'], prod_id)
                    )
                    conn.commit()
                    return jsonify({"status": "updated", "slug": slug})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
