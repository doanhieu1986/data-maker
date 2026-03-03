function pushToDataLayer(eventName, params = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
}

function normalizeProduct(productLike) {
    const raw = String(productLike || '').toLowerCase();

    if (raw.includes('margin')) return { item_id: 'margin', item_name: 'Margin', price: 1000000 };
    if (raw.includes('fund') || raw.includes('chứng chỉ quỹ') || raw.includes('quỹ')) {
        return { item_id: 'fund', item_name: 'Chứng chỉ quỹ', price: 500000 };
    }
    if (raw.includes('derivatives') || raw.includes('phái sinh')) {
        return { item_id: 'derivatives', item_name: 'Phái sinh', price: 2000000 };
    }

    return { item_id: 'unknown', item_name: String(productLike || 'Unknown'), price: 0 };
}

function joinSelected(values) {
    const arr = (values || []).map(v => normalizeProduct(v).item_id).filter(Boolean);
    return arr.join('|');
}

// Xử lý toggle details cho sản phẩm (test click)
const toggleButtons = document.querySelectorAll('.toggle-details');
toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const details = document.getElementById(targetId);
        if (details) {
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        }

        // GA4 recommended event: select_item (ecommerce)
        const p = normalizeProduct(targetId);
        pushToDataLayer('select_item', {
            item_list_name: 'intro_products',
            items: [{ item_id: p.item_id, item_name: p.item_name }],
        });
    });
});

// Xử lý modal newsletter (test click)
const newsletterBtn = document.getElementById('newsletter-btn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');

if (newsletterBtn) {
    newsletterBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        // Custom event (không có recommended tương ứng cho "open modal")
        pushToDataLayer('newsletter_modal', { action: 'open', modal_name: 'newsletter', placement: 'intro_company' });
    });
}

if (closeModal) {
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        pushToDataLayer('newsletter_modal', { action: 'close', modal_name: 'newsletter', placement: 'intro_company' });
    });
}

// Track scroll depth (test scroll)
window.addEventListener('scroll', function() {
    const marker = document.getElementById('scroll-marker');
    if (marker) {
        const markerTop = marker.getBoundingClientRect().top;
        if (markerTop < window.innerHeight && !window.scrollTracked) {
            window.scrollTracked = true; // Chỉ track 1 lần
            pushToDataLayer('scroll_to_faq_end', { section: 'faq' });
        }
    }
});

// Các phần cũ cho form (nếu có ở các trang khác)
const openAccountForm = document.getElementById('openAccountForm');
if (openAccountForm) {
    openAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('message').textContent = 'Tài khoản đã được mở (giả lập)!';
        // GA4 recommended event: sign_up
        pushToDataLayer('sign_up', {
            method: 'open_account_form',
            form_id: 'openAccountForm',
            form_name: 'Open Account Form',
        });
    });
}

const registerProductsForm = document.getElementById('registerProductsForm');
if (registerProductsForm) {
    registerProductsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const selected = [];
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(cb => selected.push(cb.value));
        document.getElementById('message').textContent = `Đã đăng ký: ${selected.join(', ')} (giả lập)!`;

        // GA4 recommended event: generate_lead
        const products_selected = joinSelected(selected);
        pushToDataLayer('generate_lead', {
            lead_type: 'register_products',
            form_id: 'registerProductsForm',
            form_name: 'Register Products Form',
            products_selected,
            products_count: selected.length,
        });
    });
}

// Xử lý form mua hàng (test submit)
const purchaseForm = document.getElementById('purchaseForm');
if (purchaseForm) {
    purchaseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const product = document.querySelector('input[name="product"]:checked').value;
        const quantity = Number(document.getElementById('quantity').value || 1);
        document.getElementById('purchase-message').textContent = `Đã mua ${quantity} x ${product} (giả lập)!`;

        // GA4 recommended event: purchase (ecommerce)
        const p = normalizeProduct(product);
        const value = (p.price || 0) * quantity;
        const transaction_id = `T${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
        pushToDataLayer('purchase', {
            transaction_id,
            currency: 'VND',
            value,
            items: [
                {
                    item_id: p.item_id,
                    item_name: p.item_name,
                    price: p.price,
                    quantity,
                },
            ],
        });
    });
}

// JavaScript để xử lý form submission
// Thêm vào file script.js hoặc chạy riêng

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('consultationForm');
    const successMessage = document.getElementById('form-success-message');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Ngăn form submit mặc định
            
            // Lấy dữ liệu form
            const formData = new FormData(form);
            const formObject = {};
            
            // Chuyển FormData thành object
            formData.forEach((value, key) => {
                if (formObject[key]) {
                    // Nếu key đã tồn tại (như checkbox), chuyển thành array
                    if (Array.isArray(formObject[key])) {
                        formObject[key].push(value);
                    } else {
                        formObject[key] = [formObject[key], value];
                    }
                } else {
                    formObject[key] = value;
                }
            });
            
            // Log data ra console để kiểm tra
            console.log('Form Data:', formObject);
            
            // QUAN TRỌNG: Push event form_submit thủ công vì đã preventDefault()
            // GA4 Enhanced Measurement không tự động track khi dùng preventDefault()
            pushToDataLayer('form_submit', {
                form_id: 'consultationForm',
                form_name: 'Consultation Form',
                form_destination: window.location.href,
            });

            // GA4 recommended event: generate_lead
            const selectedProducts = Array.isArray(formObject.products)
                ? formObject.products
                : (formObject.products ? [formObject.products] : []);
            const products_selected = joinSelected(selectedProducts);
            pushToDataLayer('generate_lead', {
                lead_type: 'consultation',
                form_id: 'consultationForm',
                form_name: 'Consultation Form',
                investment_experience: formObject.investmentExperience || 'not_selected',
                investment_amount: formObject.investmentAmount || 'not_selected',
                products_selected,
                products_count: selectedProducts.length,
            });
            
            // Hiển thị thông báo thành công
            successMessage.style.display = 'block';
            
            // Ẩn form hoặc reset
            form.reset();
            
            // Scroll đến thông báo
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Tự động ẩn thông báo sau 5 giây
            setTimeout(function() {
                successMessage.style.display = 'none';
            }, 5000);
        });
        
        // Track form_start khi user bắt đầu điền form
        // GA4 Enhanced Measurement tự động track event này
        let formStartTracked = false;
        const formInputs = form.querySelectorAll('input, select, textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (!formStartTracked) {
                    formStartTracked = true;
                    console.log('Form interaction started - GA4 should auto-track form_start event');
                }
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('openAccountForm');
    const message = document.getElementById('message');

    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Ngăn reload trang (tùy chọn, nếu bạn muốn xử lý AJAX)

        // Lấy dữ liệu form (tùy chọn, để validate hoặc gửi server nếu cần)
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;

        // Kiểm tra form hợp lệ (tùy chọn)
        if (name && email && phone) {
            // KHÔNG gửi PII (name/email/phone) sang GA4.
            // GA4 recommended event: sign_up
            pushToDataLayer('sign_up', {
                method: 'open_account_form',
                form_id: 'openAccountForm',
                form_name: 'Open Account Form',
            });

            // Hiển thị thông báo thành công
            message.textContent = 'Tài khoản đã được mở thành công! Event đã được ghi nhận.';
            message.style.color = 'green';

            // Reset form (tùy chọn)
            form.reset();
        } else {
            message.textContent = 'Vui lòng điền đầy đủ thông tin.';
            message.style.color = 'red';
        }
    });
});