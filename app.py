from flask import Flask, render_template, jsonify, request, session, redirect, url_for, flash
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import uuid
from werkzeug.utils import secure_filename

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'chave-secreta-padrao-mude-isso')

# Configuração do Supabase
# Substitua pelas suas credenciais do Supabase
supabase_url = os.getenv('SUPABASE_URL', 'sua-url-do-supabase')
supabase_key = os.getenv('SUPABASE_KEY', 'sua-chave-do-supabase')
supabase_service_key = os.getenv('SUPABASE_SERVICE_KEY', 'sua-chave-de-servico-do-supabase')
supabase: Client = create_client(supabase_url, supabase_key)

# Cliente com permissões de admin para operações de escrita
supabase_admin: Client = create_client(supabase_url, supabase_service_key)

# Nome do bucket de imagens
BUCKET_NAME = 'products'

@app.route('/')
def home():
    """Página inicial com produtos em destaque"""
    try:
        # Buscar todos os produtos usando cliente admin (bypass RLS)
        response = supabase_admin.table('products').select('*').execute()
        all_products = response.data

        print(f"[DEBUG] Total de produtos no banco: {len(all_products)}")
        print(f"[DEBUG] Produtos: {all_products}")

        # Buscar produto em destaque para o hero
        featured_product = None
        for product in all_products:
            if product.get('featured'):
                featured_product = product
                break

        # Pegar os 6 primeiros produtos para a grid
        products = all_products[:6]

        print(f"[DEBUG] Featured product: {featured_product}")
        print(f"[DEBUG] Products count: {len(products)}")
    except Exception as e:
        print(f"[DEBUG] Erro ao buscar dados: {e}")
        import traceback
        traceback.print_exc()
        featured_product = None
        products = []

    return render_template('home.html', featured_product=featured_product, products=products)

@app.route('/catalogo')
def catalog():
    try:
        # Buscar todos os produtos usando cliente admin (bypass RLS)
        response = supabase_admin.table('products').select('*').execute()
        products = response.data
        print(f"[DEBUG] Catalogo: {len(products)} produtos encontrados")
    except Exception as e:
        print(f"[DEBUG] Erro ao buscar produtos: {e}")
        import traceback
        traceback.print_exc()
        products = []

    return render_template('catalog.html', products=products)

# ===================================
# Admin Routes
# ===================================

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Página de login do admin"""
    if request.method == 'POST':
        password = request.form.get('password')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')

        if password == admin_password:
            session['logged_in'] = True
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Senha incorreta!', 'error')

    return render_template('login.html')

@app.route('/admin/logout')
def admin_logout():
    """Logout do admin"""
    session.pop('logged_in', None)
    return redirect(url_for('home'))

@app.route('/admin')
def admin_dashboard():
    """Painel administrativo"""
    if not session.get('logged_in'):
        return redirect(url_for('admin_login'))

    try:
        response = supabase_admin.table('products').select('*').order('created_at', desc=True).execute()
        products = response.data
        print(f"[DEBUG] Admin dashboard: {len(products)} produtos")
    except Exception as e:
        print(f"[DEBUG] Erro ao buscar dados: {e}")
        products = []

    return render_template('admin.html', products=products)

@app.route('/admin/products', methods=['POST'])
def create_product():
    """Criar novo produto"""
    if not session.get('logged_in'):
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        data = request.get_json()

        # Se este produto está sendo marcado como featured, remover featured de todos os outros
        if data.get('featured'):
            supabase_admin.table('products').update({'featured': False}).neq('id', -1).execute()

        # Criar produto
        response = supabase_admin.table('products').insert(data).execute()
        print(f"[DEBUG] Produto criado: {response.data}")

        return jsonify({'success': True, 'product': response.data[0]})
    except Exception as e:
        print(f"[DEBUG] Erro ao criar produto: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Atualizar produto existente"""
    if not session.get('logged_in'):
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        data = request.get_json()

        # Se este produto está sendo marcado como featured, remover featured de todos os outros
        if data.get('featured'):
            supabase_admin.table('products').update({'featured': False}).neq('id', -1).execute()

        response = supabase_admin.table('products').update(data).eq('id', product_id).execute()
        print(f"[DEBUG] Produto atualizado: {response.data}")

        return jsonify({'success': True, 'product': response.data[0]})
    except Exception as e:
        print(f"[DEBUG] Erro ao atualizar produto: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Remover produto"""
    if not session.get('logged_in'):
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        response = supabase_admin.table('products').delete().eq('id', product_id).execute()
        print(f"[DEBUG] Produto removido: {product_id}")

        return jsonify({'success': True})
    except Exception as e:
        print(f"[DEBUG] Erro ao remover produto: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/product/<product_id>')
def get_product(product_id):
    """Buscar produto individual por ID"""
    try:
        print(f"[DEBUG] Buscando produto com ID: {product_id} (tipo: {type(product_id)})")

        # Tentar converter para int se possível
        try:
            product_id_int = int(product_id)
            response = supabase_admin.table('products').select('*').eq('id', product_id_int).execute()
        except ValueError:
            # Se não for int, usar como string
            response = supabase_admin.table('products').select('*').eq('id', product_id).execute()

        print(f"[DEBUG] Resposta do Supabase: {response.data}")
        print(f"[DEBUG] Count: {len(response.data) if response.data else 0}")

        if response.data:
            return jsonify(response.data[0])
        else:
            print(f"[DEBUG] Produto não encontrado no banco")
            return jsonify({'error': 'Produto não encontrado'}), 404
    except Exception as e:
        print(f"[DEBUG] Erro ao buscar produto: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/products')
def get_products():
    """Buscar todos os produtos"""
    try:
        response = supabase_admin.table('products').select('*').order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        print(f"[DEBUG] Erro ao buscar produtos: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/admin/products/<int:product_id>/toggle-featured', methods=['POST'])
def toggle_featured(product_id):
    """Alternar produto em destaque (apenas 1 pode ser destacado)"""
    if not session.get('logged_in'):
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        # Buscar produto atual
        response = supabase_admin.table('products').select('*').eq('id', product_id).execute()
        product = response.data[0] if response.data else None

        if not product:
            return jsonify({'error': 'Produto não encontrado'}), 404

        # Se está sendo marcado como featured, remover featured de TODOS os outros primeiro
        if not product.get('featured'):
            # Remover featured de todos os produtos
            supabase_admin.table('products').update({'featured': False}).neq('id', product_id).execute()
            # Marcar este como featured
            supabase_admin.table('products').update({'featured': True}).eq('id', product_id).execute()
            print(f"[DEBUG] Produto {product_id} marcado como featured, outros removidos")
        else:
            # Remover featured deste
            supabase_admin.table('products').update({'featured': False}).eq('id', product_id).execute()
            print(f"[DEBUG] Produto {product_id} removido do featured")

        return jsonify({'success': True})
    except Exception as e:
        print(f"[DEBUG] Erro ao alternar featured: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/cleanup-featured', methods=['POST'])
def cleanup_featured():
    """Limpar produtos duplicados em destaque - apenas 1 deve ser destacado"""
    if not session.get('logged_in'):
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        # Buscar todos os produtos com featured=true
        response = supabase_admin.table('products').select('*').eq('featured', True).execute()
        featured_products = response.data

        print(f"[DEBUG] Encontrados {len(featured_products)} produtos em destaque")

        if len(featured_products) > 1:
            # Manter apenas o primeiro, remover dos outros
            first_id = featured_products[0]['id']
            for product in featured_products[1:]:
                supabase_admin.table('products').update({'featured': False}).eq('id', product['id']).execute()
                print(f"[DEBUG] Removido featured do produto {product['id']}")

            print(f"[DEBUG] Mantido apenas produto {first_id} como featured")
        elif len(featured_products) == 0:
            print(f"[DEBUG] Nenhum produto em destaque")

        return jsonify({'success': True, 'cleaned': len(featured_products) - 1})
    except Exception as e:
        print(f"[DEBUG] Erro ao limpar featured: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/admin/upload-image', methods=['POST'])
def upload_image():
    """Fazer upload de imagem para o bucket do Supabase"""
    print("[DEBUG] Upload image iniciado")
    if not session.get('logged_in'):
        print("[DEBUG] Não autorizado")
        return jsonify({'error': 'Não autorizado'}), 401

    try:
        if 'image' not in request.files:
            print("[DEBUG] Nenhum arquivo enviado")
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400

        file = request.files['image']
        print(f"[DEBUG] Arquivo recebido: {file.filename}")
        if file.filename == '':
            print("[DEBUG] Nome do arquivo vazio")
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400

        # Gerar nome único para o arquivo
        file_extension = file.filename.split('.')[-1].lower()
        print(f"[DEBUG] Extensão: {file_extension}")
        if file_extension not in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
            print(f"[DEBUG] Formato não suportado: {file_extension}")
            return jsonify({'error': 'Formato de arquivo não suportado'}), 400

        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"{unique_filename}"
        print(f"[DEBUG] Caminho do arquivo: {file_path}")

        # Ler o arquivo
        file_content = file.read()
        print(f"[DEBUG] Tamanho do arquivo: {len(file_content)} bytes")

        # Fazer upload para o bucket do Supabase
        print(f"[DEBUG] Iniciando upload para bucket: {BUCKET_NAME}")
        supabase_admin.storage.from_(BUCKET_NAME).upload(
            path=file_path,
            file=file_content,
            file_options={'content-type': file.content_type}
        )
        print("[DEBUG] Upload concluído")

        # Obter URL pública
        public_url = f"{supabase_url}/storage/v1/object/public/{BUCKET_NAME}/{file_path}"
        print(f"[DEBUG] URL pública: {public_url}")

        return jsonify({'url': public_url, 'path': file_path})
    except Exception as e:
        print(f"[DEBUG] Erro no upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
