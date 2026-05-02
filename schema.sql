    -- Schema para o banco de dados Supabase do Alma Retrô
    -- Execute este SQL no SQL Editor do Supabase

    -- Tabela de produtos
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        size VARCHAR(50),
        image_url VARCHAR(500) NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Índices para melhorar performance
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

    -- Trigger para atualizar o campo updated_at automaticamente
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Inserir dados de exemplo (opcional - pode remover depois)
    INSERT INTO products (name, description, price, size, image_url, featured) VALUES
    ('Jaqueta Vintage Jeans', 'Jaqueta jeans clássica dos anos 90, em excelente estado. Peça única com detalhes autênticos.', 189.90, 'M', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', TRUE),
    ('Vestido Floral Retrô', 'Vestido com estampa floral delicada, perfeito para ocasiões especiais. Tecido de alta qualidade.', 149.90, 'G', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', TRUE),
    ('Camisa Xadrez Classic', 'Camisa xadrez atemporal, ideal para looks casuais e sofisticados. Conforto garantido.', 89.90, 'L', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', TRUE),
    ('Blazer Bege Elegante', 'Blazer em tom bege neutro, perfeito para trabalho ou eventos. Corte moderno e acabamento impecável.', 249.90, 'M', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500', TRUE),
    ('Saia Lápis Preta', 'Saia lápis clássica em preto, versátil e elegante. Peça essencial para o guarda-roupa.', 129.90, '42', 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj9a?w=500', TRUE),
    ('Tênis Retrô Branco', 'Tênis estilo retrô em branco, confortável e estiloso. Perfeito para o dia a dia.', 199.90, '40', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500', TRUE),
    ('Casaco de Lã', 'Casaco de lã premium, ideal para dias frios. Design sofisticado e aquecimento superior.', 349.90, 'G', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500', FALSE),
    ('Calça Alfaiataria', 'Calça de alfaiataria em preto, corte slim fit. Peça versátil para diversas ocasiões.', 179.90, 'M', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500', FALSE),
    ('Blusa Seda Off-White', 'Blusa em seda off-white, elegante e confortável. Detalhes refinados.', 139.90, 'P', 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500', FALSE),
    ('Bolsa Couro Vintage', 'Bolsa em couro legítimo com design vintage. Espaçosa e durável.', 299.90, 'Único', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', FALSE);
