// Xử lý toggle details cho sản phẩm (test click)
const toggleButtons = document.querySelectorAll('.toggle-details');
toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const details = document.getElementById(targetId);
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
        // Push event cho GTM để track click
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({'event': 'product_details_click', 'product': targetId});
    });
});

// Xử lý modal newsletter (test click)
const newsletterBtn = document.getElementById('newsletter-btn');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');

if (newsletterBtn) {
    newsletterBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        // Push event cho GTM
        dataLayer.push({'event': 'newsletter_open'});
    });
}

if (closeModal) {
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        // Push event cho GTM
        dataLayer.push({'event': 'newsletter_close'});
    });
}

// Track scroll depth (test scroll)
window.addEventListener('scroll', function() {
    const marker = document.getElementById('scroll-marker');
    if (marker) {
        const markerTop = marker.getBoundingClientRect().top;
        if (markerTop < window.innerHeight && !window.scrollTracked) {
            window.scrollTracked = true; // Chỉ track 1 lần
            dataLayer.push({'event': 'scroll_to_faq_end'});
        }
    }
});

// Các phần cũ cho form (nếu có ở các trang khác)
const openAccountForm = document.getElementById('openAccountForm');
if (openAccountForm) {
    openAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        document.getElementById('message').textContent = 'Tài khoản đã được mở (giả lập)!';
        dataLayer.push({'event': 'open_account'});
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
        dataLayer.push({'event': 'register_product', 'products': selected});
    });
}

// Xử lý form mua hàng (test submit)
const purchaseForm = document.getElementById('purchaseForm');
if (purchaseForm) {
    purchaseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const product = document.querySelector('input[name="product"]:checked').value;
        const quantity = document.getElementById('quantity').value;
        document.getElementById('purchase-message').textContent = `Đã mua ${quantity} x ${product} (giả lập)!`;
        // Push event cho GTM
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({'event': 'purchase_product', 'product': product, 'quantity': quantity});
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
            
            // Push event vào dataLayer (GA4 Enhanced Measurement sẽ tự track form_start và form_submit)
            // Nhưng bạn có thể push thêm custom event nếu muốn
            if (typeof window.dataLayer !== 'undefined') {
                window.dataLayer.push({
                    'event': 'consultation_form_submit',
                    'form_name': 'Consultation Form',
                    'investment_experience': formObject.investmentExperience || 'not_selected',
                    'investment_amount': formObject.investmentAmount || 'not_selected'
                });
                
                console.log('Custom GA4 event pushed: consultation_form_submit');
            }
            
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
        // GA4 Enhanced Measurement đã tự động track, nhưng có thể custom thêm
        let formStartTracked = false;
        const formInputs = form.querySelectorAll('input, select, textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('focus', function() {
                if (!formStartTracked) {
                    formStartTracked = true;
                    
                    if (typeof window.dataLayer !== 'undefined') {
                        window.dataLayer.push({
                            'event': 'form_interaction_start',
                            'form_name': 'Consultation Form'
                        });
                        
                        console.log('Form interaction started');
                    }
                }
            });
        });
    }
});