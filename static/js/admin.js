// ===================================
// Admin Panel JavaScript
// Modal functionality and CRUD operations
// ===================================

// Store current editing product ID
let currentProductId = null;
let uploadedImageUrls = [];

// Modal elements
const modal = document.getElementById('product-modal');
const modalTitle = document.getElementById('modal-title');
const productIdInput = document.getElementById('product-id');
const productNameInput = document.getElementById('product-name');
const productDescriptionInput = document.getElementById('product-description');
const productPriceInput = document.getElementById('product-price');
const productSizeInput = document.getElementById('product-size');
const productImagesInput = document.getElementById('product-images');
const productImagesUrlsInput = document.getElementById('product-images-urls');
const productFeaturedInput = document.getElementById('product-featured');

// ===================================
// Modal Functions
// ===================================

function openCreateModal() {
    currentProductId = null;
    modalTitle.textContent = 'Adicionar Produto';
    clearForm();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openEditModal(productId) {
    console.log('[DEBUG] Abrindo modal de edição para produto ID:', productId);
    currentProductId = productId;
    modalTitle.textContent = 'Editar Produto';

    // Fetch product data
    fetch(`/api/product/${productId}`)
        .then(response => response.json())
        .then(product => {
            console.log('[DEBUG] Resposta da API:', product);
            if (product.error) {
                alert('Erro ao buscar produto: ' + product.error);
                return;
            }

            // Populate form
            productIdInput.value = product.id;
            productNameInput.value = product.name;
            productDescriptionInput.value = product.description || '';
            productPriceInput.value = product.price;
            productSizeInput.value = product.size || '';

            // Handle images (parse string JSON if needed)
            let images = [];
            if (product.images) {
                if (typeof product.images === 'string') {
                    try {
                        images = JSON.parse(product.images);
                    } catch (e) {
                        images = [product.images];
                    }
                } else {
                    images = product.images;
                }
            }

            // Fallback to image_url if no images
            if (!images || images.length === 0) {
                images = [product.image_url];
            }

            uploadedImageUrls = images;
            productImagesUrlsInput.value = JSON.stringify(images);

            // Show existing image previews
            const container = document.getElementById('images-preview-container');
            container.innerHTML = '';

            if (images.length > 0) {
                container.classList.add('active');
                images.forEach((imgUrl, index) => {
                    const item = document.createElement('div');
                    item.className = 'image-preview-item';
                    item.innerHTML = `
                        <img src="${imgUrl}" alt="Preview">
                    `;
                    container.appendChild(item);
                });
                showStatus(`${images.length} imagem(ns) carregada(s)`, 'success');
            }

            productFeaturedInput.checked = product.featured;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao buscar produto.');
        });
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    clearForm();
    currentProductId = null;
}

function clearForm() {
    productIdInput.value = '';
    productNameInput.value = '';
    productDescriptionInput.value = '';
    productPriceInput.value = '';
    productSizeInput.value = '';
    productImagesInput.value = '';
    productImagesUrlsInput.value = '';
    uploadedImageUrls = [];
    selectedFiles = [];
    productFeaturedInput.checked = false;

    // Clear preview
    const container = document.getElementById('images-preview-container');
    container.innerHTML = '';
    container.classList.remove('active');
    hideStatus();
}

// Close modal when clicking outside
modal.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// ===================================
// Image Upload & Drag & Drop
// ===================================

const dropZone = document.getElementById('drop-zone');
let selectedFiles = [];

// Click to open file picker
dropZone.addEventListener('click', () => {
    productImagesInput.click();
});

// Drag & drop events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('dragover');

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
        handleFiles(files);
    }
});

productImagesInput.addEventListener('change', function () {
    const files = Array.from(this.files);
    if (files.length > 0) {
        handleFiles(files);
    }
});

function handleFiles(files) {
    // Limit to 10 images
    if (selectedFiles.length + files.length > 10) {
        alert('Máximo de 10 imagens permitido.');
        return;
    }

    selectedFiles = [...selectedFiles, ...files];
    updatePreview();
}

function updatePreview() {
    const container = document.getElementById('images-preview-container');
    container.innerHTML = '';

    if (selectedFiles.length > 0) {
        container.classList.add('active');

        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const item = document.createElement('div');
                item.className = 'image-preview-item';
                item.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-image" onclick="removeImage(${index})" type="button">&times;</button>
                `;
                container.appendChild(item);
            };
            reader.readAsDataURL(file);
        });

        showStatus(`${selectedFiles.length} imagem(ns) selecionada(s)`, 'info');
    } else {
        container.classList.remove('active');
        hideStatus();
    }
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    updatePreview();

    // Update input files
    const dataTransfer = new DataTransfer();
    selectedFiles.forEach(file => dataTransfer.items.add(file));
    productImagesInput.files = dataTransfer.files;
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('upload-status');
    statusDiv.textContent = message;
    statusDiv.className = 'upload-status show ' + type;
}

function hideStatus() {
    const statusDiv = document.getElementById('upload-status');
    statusDiv.className = 'upload-status';
}

async function uploadImages(files) {
    showStatus(`fazendo upload de ${files.length} imagem(ns)...`, 'info');

    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('image', files[i]);

        try {
            const response = await fetch('/admin/upload-image', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                uploadedUrls.push(data.url);
                showStatus(`upload: ${i + 1}/${files.length} concluído(s)`, 'info');
            } else {
                throw new Error(data.error || 'Erro no upload');
            }
        } catch (error) {
            console.error('Erro no upload:', error);
            showStatus(`✗ erro na imagem ${i + 1}: ${error.message}`, 'error');
            return null;
        }
    }

    if (uploadedUrls.length > 0) {
        uploadedImageUrls = uploadedUrls;
        productImagesUrlsInput.value = JSON.stringify(uploadedUrls);
        showStatus(`✓ ${uploadedUrls.length} upload(s) concluído(s)!`, 'success');
    }

    return uploadedUrls;
}

// ===================================
// CRUD Operations
// ===================================

async function saveProduct() {
    // Validate form
    if (!productNameInput.value.trim()) {
        alert('Por favor, informe o nome do produto.');
        productNameInput.focus();
        return;
    }

    if (!productPriceInput.value) {
        alert('Por favor, informe o preço do produto.');
        productPriceInput.focus();
        return;
    }

    // Check if we need to upload images
    if (selectedFiles.length > 0) {
        const urls = await uploadImages(selectedFiles);
        if (!urls || urls.length === 0) {
            alert('Erro ao fazer upload das imagens. Tente novamente.');
            return;
        }
    } else if (!productImagesUrlsInput.value && !currentProductId) {
        alert('Por favor, selecione pelo menos uma imagem.');
        return;
    }

    const productData = {
        name: productNameInput.value.trim(),
        description: productDescriptionInput.value.trim(),
        price: parseFloat(productPriceInput.value),
        size: productSizeInput.value.trim(),
        featured: productFeaturedInput.checked
    };

    // Handle images - save all URLs in 'images' column and first in 'image_url'
    if (uploadedImageUrls.length > 0) {
        productData.images = uploadedImageUrls;
        productData.image_url = uploadedImageUrls[0];
    } else if (productImagesUrlsInput.value) {
        const urls = JSON.parse(productImagesUrlsInput.value);
        productData.images = urls;
        productData.image_url = urls[0];
    }

    console.log('[DEBUG] Dados a serem enviados:', productData);
    console.log('[DEBUG] uploadedImageUrls:', uploadedImageUrls);

    const url = currentProductId
        ? `/admin/products/${currentProductId}`
        : '/admin/products';

    const method = currentProductId ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
        .then(response => {
            if (response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/admin/login';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Erro: ' + data.error);
                return;
            }

            alert(currentProductId ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
            closeModal();
            location.reload(); // Reload to show updated list
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar produto.');
        });
}

function deleteProduct(productId) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }

    fetch(`/admin/products/${productId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/admin/login';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Erro: ' + data.error);
                return;
            }

            alert('Produto excluído com sucesso!');
            location.reload();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao excluir produto.');
        });
}

function toggleFeatured(productId) {
    fetch(`/admin/products/${productId}/toggle-featured`, {
        method: 'POST'
    })
        .then(response => {
            if (response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/admin/login';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Erro: ' + data.error);
                return;
            }

            alert('Destaque atualizado com sucesso!');
            location.reload();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao alternar destaque.');
        });
}

function cleanupFeatured() {
    if (!confirm('Isso vai remover o destaque de todos os produtos exceto o primeiro. Continuar?')) {
        return;
    }

    fetch('/admin/cleanup-featured', {
        method: 'POST'
    })
        .then(response => {
            if (response.status === 401) {
                alert('Sessão expirada. Faça login novamente.');
                window.location.href = '/admin/login';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Erro: ' + data.error);
                return;
            }

            alert(`${data.cleaned} produto(s) tiveram o destaque removido!`);
            location.reload();
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao limpar destaques.');
        });
}


